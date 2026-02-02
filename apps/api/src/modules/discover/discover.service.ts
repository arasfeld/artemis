import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Match } from '../database/entities/match.entity';
import {
  Interaction,
  InteractionType,
} from '../database/entities/interaction.entity';
import { User } from '../database/entities/user.entity';
import { UserPhoto } from '../database/entities/user-photo.entity';
import { UserProfile } from '../database/entities/user-profile.entity';

export interface DiscoverProfile {
  age: number;
  firstName: string;
  genders: Array<{
    id: string;
    name: string;
  }>;
  id: string;
  location?: string;
  photos: Array<{
    displayOrder: number;
    id: string;
    url: string;
  }>;
  relationshipTypes?: { id: string; name: string }[];
}

export interface MatchedUser {
  firstName: string;
  id: string;
  photo: string | null;
}

export interface InteractionResult {
  match: { id: string; user: MatchedUser } | null;
}

export interface MatchResult {
  createdAt: Date;
  id: string;
  user: MatchedUser;
}

@Injectable()
export class DiscoverService {
  constructor(private readonly em: EntityManager) {}

  async getDiscoveryFeed(
    userId: string,
    limit: number = 10
  ): Promise<DiscoverProfile[]> {
    // Complex query to find potential matches:
    // 1. Completed profiles only (has firstName, dateOfBirth, genders, seeking, photos)
    // 2. Mutual gender preferences (user's seeking includes candidate's genders AND vice versa)
    // 3. Mutual age preferences
    // 4. Exclude users already interacted with (liked/passed)
    // 5. Exclude self

    const results = await this.em.getConnection().execute<
      Array<{
        age: number;
        first_name: string;
        location_country: string | null;
        user_id: string;
      }>
    >(
      `
      with user_data as (
        select
          up.user_id,
          up.date_of_birth,
          up.age_range_min,
          up.age_range_max,
          array_agg(distinct upg.gender_id) as user_genders,
          array_agg(distinct ups.gender_id) as user_seeking
        from user_profiles up
        left join user_profile_genders upg on upg.user_profile_user_id = up.user_id
        left join user_profile_seeking ups on ups.user_profile_user_id = up.user_id
        where up.user_id = ?
        group by up.user_id, up.date_of_birth, up.age_range_min, up.age_range_max
      ),
      candidates as (
        select
          up.user_id,
          up.first_name,
          extract(year from age(up.date_of_birth))::int as age,
          up.location_country,
          array_agg(distinct cpg.gender_id) as candidate_genders,
          array_agg(distinct cps.gender_id) as candidate_seeking
        from user_profiles up
        left join user_profile_genders cpg on cpg.user_profile_user_id = up.user_id
        left join user_profile_seeking cps on cps.user_profile_user_id = up.user_id
        left join user_photos uph on uph.user_profile_user_id = up.user_id
        where up.user_id != ?
          and up.first_name is not null
          and up.date_of_birth is not null
        group by up.user_id, up.first_name, up.date_of_birth, up.location_country
        having count(distinct uph.id) >= 1
      )
      select
        c.user_id,
        c.first_name,
        c.age,
        c.location_country
      from candidates c
      cross join user_data u
      where
        -- User's seeking includes at least one of candidate's genders
        u.user_seeking && c.candidate_genders
        -- Candidate's seeking includes at least one of user's genders
        and c.candidate_seeking && u.user_genders
        -- Candidate's age is within user's preferences
        and c.age between u.age_range_min and u.age_range_max
        -- User's age is within candidate's preferences
        and extract(year from age(u.date_of_birth))::int between
          (select age_range_min from user_profiles where user_id = c.user_id) and
          (select age_range_max from user_profiles where user_id = c.user_id)
        -- Not already interacted with
        and not exists (
          select 1 from interactions i
          where i.user_id = ? and i.target_user_id = c.user_id
        )
      order by random()
      limit ?
    `,
      [userId, userId, userId, limit]
    );

    // Fetch photos for each candidate
    const userIds = results.map((r) => r.user_id);
    if (userIds.length === 0) {
      return [];
    }

    const photos = await this.em.find(
      UserPhoto,
      {
        userProfile: { user: { id: { $in: userIds } } },
      },
      {
        orderBy: { displayOrder: 'ASC' },
      }
    );

    const photosByUser = new Map<
      string,
      Array<{ displayOrder: number; id: string; url: string }>
    >();
    for (const photo of photos) {
      const uid =
        (photo.userProfile as unknown as { user: { id: string } }).user?.id ||
        (photo.userProfile as unknown as { user: string }).user;
      if (!photosByUser.has(uid)) {
        photosByUser.set(uid, []);
      }
      photosByUser.get(uid)!.push({
        displayOrder: photo.displayOrder,
        id: photo.id,
        url: photo.url,
      });
    }

    // Fetch genders for each candidate
    const genderResults = await this.em.getConnection().execute<
      Array<{
        gender_id: string;
        gender_name: string;
        user_id: string;
      }>
    >(
      `
      select
        upg.user_profile_user_id as user_id,
        g.id as gender_id,
        g.name as gender_name
      from user_profile_genders upg
      join genders g on g.id = upg.gender_id
      where upg.user_profile_user_id = any(?)
      order by g.display_order
    `,
      [userIds]
    );

    const gendersByUser = new Map<
      string,
      Array<{ id: string; name: string }>
    >();
    for (const row of genderResults) {
      if (!gendersByUser.has(row.user_id)) {
        gendersByUser.set(row.user_id, []);
      }
      gendersByUser.get(row.user_id)!.push({
        id: row.gender_id,
        name: row.gender_name,
      });
    }

    // Fetch relationship options for each candidate
    const relResults = await this.em.getConnection().execute<
      Array<{
        user_id: string;
        relationship_type_id: string;
        name: string;
      }>
    >(
      `
        select
          upr.user_profile_user_id as user_id,
          rt.id as relationship_type_id,
          rt.name
        from user_profile_relationship_types upr
        join relationship_types rt on rt.id = upr.relationship_type_id
        where upr.user_profile_user_id = any(?)
      `,
      [userIds]
    );

    const relByUser = new Map<string, Array<{ id: string; name: string }>>();
    for (const row of relResults) {
      if (!relByUser.has(row.user_id)) relByUser.set(row.user_id, []);
      relByUser
        .get(row.user_id)!
        .push({ id: row.relationship_type_id, name: row.name });
    }

    return results.map((r) => ({
      age: r.age,
      firstName: r.first_name,
      genders: gendersByUser.get(r.user_id) || [],
      id: r.user_id,
      location: r.location_country || undefined,
      photos: photosByUser.get(r.user_id) || [],
      relationshipTypes: relByUser.get(r.user_id) || [],
    }));
  }

  async recordInteraction(
    userId: string,
    targetUserId: string,
    interactionType: InteractionType
  ): Promise<InteractionResult> {
    const user = await this.em.findOneOrFail(User, { id: userId });
    const targetUser = await this.em.findOneOrFail(User, { id: targetUserId });

    // Create or update interaction record
    let interaction = await this.em.findOne(Interaction, {
      interactionType,
      targetUser,
      user,
    });

    if (!interaction) {
      interaction = new Interaction({
        interactionType,
        targetUser,
        user,
      });
      this.em.persist(interaction);
    }

    await this.em.flush();

    // Check for mutual match if this was a like
    if (interactionType === InteractionType.LIKE) {
      const reciprocalLike = await this.em.findOne(Interaction, {
        interactionType: InteractionType.LIKE,
        targetUser: user,
        user: targetUser,
      });

      if (reciprocalLike) {
        // Create match (ensure user1 < user2 for uniqueness)
        const [matchUser1, matchUser2] =
          userId < targetUserId ? [user, targetUser] : [targetUser, user];

        const existingMatch = await this.em.findOne(Match, {
          user1: matchUser1,
          user2: matchUser2,
        });
        if (!existingMatch) {
          const match = new Match({ user1: matchUser1, user2: matchUser2 });
          this.em.persist(match);
          await this.em.flush();

          // Get matched user's profile info
          const matchedProfile = await this.em.findOne(
            UserProfile,
            {
              user: targetUser,
            },
            {
              populate: ['photos'],
            }
          );

          const primaryPhoto = matchedProfile?.photos
            .getItems()
            .find((p) => p.displayOrder === 0);

          return {
            match: {
              id: match.id,
              user: {
                firstName: matchedProfile?.firstName || '',
                id: targetUserId,
                photo: primaryPhoto?.url || null,
              },
            },
          };
        }
      }
    }

    return { match: null };
  }

  async getMatches(userId: string): Promise<MatchResult[]> {
    const user = await this.em.findOneOrFail(User, { id: userId });

    // Find all matches where user is either user1 or user2
    const matches = await this.em.find(
      Match,
      {
        $or: [{ user1: user }, { user2: user }],
      },
      {
        orderBy: { createdAt: 'DESC' },
        populate: ['user1', 'user2'],
      }
    );

    // Get profiles for matched users
    const results: MatchResult[] = [];

    for (const match of matches) {
      const matchedUser = match.user1.id === userId ? match.user2 : match.user1;

      const profile = await this.em.findOne(
        UserProfile,
        {
          user: matchedUser,
        },
        {
          populate: ['photos'],
        }
      );

      const primaryPhoto = profile?.photos
        .getItems()
        .find((p) => p.displayOrder === 0);

      results.push({
        createdAt: match.createdAt,
        id: match.id,
        user: {
          firstName: profile?.firstName || '',
          id: matchedUser.id,
          photo: primaryPhoto?.url || null,
        },
      });
    }

    return results;
  }
}

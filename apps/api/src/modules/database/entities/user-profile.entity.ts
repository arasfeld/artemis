import {
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToMany,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { Gender } from './gender.entity';
import { User } from './user.entity';
import { UserPhoto } from './user-photo.entity';

export enum RelationshipType {
  CASUAL = 'casual',
  SERIOUS = 'serious',
  FRIENDSHIP = 'friendship',
  UNSURE = 'unsure',
}

export enum LocationType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

@Entity({
  tableName: 'user_profiles',
  comment: 'User profile information collected during onboarding.',
})
export class UserProfile {
  @OneToOne({ entity: () => User, primary: true, cascade: [Cascade.REMOVE] })
  public user!: User;

  @Property({
    length: 50,
    nullable: true,
    comment: "User's first name for display.",
  })
  public firstName?: string;

  @Property({
    type: 'date',
    nullable: true,
    comment: "User's date of birth.",
  })
  public dateOfBirth?: Date;

  @ManyToMany({
    entity: () => Gender,
    pivotTable: 'user_profile_genders',
    joinColumn: 'user_profile_user_id',
    inverseJoinColumn: 'gender_id',
  })
  public genders = new Collection<Gender>(this);

  @ManyToMany({
    entity: () => Gender,
    pivotTable: 'user_profile_seeking',
    joinColumn: 'user_profile_user_id',
    inverseJoinColumn: 'gender_id',
  })
  public seeking = new Collection<Gender>(this);

  @Enum({
    items: () => RelationshipType,
    nullable: true,
    comment: 'Type of relationship the user is looking for.',
  })
  public relationshipType?: RelationshipType;

  @Property({
    columnType: 'int',
    default: 18,
    comment: 'Minimum age preference for matches.',
  })
  public ageRangeMin: number = 18;

  @Property({
    columnType: 'int',
    default: 45,
    comment: 'Maximum age preference for matches.',
  })
  public ageRangeMax: number = 45;

  @Enum({
    items: () => LocationType,
    nullable: true,
    comment: 'How location was determined.',
  })
  public locationType?: LocationType;

  @Property({
    length: 100,
    nullable: true,
    comment: 'Country name or code.',
  })
  public locationCountry?: string;

  @Property({
    length: 20,
    nullable: true,
    comment: 'Postal/ZIP code.',
  })
  public locationZipCode?: string;

  @Property({
    type: 'double',
    nullable: true,
    comment: 'Latitude coordinate.',
  })
  public locationLat?: number;

  @Property({
    type: 'double',
    nullable: true,
    comment: 'Longitude coordinate.',
  })
  public locationLng?: number;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  @OneToMany(() => UserPhoto, (photo) => photo.userProfile)
  public photos = new Collection<UserPhoto>(this);

  constructor(userProfile: Partial<UserProfile>) {
    Object.assign(this, userProfile);
  }
}

import {
  Cascade,
  Collection,
  Entity,
  Enum,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { User } from './user.entity';
import { UserPhoto } from './user-photo.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
}

export enum Seeking {
  MALE = 'male',
  FEMALE = 'female',
  EVERYONE = 'everyone',
}

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

  @Enum({
    items: () => Gender,
    nullable: true,
    comment: "User's gender identity.",
  })
  public gender?: Gender;

  @Enum({
    items: () => Seeking,
    nullable: true,
    comment: 'Gender(s) the user is seeking.',
  })
  public seeking?: Seeking;

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

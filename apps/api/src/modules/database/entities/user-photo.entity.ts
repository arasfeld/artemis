import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { UserProfile } from "./user-profile.entity";

@Entity({
  tableName: "user_photos",
  comment: "Photos uploaded by users for their profile.",
})
export class UserPhoto {
  @PrimaryKey({ type: "uuid" })
  public id: string = v4();

  @Index()
  @ManyToOne({ entity: () => UserProfile, cascade: [Cascade.REMOVE] })
  public userProfile!: UserProfile;

  @Property({
    length: 500,
    comment: "URL to the photo.",
  })
  public url!: string;

  @Property({
    columnType: "int",
    default: 0,
    comment: "Display order (0 = primary photo).",
  })
  public displayOrder: number = 0;

  @Property()
  public createdAt: Date = new Date();

  constructor(userPhoto: Partial<UserPhoto>) {
    Object.assign(this, userPhoto);
  }
}

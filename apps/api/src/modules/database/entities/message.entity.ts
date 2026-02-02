import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Match } from './match.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'messages',
  comment: 'Messages exchanged between matched users.',
})
export class Message {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @ManyToOne(() => Match)
  public match!: Match;

  @ManyToOne(() => User)
  public sender!: User;

  @Property({ type: 'text' })
  public content!: string;

  @Property()
  public createdAt: Date = new Date();

  @Property({ nullable: true })
  public readAt?: Date;

  constructor(message: Partial<Message>) {
    Object.assign(this, message);
  }
}

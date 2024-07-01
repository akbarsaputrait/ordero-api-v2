import { BaseEntity } from '@db/entities/base/base';
import { Media } from '@db/entities/core/media.entity';
import { Location } from '@db/entities/owner/location.entity';
import {
  Column,
  CoreEntity,
  DateTimeColumn,
  EmailColumn,
  ForeignColumn,
  NotNullColumn,
  PhoneColumn,
  StatusColumn,
} from '@lib/typeorm/decorators';
import { Exclude } from 'class-transformer';
import { JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Restaurant } from '../owner/restaurant.entity';
import { StaffRole } from './role.entity';

export enum StaffUserStatus {
  Active = 'active',
  Blocked = 'blocked',
}

@CoreEntity()
export class StaffUser extends BaseEntity {
  public static searchable = ['search'];

  @NotNullColumn()
  name: string;

  @EmailColumn({ unique: true })
  email: string;

  @PhoneColumn({ unique: true })
  phone: string;

  @Exclude()
  @NotNullColumn()
  password: string;

  @Exclude()
  @Column()
  reset_token: string;

  @Exclude()
  @DateTimeColumn()
  reset_token_expires: Date;

  @Exclude()
  @Column({ length: 20 })
  admin_code: string;

  @StatusColumn()
  status: StaffUserStatus;

  @DateTimeColumn()
  last_login_at: Date;

  @OneToOne(() => Media, (media) => media.staff_user, { eager: true })
  image: Media;

  @Exclude()
  @ForeignColumn()
  role_slug: string;

  @ManyToOne(() => StaffRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_slug', referencedColumnName: 'slug' })
  role: Promise<StaffRole>;

  @Exclude()
  @ForeignColumn()
  location_id: string;

  @ManyToOne(() => Location, { onDelete: 'SET NULL' })
  location: Promise<Location>;

  @Exclude()
  @ForeignColumn()
  restaurant_id: string;

  @ManyToOne(() => Restaurant, { onDelete: 'SET NULL' })
  restaurant: Promise<Restaurant>;

  get isBlocked() {
    return this.status === StaffUserStatus.Blocked;
  }

  get isActive() {
    return [StaffUserStatus.Active].includes(this.status);
  }

  get logName() {
    return `${this.name} <${this.email}>`;
  }
}

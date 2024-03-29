import { BaseEntity } from '@db/entities/base/base';
import {
  CoreEntity,
  CreateDateColumn,
  ForeignColumn,
  JsonColumn,
  NotNullColumn,
  UpdateDateColumn,
} from '@lib/typeorm/decorators';
import { Exclude } from 'class-transformer';
import { IsNull, ManyToOne } from 'typeorm';
import { Restaurant } from '../owner/restaurant.entity';

@CoreEntity()
export class Role extends BaseEntity {
  @NotNullColumn({ unique: true, length: 100 })
  slug: string;

  @JsonColumn()
  permissions: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Exclude()
  @ForeignColumn()
  restaurant_id: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  restaurant: Promise<Restaurant>;

  static async findBySlug(slug: string): Promise<Role> {
    return await Role.findOneBy({ slug });
  }

  static async findByRestaurant(rest: Restaurant): Promise<Role[]> {
    // find roles that belongs to company or default roles
    return await Role.find({ where: [{ restaurant_id: IsNull() }, { restaurant_id: rest.id }] });
  }
}

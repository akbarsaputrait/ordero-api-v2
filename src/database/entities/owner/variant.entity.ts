import { BaseEntity } from '@db/entities/base/base';
import { CoreEntity, ForeignColumn, NotNullColumn, PriceColumn } from '@lib/typeorm/decorators';
import { Exclude } from 'class-transformer';
import { JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { Restaurant } from './restaurant.entity';

export enum VariantStatus {
  Available = 'available',
  Unvailable = 'unavailable',
}

@CoreEntity()
export class Variant extends BaseEntity {
  @NotNullColumn()
  name: string;

  @PriceColumn()
  price: number;

  @NotNullColumn()
  status: VariantStatus;

  @Exclude()
  @ForeignColumn()
  restaurant_id: string;

  @JoinColumn()
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.variants)
  restaurant: Restaurant;

  @Exclude()
  @OneToMany(() => ProductCategory, (productCat) => productCat.category)
  products: Promise<ProductCategory[]>;
}

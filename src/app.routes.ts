import { Routes } from 'nest-router';
import { CustomerAuthModule } from './app/customer/auth/auth.module';
import { CustomerModule } from './app/customer/customer.module';
import { CustomerOrderModule } from './app/customer/order/order.module';
import { CustomerTableModule } from './app/customer/table/table.module';
import { OwnerAuthModule } from './app/owner/auth/auth.module';
import { OwnerModule } from './app/owner/owner.module';
import { OwnerProfileModule } from './app/owner/profile/profile.module';
import { OwnerCategoryModule } from './app/owner/restaurant/category/category.module';
import { OwnerLocationModule } from './app/owner/restaurant/location/location.module';
import { OwnerNotificationModule } from './app/owner/restaurant/notification/notification.module';
import { OwnerOrderModule } from './app/owner/restaurant/order/order.module';
import { OwnerProductModule } from './app/owner/restaurant/product/product.module';
import { OwnerRestaurantModule } from './app/owner/restaurant/restaurant.module';
import { OwnerStaffModule } from './app/owner/restaurant/staff/staff.module';
import { OwnerStockModule } from './app/owner/restaurant/stock/stock.module';
import { OwnerTableModule } from './app/owner/restaurant/table/table.module';
import { OwnerVariantModule } from './app/owner/restaurant/variant/variant.module';
import { RestaurantModule } from './app/restaurant/restaurant.module';
import { StaffAuthModule } from './app/staff/auth/auth.module';
import { StaffProfileModule } from './app/staff/profile/profile.module';
import { StaffRestaurantModule } from './app/staff/restaurant/restaurant.module';
import { StaffModule } from './app/staff/staff.module';

export const routes: Routes = [
  // { path: '/auth', module: AuthModule },
  // { path: '/me', module: ProfileModule },
  {
    path: '/owner',
    module: OwnerModule,
    children: [
      { path: '/auth', module: OwnerAuthModule },
      { path: '/me', module: OwnerProfileModule },
      {
        path: '/restaurants',
        module: OwnerRestaurantModule,
        children: [
          {
            path: '/:restaurant_id/locations',
            module: OwnerLocationModule,
          },
          {
            path: '/:restaurant_id/tables',
            module: OwnerTableModule,
          },
          {
            path: '/:restaurant_id/staff',
            module: OwnerStaffModule,
          },
          {
            path: '/:restaurant_id/categories',
            module: OwnerCategoryModule,
          },
          {
            path: '/:restaurant_id/variants',
            module: OwnerVariantModule,
          },
          {
            path: '/:restaurant_id/products',
            module: OwnerProductModule,
          },
          {
            path: '/:restaurant_id/stocks',
            module: OwnerStockModule,
          },
          {
            path: '/:restaurant_id/orders',
            module: OwnerOrderModule,
          },
          {
            path: '/:restaurant_id/notifications',
            module: OwnerNotificationModule,
          },
        ],
      },
    ],
  },

  {
    path: '/staff',
    module: StaffModule,
    children: [
      { path: '/auth', module: StaffAuthModule },
      { path: '/me', module: StaffProfileModule },
      {
        path: '/restaurants',
        module: StaffRestaurantModule,
        children: [
          {
            path: '/:restaurant_id/locations',
            module: OwnerLocationModule,
          },
          {
            path: '/:restaurant_id/tables',
            module: OwnerTableModule,
          },
          {
            path: '/:restaurant_id/staff',
            module: OwnerStaffModule,
          },
          {
            path: '/:restaurant_id/categories',
            module: OwnerCategoryModule,
          },
          {
            path: '/:restaurant_id/variants',
            module: OwnerVariantModule,
          },
          {
            path: '/:restaurant_id/products',
            module: OwnerProductModule,
          },
          {
            path: '/:restaurant_id/stocks',
            module: OwnerStockModule,
          },
        ],
      },
    ],
  },

  {
    path: '/restaurants',
    module: RestaurantModule,
  },
  {
    path: '/customers',
    module: CustomerModule,
    children: [
      {
        path: '/auth',
        module: CustomerAuthModule,
      },
      {
        path: '/orders',
        module: CustomerOrderModule,
      },
      {
        path: '/tables',
        module: CustomerTableModule,
      },
    ],
  },
];

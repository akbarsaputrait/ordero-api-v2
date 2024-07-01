import { Module } from '@nestjs/common';
import { StaffAuthModule } from './auth/auth.module';
import { StaffProfileModule } from './profile/profile.module';
import { StaffRestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [StaffAuthModule, StaffProfileModule, StaffRestaurantModule],
  controllers: [],
  providers: [],
})
export class StaffModule {}

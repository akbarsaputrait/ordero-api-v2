import { Module } from '@nestjs/common';
import { StaffRestaurantController } from './restaurant.controller';

@Module({
  imports: [],
  controllers: [StaffRestaurantController],
  providers: [],
})
export class StaffRestaurantModule {}

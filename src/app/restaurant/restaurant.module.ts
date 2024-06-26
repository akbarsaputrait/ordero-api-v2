import { Module } from '@nestjs/common';
import { DetailController } from './detail.controller';
import { LocationController } from './location.controller';
import { MenuController } from './menu.controller';
import { RestaurantController } from './restaurant.controller';

@Module({
  imports: [],
  controllers: [RestaurantController, DetailController, MenuController, LocationController],
  providers: [],
})
export class RestaurantModule {}

import { Module } from '@nestjs/common';
import { StaffProfileController } from './profile.controller';

@Module({
  controllers: [StaffProfileController],
})
export class StaffProfileModule {}

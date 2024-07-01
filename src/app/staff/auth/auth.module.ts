import { Module } from '@nestjs/common';
import { StaffAuthController } from './auth.controller';

@Module({
  controllers: [StaffAuthController],
})
export class StaffAuthModule {}

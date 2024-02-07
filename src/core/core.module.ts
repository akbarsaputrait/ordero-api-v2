import { storage } from '@config/storage.config';
import { MulterExtendedModule } from '@lib/multer-aws';
import { RBAcModule } from '@lib/rbac';
import AppDataSource from '@lib/typeorm/datasource.typeorm';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource } from 'typeorm';
import { AuthService } from './services/auth.service';
import { AwsService } from './services/aws.service';
import { RoleService } from './services/role.service';
import { TaskService } from './services/task.service';
import { JwtOwnerStrategy, JwtStrategy } from './services/token.service';

@Global()
@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({}),
    RBAcModule.register(RoleService),
    MulterExtendedModule.register(storage.aws),
  ],
  providers: [
    AwsService,
    TaskService,
    JwtStrategy,
    AuthService,
    RoleService,
    JwtOwnerStrategy,
    {
      provide: DataSource,
      useFactory: async () => {
        return AppDataSource;
      },
    },
  ],
  exports: [
    AwsService,
    TaskService,
    RoleService,
    AuthService,
    JwtStrategy,
    JwtOwnerStrategy,
    DataSource,
    RBAcModule,
    MulterExtendedModule,
  ],
})
export class CoreModule {}

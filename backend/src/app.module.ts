import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { App } from './entities/app.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppsModule } from './apps/apps.module';
import { AdminModule } from './admin/admin.module';
import { Domain } from './entities/domain.entity';
import { Quota } from './entities/quota.entity';
import { Statistic } from './entities/statistic.entity';
import { Infrastructure } from './entities/infrastructure.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3307,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hosting_db',
      entities: [User, App, Domain, Quota, Statistic, Infrastructure],
      synchronize: true, // Only for development/PFE context
    }),
    AuthModule,
    UsersModule,
    AppsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

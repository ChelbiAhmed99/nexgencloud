import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { App } from '../entities/app.entity';
import { Statistic } from '../entities/statistic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([App, Statistic])],
  providers: [AppsService],
  controllers: [AppsController],
})
export class AppsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { App } from '../entities/app.entity';
import { DockerModule } from '../docker/docker.module';

@Module({
  imports: [TypeOrmModule.forFeature([App]), DockerModule],
  providers: [AppsService],
  controllers: [AppsController],
})
export class AppsModule {}

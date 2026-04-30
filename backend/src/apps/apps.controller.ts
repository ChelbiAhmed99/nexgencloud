import { Controller, Get, Post, Body, Req, UseGuards, Param, Delete } from '@nestjs/common';
import { AppsService } from './apps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post('deploy')
  async deployApp(@Req() req, @Body() body: { name: string; dockerImage: string }) {
    return this.appsService.createApplication(req.user, body.name, body.dockerImage);
  }

  @Get()
  async getApps(@Req() req) {
    return this.appsService.getUserApps(req.user.id);
  }

  @Post(':id/stop')
  async stopApp(@Req() req, @Param('id') id: string) {
    return this.appsService.stopApplication(Number(id), req.user.id);
  }

  @Delete(':id')
  async deleteApp(@Req() req, @Param('id') id: string) {
    return this.appsService.removeApplication(Number(id), req.user.id);
  }
}

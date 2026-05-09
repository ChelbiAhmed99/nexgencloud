import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppsService } from './apps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('apps')
@Controller('apps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post('deploy')
  @HttpCode(202)
  @ApiOperation({ summary: 'Request app deployment asynchronously' })
  @ApiResponse({
    status: 202,
    description: 'Deployment requested successfully.',
  })
  @ApiResponse({ status: 500, description: 'Quota exceeded or server error.' })
  async deployApp(
    @Req() req,
    @Body() body: { name: string; dockerImage: string },
  ) {
    return this.appsService.createApplication(
      req.user,
      body.name,
      body.dockerImage,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all apps for the authenticated client' })
  @ApiResponse({ status: 200, description: 'List of apps.' })
  async getApps(@Req() req) {
    return this.appsService.getUserApps(req.user.id);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a running app' })
  @ApiResponse({ status: 200, description: 'App stopped.' })
  async stopApp(@Req() req, @Param('id') id: string) {
    return this.appsService.stopApplication(Number(id), req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an app' })
  @ApiResponse({ status: 200, description: 'App deleted.' })
  async deleteApp(@Req() req, @Param('id') id: string) {
    return this.appsService.removeApplication(Number(id), req.user.id);
  }

  @Post(':id/domain')
  @ApiOperation({ summary: 'Associate a custom domain to the app' })
  @ApiResponse({ status: 200, description: 'Domain successfully associated.' })
  async associateDomain(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { domain: string },
  ) {
    return this.appsService.associateDomain(
      Number(id),
      req.user.id,
      body.domain,
    );
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get time-series statistics for the app' })
  @ApiResponse({ status: 200, description: 'List of statistics data points.' })
  async getAppStats(@Req() req, @Param('id') id: string) {
    return this.appsService.getAppStats(Number(id), req.user.id);
  }
}

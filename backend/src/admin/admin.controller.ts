import { Controller, Get, Put, Delete, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// In a real app we would use a RolesGuard for Admin, but we use the JWT for now.

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users (Admin)' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update a user (Admin)' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; role?: string },
  ) {
    return this.adminService.updateUser(Number(id), body);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user (Admin)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(Number(id));
  }

  @Put('quotas/:userId')
  @ApiOperation({ summary: 'Update quotas for a user (Admin)' })
  @ApiResponse({ status: 200, description: 'Quota updated successfully.' })
  async updateQuotas(
    @Param('userId') userId: string,
    @Body() body: { storageLimit: number; instanceLimit: number },
  ) {
    return this.adminService.updateQuota(
      Number(userId),
      body.storageLimit,
      body.instanceLimit,
    );
  }

  @Get('infrastructure')
  @ApiOperation({ summary: 'Get infrastructure health status (Admin)' })
  @ApiResponse({ status: 200, description: 'Infrastructure status.' })
  async getInfrastructure() {
    return this.adminService.getInfrastructureHealth();
  }
}

import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.id);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isTwoFactorEnabled: user.isTwoFactorEnabled
    };
  }

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() body: { firstName: string; lastName: string }) {
    await this.usersService.update(req.user.id, {
      firstName: body.firstName,
      lastName: body.lastName
    });
    return this.getProfile(req);
  }
}

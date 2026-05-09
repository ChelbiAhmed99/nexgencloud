import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { TwoFactorService } from './services/two-factor.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async signup(@Body() userData: any) {
    const user = await this.authService.register(userData);
    return this.authService.login(user);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT access token.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      if (!req.user) {
        return res.redirect('http://localhost:4200/login?error=auth_failed');
      }
      const { access_token, user } = this.authService.login(req.user);
      if (user.isTwoFactorEnabled) {
        return res.redirect(
          `http://localhost:4200/login/2fa?token=${access_token}`,
        );
      }
      return res.redirect(
        `http://localhost:4200/login/success?token=${access_token}`,
      );
    } catch (error) {
      console.error('Google Auth Error:', error);
      return res.redirect('http://localhost:4200/login?error=server_error');
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth' })
  async githubAuth(@Req() req) {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res) {
    try {
      if (!req.user) {
        return res.redirect('http://localhost:4200/login?error=auth_failed');
      }
      const { access_token, user } = this.authService.login(req.user);
      if (user.isTwoFactorEnabled) {
        return res.redirect(
          `http://localhost:4200/login/2fa?token=${access_token}`,
        );
      }
      return res.redirect(
        `http://localhost:4200/login/success?token=${access_token}`,
      );
    } catch (error) {
      console.error('GitHub Auth Error:', error);
      return res.redirect('http://localhost:4200/login?error=server_error');
    }
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA Secret and QR Code' })
  @ApiResponse({
    status: 201,
    description: 'QR Code URL generated successfully.',
  })
  async register(@Req() req) {
    const { qrCodeUrl } = await this.twoFactorService.generateTwoFactorSecret(
      req.user.id,
      req.user.email,
    );
    return { qrCodeUrl };
  }

  @Post('2fa/turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA for the user' })
  @ApiResponse({ status: 200, description: '2FA turned on successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code.' })
  async turnOnTwoFactorAuthentication(
    @Req() req,
    @Body() body: { twoFactorCode: string },
  ) {
    const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(
      body.twoFactorCode,
      req.user.twoFactorSecret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(req.user.id);
    return { success: true };
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authenticate using 2FA code' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated, returns fully privileged JWT.',
  })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code.' })
  async authenticate(@Req() req, @Body() body: { twoFactorCode: string }) {
    const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(
      body.twoFactorCode,
      req.user.twoFactorSecret,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return this.authService.login(req.user, true);
  }
}

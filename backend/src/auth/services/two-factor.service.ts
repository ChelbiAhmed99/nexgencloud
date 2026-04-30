import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsersService } from '../../users/users.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {}

  async generateTwoFactorSecret(userId: number, email: string) {
    const secret = speakeasy.generateSecret({
      name: `HostingPlatform (${email})`,
    });

    await this.usersService.setTwoFactorAuthenticationSecret(
      secret.base32,
      userId,
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  isTwoFactorCodeValid(twoFactorCode: string, userSecret: string) {
    return speakeasy.totp.verify({
      secret: userSecret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 1, // allow 1 window of 30 seconds before/after
    });
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') ||
        'placeholder-client-id',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ||
        'placeholder-client-secret',
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, id } = profile;

      if (!emails || emails.length === 0) {
        return done(new Error('No email found in Google profile'), null);
      }

      const user = await this.authService.validateOAuthUser(
        emails[0].value,
        name?.givenName || 'Utilisateur',
        name?.familyName || 'Google',
        'google',
        id,
      );

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
}

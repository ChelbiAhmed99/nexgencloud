import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  private readonly logger = new Logger(MicrosoftStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const tenantId = configService.get<string>('MICROSOFT_TENANT_ID') || 'common';
    super({
      clientID:
        configService.get<string>('MICROSOFT_CLIENT_ID') ||
        'placeholder-microsoft-id',
      clientSecret:
        configService.get<string>('MICROSOFT_CLIENT_SECRET') ||
        'placeholder-microsoft-secret',
      callbackURL: 'http://localhost:3000/api/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: tenantId,
      authorizationURL:
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?prompt=select_account`,
      tokenURL:
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    try {
      const { displayName, emails, id } = profile;
      this.logger.log(`[Microsoft OAuth] Validating profile for ID: ${id}, displayName: ${displayName}`);

      // Microsoft profile may have emails in different formats
      const email =
        emails && emails[0]
          ? emails[0].value
          : profile._json?.mail || profile._json?.userPrincipalName;

      if (!email) {
        this.logger.error('[Microsoft OAuth] No email found in profile');
        return done(new Error('Aucun email trouvé dans le profil Microsoft'), null);
      }

      const nameParts = displayName ? displayName.split(' ') : ['Utilisateur', 'Microsoft'];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      this.logger.log(`[Microsoft OAuth] User validated: ${email} (${firstName} ${lastName})`);

      const user = await this.authService.validateOAuthUser(
        email,
        firstName,
        lastName,
        'microsoft',
        id,
      );

      return done(null, user);
    } catch (error) {
      this.logger.error(`[Microsoft OAuth] Validation failed: ${error.message}`, error.stack);
      return done(error, null);
    }
  }
}

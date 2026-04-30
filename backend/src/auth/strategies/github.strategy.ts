import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'placeholder-github-id',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || 'placeholder-github-secret',
      callbackURL: 'http://localhost:3000/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    const { displayName, emails, id, username } = profile;
    
    // GitHub might return multiple emails, we take the primary one or the first one
    const email = emails && emails[0] ? emails[0].value : `${username}@github.com`;
    const nameParts = displayName ? displayName.split(' ') : [username, ''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await this.authService.validateOAuthUser(
      email,
      firstName,
      lastName,
      'github',
      id
    );
    done(null, user);
  }
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userData: any): Promise<User> {
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Déterminer le rôle basé sur l'email
    const role =
      userData.email === 'admin@gmail.com' ? UserRole.ADMIN : UserRole.USER;

    return this.usersService.create({
      ...userData,
      role,
    });
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return user;
    }
    return null;
  }

  async validateOAuthUser(
    email: string,
    firstName: string,
    lastName: string,
    provider: 'google' | 'github' | 'microsoft',
    providerId: string,
  ): Promise<User> {
    try {
      this.logger.log(`[OAuth] validateOAuthUser called: provider=${provider}, email=${email}, providerId=${providerId}`);
      let user = await this.usersService.findByEmail(email);

      // Déterminer le rôle basé sur l'email
      const role = email === 'admin@gmail.com' ? UserRole.ADMIN : UserRole.USER;

      const providerIdField =
        provider === 'google'
          ? 'googleId'
          : provider === 'github'
            ? 'githubId'
            : 'microsoftId';

      const userData = {
        email,
        firstName,
        lastName,
        role: role,
        [providerIdField]: providerId,
      };

      if (!user) {
        this.logger.log(`[OAuth] Creating new user for ${email}`);
        user = await this.usersService.create({
          ...userData,
          password: 'oauth-placeholder-password',
        });
        this.logger.log(`[OAuth] User created successfully: id=${user.id}`);
      } else {
        this.logger.log(`[OAuth] Updating existing user: id=${user.id}`);
        // Mettre à jour les infos si l'utilisateur existe déjà
        user = await this.usersService.update(user.id, userData);
        this.logger.log(`[OAuth] User updated successfully`);
      }

      return user;
    } catch (error) {
      this.logger.error(`[OAuth] validateOAuthUser FAILED: ${error.message}`, error.stack);
      throw error;
    }
  }

  login(user: User, isTwoFactorAuthenticated = false, provider = 'local') {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      provider,
      isTwoFactorAuthenticated: !!isTwoFactorAuthenticated,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        provider,
      },
    };
  }
}

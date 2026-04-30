import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
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
    const role = userData.email === 'admin@gmail.com' ? UserRole.ADMIN : UserRole.USER;
    
    return this.usersService.create({
      ...userData,
      role
    });
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return user;
    }
    return null;
  }

  async validateOAuthUser(
    email: string,
    firstName: string,
    lastName: string,
    provider: 'google' | 'github',
    providerId: string,
  ): Promise<User> {
    let user = await this.usersService.findByEmail(email);

    // Déterminer le rôle basé sur l'email
    const role = email === 'admin@gmail.com' ? UserRole.ADMIN : UserRole.USER;

    const userData = {
      email,
      firstName,
      lastName,
      role: role,
      [provider === 'google' ? 'googleId' : 'githubId']: providerId,
    };

    if (!user) {
      user = await this.usersService.create({
        ...userData,
        password: 'oauth-placeholder-password',
      });
    } else {
      // Mettre à jour les infos si l'utilisateur existe déjà
      user = await this.usersService.update(user.id, userData);
    }

    return user;
  }

  login(user: User, isTwoFactorAuthenticated = false) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
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
      }
    };
  }
}

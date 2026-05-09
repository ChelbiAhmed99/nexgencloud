import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quota } from '../entities/quota.entity';
import { Infrastructure } from '../entities/infrastructure.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Quota)
    private readonly quotaRepository: Repository<Quota>,
    @InjectRepository(Infrastructure)
    private readonly infraRepository: Repository<Infrastructure>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateQuota(
    userId: number,
    storageLimit: number,
    instanceLimit: number,
  ): Promise<Quota> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    let quota = await this.quotaRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!quota) {
      quota = this.quotaRepository.create({
        user,
        storageLimit,
        instanceLimit,
      });
    } else {
      quota.storageLimit = storageLimit;
      quota.instanceLimit = instanceLimit;
    }

    // validateCoherence() logic here (e.g. check infra capacity)
    // For v1 we assume capacity is fine.

    return this.quotaRepository.save(quota);
  }

  async getInfrastructureHealth(): Promise<Infrastructure[]> {
    return this.infraRepository.find();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isTwoFactorEnabled',
        'createdAt',
      ],
    });
  }
}

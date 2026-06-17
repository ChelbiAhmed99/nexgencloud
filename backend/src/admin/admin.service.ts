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

  async getInfrastructureHealth(): Promise<any[]> {
    // Return simulated node data matching frontend expectations
    return [
      { name: 'Node-Primary-01', ip: '10.0.0.1', cpu: Math.floor(Math.random() * 40) + 30, ram: Math.floor(Math.random() * 30) + 50, containers: 24, status: 'online', uptime: '12d 4h' },
      { name: 'Node-Worker-02', ip: '10.0.0.2', cpu: Math.floor(Math.random() * 30) + 10, ram: Math.floor(Math.random() * 20) + 20, containers: 8, status: 'online', uptime: '45d 1h' },
      { name: 'Node-Worker-03', ip: '10.0.0.3', cpu: Math.floor(Math.random() * 50) + 40, ram: Math.floor(Math.random() * 40) + 50, containers: 42, status: 'online', uptime: '2d 18h' },
      { name: 'Node-Backup-01', ip: '10.0.0.4', cpu: 0, ram: 0, containers: 0, status: 'offline', uptime: '0s' }
    ];
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

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    await this.userRepository.remove(user);
  }

  async updateUser(
    userId: number,
    data: { firstName?: string; lastName?: string; role?: string },
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.role !== undefined) user.role = data.role as any;
    return this.userRepository.save(user);
  }
}

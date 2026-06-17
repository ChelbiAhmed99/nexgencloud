import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App, AppStatus } from '../entities/app.entity';
import { User } from '../entities/user.entity';
import { Statistic } from '../entities/statistic.entity';

@Injectable()
export class AppsService {
  private readonly logger = new Logger(AppsService.name);

  constructor(
    @InjectRepository(App)
    private readonly appsRepository: Repository<App>,
    @InjectRepository(Statistic)
    private readonly statsRepository: Repository<Statistic>,
  ) {}

  async createApplication(
    user: User,
    name: string,
    dockerImage: string,
  ): Promise<App> {
    // 0. Quota Check
    const userAppsCount = await this.appsRepository.count({
      where: { owner: { id: user.id } },
    });
    const MAX_APPS_QUOTA = 5;

    if (userAppsCount >= MAX_APPS_QUOTA) {
      throw new InternalServerErrorException(
        `Quota atteint : Vous ne pouvez pas déployer plus de ${MAX_APPS_QUOTA} applications.`,
      );
    }

    const containerName = `app-${user.id}-${Date.now()}`;
    
    // 1. Save intent to DB
    let app = this.appsRepository.create({
      name,
      dockerImage,
      containerName,
      owner: user,
      status: AppStatus.CREATING,
    });
    app = await this.appsRepository.save(app);

    // 2. Simulated Deployment (Avoiding Docker)
    this.logger.log(`[Simulation] Starting deployment for ${name} (${dockerImage})...`);
    
    setTimeout(async () => {
      try {
        // Mocking the time it takes to pull and start
        app.status = AppStatus.RUNNING;
        await this.appsRepository.save(app);
        this.logger.log(`[Simulation] App ${app.id} successfully "deployed" and running.`);
        
        // Create initial mock stats
        const initialStat = this.statsRepository.create({
          cpuUsage: Math.random() * 5,
          ramUsage: 128 + Math.random() * 64,
          bandwidth: 0,
          app: app,
        });
        await this.statsRepository.save(initialStat);
      } catch (error) {
        this.logger.error(`[Simulation] Failed to update app status: ${error.message}`);
      }
    }, 3000);

    return app;
  }

  async getUserApps(userId: number): Promise<App[]> {
    return this.appsRepository.find({ where: { owner: { id: userId } } });
  }

  async stopApplication(appId: number, userId: number): Promise<App> {
    const app = await this.appsRepository.findOne({
      where: { id: appId, owner: { id: userId } },
    });
    if (!app) throw new NotFoundException('App not found');

    this.logger.log(`[Simulation] Stopping application ${app.name}...`);
    app.status = AppStatus.STOPPED;
    return this.appsRepository.save(app);
  }

  async removeApplication(appId: number, userId: number): Promise<void> {
    const app = await this.appsRepository.findOne({
      where: { id: appId, owner: { id: userId } },
    });
    if (!app) throw new NotFoundException('App not found');

    this.logger.log(`[Simulation] Removing application ${app.name}...`);
    await this.appsRepository.remove(app);
  }

  async restartApplication(appId: number, userId: number): Promise<App> {
    const app = await this.appsRepository.findOne({
      where: { id: appId, owner: { id: userId } },
    });
    if (!app) throw new NotFoundException('App not found');

    this.logger.log(`[Simulation] Restarting application ${app.name}...`);
    app.status = AppStatus.CREATING;
    await this.appsRepository.save(app);

    // Simulate restart delay
    setTimeout(async () => {
      try {
        app.status = AppStatus.RUNNING;
        await this.appsRepository.save(app);
        this.logger.log(`[Simulation] App ${app.id} restarted successfully.`);
      } catch (error) {
        this.logger.error(`[Simulation] Failed to restart app: ${error.message}`);
      }
    }, 2000);

    return app;
  }

  async associateDomain(
    appId: number,
    userId: number,
    domainUrl: string,
  ): Promise<App> {
    const app = await this.appsRepository.findOne({
      where: { id: appId, owner: { id: userId } },
    });
    if (!app)
      throw new NotFoundException('App not found or does not belong to user');

    app.customDomain = domainUrl;
    return this.appsRepository.save(app);
  }

  async getAppStats(appId: number, userId: number): Promise<Statistic[]> {
    const app = await this.appsRepository.findOne({
      where: { id: appId, owner: { id: userId } },
    });
    if (!app)
      throw new NotFoundException('App not found or does not belong to user');

    return this.statsRepository.find({
      where: { app: { id: appId } },
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }
}

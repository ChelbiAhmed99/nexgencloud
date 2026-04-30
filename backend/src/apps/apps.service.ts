import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App, AppStatus } from '../entities/app.entity';
import { User } from '../entities/user.entity';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App)
    private readonly appsRepository: Repository<App>,
    private readonly dockerService: DockerService,
  ) {}

  async createApplication(user: User, name: string, dockerImage: string): Promise<App> {
    // 0. Quota Check (UML Requirement)
    const userAppsCount = await this.appsRepository.count({ where: { owner: { id: user.id } } });
    const MAX_APPS_QUOTA = 5; // This could be dynamic based on user tier

    if (userAppsCount >= MAX_APPS_QUOTA) {
      throw new InternalServerErrorException(`Quota atteint : Vous ne pouvez pas déployer plus de ${MAX_APPS_QUOTA} applications.`);
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

    // 2. Start container via Dockerode
    try {
      await this.dockerService.createAndStartContainer({
        image: dockerImage,
        containerName: containerName,
        labels: {
          'traefik.enable': 'true',
          [`traefik.http.routers.${containerName}.rule`]: `Host(\`${containerName}.localhost\`)`,
          [`traefik.http.services.${containerName}.loadbalancer.server.port`]: '80'
        }
      });

      // 3. Update status on success
      app.status = AppStatus.RUNNING;
      return this.appsRepository.save(app);
    } catch (error) {
      app.status = AppStatus.ERROR;
      await this.appsRepository.save(app);
      throw new InternalServerErrorException(`Échec du déploiement : ${error.message}`);
    }
  }

  async getUserApps(userId: number): Promise<App[]> {
    return this.appsRepository.find({ where: { owner: { id: userId } } });
  }

  async stopApplication(appId: number, userId: number): Promise<App> {
    const app = await this.appsRepository.findOne({ where: { id: appId, owner: { id: userId } } });
    if (!app) throw new NotFoundException('App not found');

    await this.dockerService.stopContainer(app.containerName);
    app.status = AppStatus.STOPPED;
    return this.appsRepository.save(app);
  }

  async removeApplication(appId: number, userId: number): Promise<void> {
    const app = await this.appsRepository.findOne({ where: { id: appId, owner: { id: userId } } });
    if (!app) throw new NotFoundException('App not found');

    await this.dockerService.removeContainer(app.containerName);
    await this.appsRepository.remove(app);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import Docker = require('dockerode');

@Injectable()
export class DockerService {
  private docker: Docker;
  private readonly logger = new Logger(DockerService.name);

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' }); // Assuming standard local socket for PFE
  }

  async createAndStartContainer(options: {
    image: string;
    containerName: string;
    envVars?: string[];
    labels?: { [key: string]: string };
  }) {
    try {
      this.logger.log(`Pulling image ${options.image}...`);
      await this.pullImage(options.image);

      this.logger.log(`Creating container ${options.containerName}...`);
      const container = await this.docker.createContainer({
        Image: options.image,
        name: options.containerName,
        Env: options.envVars || [],
        Labels: options.labels || {},
        HostConfig: {
          NetworkMode: 'hosting_network', // Will need to define a Docker network for Traefik routing later
          RestartPolicy: { Name: 'always' },
        },
      });

      this.logger.log(`Starting container ${options.containerName}...`);
      await container.start();
      
      return { success: true, containerId: container.id };
    } catch (error) {
      this.logger.error(`Failed to create/start container: ${error.message}`);
      throw error;
    }
  }

  async stopContainer(containerName: string) {
    try {
      const container = this.docker.getContainer(containerName);
      await container.stop();
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to stop container: ${error.message}`);
      throw error;
    }
  }

  async removeContainer(containerName: string) {
    try {
      const container = this.docker.getContainer(containerName);
      // Ensure it is stopped first (or force remove)
      try { await container.stop(); } catch (e) {}
      await container.remove();
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to remove container: ${error.message}`);
      throw error;
    }
  }

  async getContainerStats(containerName: string) {
    try {
      const container = this.docker.getContainer(containerName);
      const stats = await container.stats({ stream: false });
      return stats;
    } catch (error) {
       this.logger.error(`Failed to get stats: ${error.message}`);
       throw error;
    }
  }

  private pullImage(image: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        this.docker.modem.followProgress(stream, onFinished, onProgress);

        function onFinished(err, output) {
          if (err) return reject(err);
          resolve();
        }

        function onProgress(event) {
          // Can log download progress here if needed
        }
      });
    });
  }
}

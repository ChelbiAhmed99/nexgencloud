import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Sécurité : Ajouter des en-têtes de sécurité HTTP
  app.use(helmet());

  // Sécurité : Configurer le CORS pour n'accepter que le frontend
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Structure : Toutes les routes commencent par /api
  app.setGlobalPrefix('api');

  // Validation : Transformer et valider automatiquement les données entrantes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('SecureHost API')
    .setDescription('API for SecureHost Multi-tenant Web App Hosting Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Serveur de production prêt sur: http://localhost:${port}/api`);
  logger.log(
    `📚 Documentation OpenAPI disponible sur: http://localhost:${port}/api/docs`,
  );
}
bootstrap();

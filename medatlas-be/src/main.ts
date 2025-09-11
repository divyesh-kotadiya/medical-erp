import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors(configService.getCorsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(configService.getGlobalAPIPrefix());
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));

  const port = configService.getPort();
  const nodeEnv = configService.getNodeEnv();
  const databaseName = configService.getDatabaseName();

  await app.listen(port);

  console.log(`Server started successfully!`);
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Port: ${port}`);
  console.log(`Database: ${databaseName}`);
  console.log(`${configService.getEnvironmentWarning()}`);

  if (configService.isDevelopment()) {
    console.log(`Development mode`);
  } else if (configService.isStaging()) {
    console.log(`Staging mode: Test environment`);
  } else if (configService.isProduction()) {
    console.log(`Production mode: Live environment`);
  }
}

void bootstrap();

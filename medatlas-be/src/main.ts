import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors(configService.getCorsConfig());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix(configService.getGlobalAPIPrefix());

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

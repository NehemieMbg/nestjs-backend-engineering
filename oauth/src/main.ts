import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Bootstraps the NestJS application.
 */
async function bootstrap() {
  // Creates an instance of the NestJS application using the AppModule.
  const app: INestApplication<any> = await NestFactory.create(AppModule);

  // Applies global validation pipes for request validation.
  app.useGlobalPipes(new ValidationPipe());

  // Starts the application and listens on port 3000.
  await app.listen(3000);
}

bootstrap();

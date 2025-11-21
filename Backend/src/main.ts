import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Activar validación global decoradores de DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                // elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true,     // lanza error si hay propiedades no permitidas
      transform: true,                // transforma tipos automáticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

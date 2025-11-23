import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ❗ elimina automáticamente propiedades no definidas en el DTO
      forbidNonWhitelisted: false, // ❗ evita error si vienen propiedades extra
      transform: true, // ❗ convierte tipos automáticamente (ej: string → number)
      transformOptions: { enableImplicitConversion: true },
    })
  );

  app.enableCors({
    origin: "http://localhost:4200",
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

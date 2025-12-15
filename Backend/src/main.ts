import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import * as express from "express";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  process.env.TZ = "America/Santiago";
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // main.ts
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

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

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadConfig } from '@ai-tos/config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.CORS_ORIGIN, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swagger = new DocumentBuilder()
    .setTitle('AI-TOS API')
    .setDescription('AI Trading Operating System API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  app.enableShutdownHooks();
  await app.listen(config.PORT);
  console.log(`AI-TOS API listening on :${config.PORT} (env=${config.NODE_ENV})`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import compress from '@fastify/compress';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CustomLogger } from './shared/logger/custom-logger.service';
import { SERVICE_DESCRIPTION, SERVICE_NAME, SERVICE_PREFIX, SERVICE_VERSION } from './shared/constants/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 *  @description Archivo de entrada hacia la aplicación que utiliza la función central NestFactory 
 *  para crear una instancia de la aplicación Nest. 
 */
async function bootstrap() {
  const adapter = new FastifyAdapter({
    keepAliveTimeout: 65000,
    maxRequestsPerSocket: 100,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { logger: new CustomLogger() });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Registra el plugin de compresión
  await app.register(compress as any, {
    encodings: ['br'],
    global: true,
  });

  // Registra el plugin Helmet para seguridad
  const fastifyHelmetPlugin = require('@fastify/helmet');
  await app.register(fastifyHelmetPlugin, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });
  app.setGlobalPrefix(SERVICE_PREFIX);
  const configSwagger = new DocumentBuilder()
    .setTitle(SERVICE_NAME)
    .setDescription(SERVICE_DESCRIPTION)
    .setVersion(SERVICE_VERSION)
    .build();

  const documentSwagger = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, documentSwagger);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  app.use(
    helmet({
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
    }),
  );
}
bootstrap();

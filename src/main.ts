import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      files: 5,
      fileSize: 1 * 1024 * 1024, // 1MB
      fieldSize: 1024 * 1024,
    },
  });

  await app
    .listen(4040)
    .then(() => console.log(`appliction work on Port ${4040}`));
}
bootstrap();

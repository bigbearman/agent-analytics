import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });

  // Capture raw body for Stripe webhook signature verification
  adapter.getInstance().addHook(
    'preParsing',
    (
      req: import('fastify').FastifyRequest,
      _reply: import('fastify').FastifyReply,
      payload: import('stream').Readable,
      done: (err: null, stream: import('stream').Readable) => void,
    ) => {
      const chunks: Buffer[] = [];
      payload.on('data', (chunk: Buffer) => chunks.push(chunk));
      payload.on('end', () => {
        (req as import('fastify').FastifyRequest & { rawBody?: Buffer }).rawBody =
          Buffer.concat(chunks);
      });
      done(null, payload);
    },
  );

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3002);

  await app.listen(port, '0.0.0.0');
}

bootstrap();

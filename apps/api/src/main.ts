import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Preserve raw body for Stripe webhook signature verification
  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.removeContentTypeParser('application/json');
  fastifyInstance.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' as const },
    (req: { headers: Record<string, string | string[] | undefined> }, body: Buffer, done: (err: null, result: unknown) => void) => {
      if (req.headers['stripe-signature']) {
        (req as Record<string, unknown>).rawBody = body;
      }
      try {
        done(null, JSON.parse(body.toString()));
      } catch (e) {
        done(null, {});
      }
    },
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

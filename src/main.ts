import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: [
      'https://quiz-maker-mu.vercel.app',
      'http://localhost:3001',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Quiz Maker API')
    .setDescription('API documentation for the Quiz Maker application')
    .setVersion('1.0')
    .addTag('quiz')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

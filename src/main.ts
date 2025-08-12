import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Certificados API')
  .setDescription('API para gestionar certificados')
  .setVersion('2.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: "API certificados",
    swaggerOptions:{
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

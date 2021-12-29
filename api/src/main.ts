import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

import { AppModule } from './app.module';


async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const port = 3000;

  const config = new DocumentBuilder()
    .setTitle('Api - Game')
    .setDescription("Not much to say....")
    .setVersion("0.0.1")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync("./swagger-spec.json", JSON.stringify(document));
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, () => {
    console.log(`App listening at port: ${port}`);
  });
}
bootstrap();

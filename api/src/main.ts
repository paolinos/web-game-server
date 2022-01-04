import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

import { AppModule } from './app.module';
import { 
	PORT, 
	SWAGGER_TITLE,
	SWAGGER_DESCRIPTION,
	SWAGGER_VERSION,
	SWAGGER_PATH,
	SWAGGER_JSON_PATH
} from './consts';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//--------------------------------------------------------
	//	Swagger configuration
	const config = new DocumentBuilder()
		.setTitle(SWAGGER_TITLE)
		.setDescription(SWAGGER_DESCRIPTION)
		.setVersion(SWAGGER_VERSION)
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	writeFileSync(SWAGGER_JSON_PATH, JSON.stringify(document));
	SwaggerModule.setup(SWAGGER_PATH, app, document);

	await app.listen(PORT, () => {
		console.log(`App listening at port: ${PORT}`);
	});
}
bootstrap();

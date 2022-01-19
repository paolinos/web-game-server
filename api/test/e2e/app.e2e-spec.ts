import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthDto } from '../../src/core/auth/auth.dto';

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

  	describe('/auth', () => {
		it('/auth (POST) - With valid email', () => {
			const auth:AuthDto = new AuthDto();
			auth.email = "asd";

			return request(app.getHttpServer())
				.post('/auth').send(auth)
				.expect(200);
		});

		it('/auth (POST) - With not body', () => {
			return request(app.getHttpServer())
				.post('/auth')
				.expect(400);
		});

		it('/auth (POST) - with body but not email property', () => {
			return request(app.getHttpServer())
				.post('/auth').send({"other":"asd"})
				.expect(400);
		});
  	});
});
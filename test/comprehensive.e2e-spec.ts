import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/user/entities/user.entity';
import { DataSource } from 'typeorm';


describe('Comprehensive API Test (e2e)', () => {
    let app: INestApplication;
    let token: string;
    let userId: number;
    let routineId: number;
    let taskId: number;
    let oneOffTaskId: number;
    let accountId: number;

    const testUser = {
        fullName: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
    });

    afterAll(async () => {
        const dataSource = app.get(DataSource);
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
        await app.close();
    });

    describe('Authentication', () => {
        it('/auth/register (POST)', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send(testUser)
                .expect(201)
                .then(async (res) => {
                    expect(res.body).toHaveProperty('email', testUser.email);
                    // Manually verify user since we can't easily get the email token here
                    const userRepository = app.get(getRepositoryToken(User));
                    await userRepository.update({ email: testUser.email }, { isVerified: true });
                });
        });

        it('/auth/login (POST)', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200)
                .then(res => {
                    expect(res.body).toHaveProperty('accessToken');
                    token = res.body.accessToken;
                });
        });
    });

    describe('Routines', () => {
        it('/routines (POST)', () => {
            return request(app.getHttpServer())
                .post('/routines')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Morning Routine',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    tasks: [
                        {
                            title: 'Drink Water',
                            time: '07:00',
                            recurrence: 'daily'
                        }
                    ]
                })
                .expect(201)
                .then(res => {
                    expect(res.body).toHaveProperty('id');
                    routineId = res.body.id;
                    expect(res.body.tasks).toHaveLength(1);
                    taskId = res.body.tasks[0].id;
                    console.log(`Routine created with ID: ${routineId} and Task ID: ${taskId}`);
                });
        });

        it('/routines/active (GET)', () => {
            return request(app.getHttpServer())
                .get('/routines/active')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => {
                    expect(res.body).toHaveProperty('id', routineId);
                });
        });

        it('/routines/tasks/:id/check (POST)', () => {
            return request(app.getHttpServer())
                .post(`/routines/tasks/${taskId}/check`)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);
        });

        it('/routines/tasks/:id/uncheck (POST)', () => {
            return request(app.getHttpServer())
                .post(`/routines/tasks/${taskId}/uncheck`)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);
        });

        it('/routines (GET)', () => {
            return request(app.getHttpServer())
                .get('/routines')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('/routines/:id (GET)', () => {
            return request(app.getHttpServer())
                .get(`/routines/${routineId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => {
                    expect(res.body).toHaveProperty('id', routineId);
                });
        });

        it('/routines/:id/archive (PATCH)', () => {
            return request(app.getHttpServer())
                .patch(`/routines/${routineId}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('/routines/:id (DELETE)', () => {
            return request(app.getHttpServer())
                .delete(`/routines/${routineId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });
    });

    describe('Tasks (One-off)', () => {
        it('/tasks (POST)', () => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Buy Groceries',
                    description: 'Milk, Eggs',
                    dueDate: '2025-12-25'
                })
                .expect(201)
                .then(res => {
                    expect(res.body).toHaveProperty('id');
                    oneOffTaskId = res.body.id;
                });
        });

        it('/tasks (GET)', () => {
            return request(app.getHttpServer())
                .get('/tasks')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('/tasks/:id/complete (PATCH)', () => {
            return request(app.getHttpServer())
                .patch(`/tasks/${oneOffTaskId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('/tasks/:id (GET)', () => {
            return request(app.getHttpServer())
                .get(`/tasks/${oneOffTaskId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('/tasks/:id (PATCH)', () => {
            return request(app.getHttpServer())
                .patch(`/tasks/${oneOffTaskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Title' })
                .expect(200);
        });

        it('/tasks/:id (DELETE)', () => {
            return request(app.getHttpServer())
                .delete(`/tasks/${oneOffTaskId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });
    });

    describe('Journal', () => {
        it('/journal (POST)', () => {
            return request(app.getHttpServer())
                .post('/journal')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    learned: 'E2E Testing',
                    wellDone: 'Created tests',
                    toImprove: 'Coverage'
                })
                .expect(201);
        });

        it('/journal (GET)', () => {
            return request(app.getHttpServer())
                .get('/journal')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });
    });

    describe('Budget', () => {
        it('/budget/accounts (POST)', () => {
            return request(app.getHttpServer())
                .post('/budget/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Main Account',
                    type: 'CASH',
                    balance: 1000
                })
                .expect(201)
                .then(res => {
                    expect(res.body).toHaveProperty('id');
                    accountId = res.body.id;
                });
        });

        it('/budget/transactions (POST)', () => {
            return request(app.getHttpServer())
                .post('/budget/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: accountId,
                    type: 'EXPENSE',
                    amount: 50,
                    category: 'Food',
                    description: 'Lunch'
                })
                .expect(201);
        });

        it('/budget/accounts (GET)', () => {
            return request(app.getHttpServer())
                .get('/budget/accounts')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });

        it('/budget/transactions (GET)', () => {
            return request(app.getHttpServer())
                .get('/budget/transactions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });
    });
});

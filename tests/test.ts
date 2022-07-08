const request = require('supertest');
import app from '../src/index';
import { Server } from 'http';

describe('Tests', () => {
  let server: Server;
  let token: string;

  jest.setTimeout(15000);

  beforeAll(async function () {
    server = await (await Promise.resolve(app())).listen(80);
  });

  /*afterAll(async () => {
    await process.exit(1);
  });*/

  describe('Register test user /api/v1/users/register', () => {
    it('should register new user', async () => {
      return request(server)
        .post('/api/v1/users/register')
        .send({
          'name': 'Test1',
          'email': 'test@domain.com',
          'password': '123456789',
          'password_confirmation': '123456789'
        })
        .expect(204)
        .expect(400);
    });
  });

  describe('Login and get jwt token /api/v1/users/register', () => {
    it('should return token', async () => {
      const response = await request(server)
        .post('/api/v1/users/login')
        .send({
          'email': 'test@domain.com',
          'password': '123456789'
        })
        .expect(200);

      token = response.body.token;
      console.log(token);

      return response;
    });
  });

  describe('Create user /api/v1/users', () => {
    it('should create user', async () => {
      return request(server)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Create user /api/v1/users', () => {
    it('should return token', async () => {
      return request(server)
        .post('/api/v1/users/login')
        .set('Authorization', `Bearer ${token}`)
        .send({
          "type": "admin",
          "name": "testss",
          "email": "pstoswt@asdkfs.ey",
          "password": "123456",
          "passwordConfirmation": "123456"
        })
        .expect(401);
    });
  });

  describe('Index posts /api/v1/posts', () => {
    it('should return list of posts', async () => {
      return request(server)
        .get('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Create post /api/v1/posts', () => {
    it('should return token', async () => {
      return request(server)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          "title": "test title",
          "content": "test content",
          "isHidden": false,
          "authorId": 1
        })
        .expect(204);
    });
  });
});
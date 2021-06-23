import { Connection } from 'typeorm'
import request from 'supertest'

import { app } from '../../../../app'
import Connect from '../../../../database'

describe('Create a user in database', () => {
  let connection: Connection

  const user = {
    name: 'User Test',
    email: 'user@mail.com',
    password: '123456789'
  }

  beforeAll(async () => connection = await Connect())
  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to create a user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(user)
      .expect(201)
  })

  it('Should not be able to create a user if user already exists', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(user)
      .expect(400)
  })
})

import { Connection } from 'typeorm'
import request from 'supertest'

import { app } from '../../../../app'
import Connect from '../../../../database'
import { hashSync } from 'bcryptjs'
import { v4 as generateUUID } from 'uuid'


describe('Show user profile', () => {
  let connection: Connection
  let token: string

  const password = '123456789'
  const user = {
    id: generateUUID(),
    name: 'User Test',
    email: 'user@mail.com',
    password: hashSync(password, 8),
  }

  beforeAll(async () => {
    connection = await Connect()

    await connection
      .createQueryBuilder()
      .insert()
      .into('users')
      .values(user)
      .execute()

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({ email: user.email, password })

    token = `Bearer ${response.body.token}`
  })
  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to show the user profile', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set({ Authorization: token })
      .expect(200)

    expect(response.body).toHaveProperty('id', user.id)
  })
})

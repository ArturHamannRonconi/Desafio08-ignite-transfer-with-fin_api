import { Connection } from 'typeorm'
import request from 'supertest'

import { app } from '../../../../app'
import Connect from '../../../../database'
import { hashSync } from 'bcryptjs'
import { v4 as generateUUID } from 'uuid'


describe('Authenticate a user and return a token access', () => {
  let connection: Connection

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
  })
  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })


  it('Should be able to authenticate a user and return a token access', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({ email: user.email, password })
      .expect(200)

    expect(response.body).toHaveProperty('token')
  })

  it('Should not be able to authenticate a user if password is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: password.split('').reverse().join('')
      })
      .expect(401)

    expect(response.body).toHaveProperty('message', 'Incorrect email or password')
  })

  it('Should not be able to authenticate a user if email is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email.split('').reverse().join(''),
        password
      })
      .expect(401)

    expect(response.body).toHaveProperty('message', 'Incorrect email or password')
  })
})

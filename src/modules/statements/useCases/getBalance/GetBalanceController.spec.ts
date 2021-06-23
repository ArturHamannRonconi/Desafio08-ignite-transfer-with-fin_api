import { Connection } from 'typeorm'
import request from 'supertest'

import { app } from '../../../../app'
import Connect from '../../../../database'
import { hashSync } from 'bcryptjs'
import { v4 as generateUUID } from 'uuid'
import { Statement } from '../../entities/Statement'


describe('Create Statement', () => {
  let connection: Connection
  let token: string

  const password = '123456789'
  const user = {
    id: generateUUID(),
    name: 'User Test',
    email: 'user@mail.com',
    password: hashSync(password, 8),
  }
  const deposit = new Statement()
  Object.assign(deposit, {
    user_id: user.id,
    type: 'deposit',
    amount: 150,
    description: 'Any description'
  })
  const withdraw = new Statement()
  Object.assign(withdraw, {
    user_id: user.id,
    type: 'withdraw',
    amount: 50,
    description: 'Any description'
  })

  beforeAll(async () => {
    connection = await Connect()

    await connection
      .createQueryBuilder()
      .insert()
      .into('users')
      .values(user)
      .execute()

    const statement1 = connection
      .getRepository(Statement)
      .create(deposit)
    const statement2 = connection
      .getRepository(Statement)
      .create(withdraw)

    await connection
      .getRepository(Statement)
      .save([ statement1, statement2 ])

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({ email: user.email, password })

    token = `Bearer ${response.body.token}`
  })
  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to get the balance', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({ Authorization: token })
      .expect(200)

    expect(response.body.statement).toHaveLength(2)
  })
})

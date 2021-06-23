import { Connection } from 'typeorm'
import request from 'supertest'

import { app } from '../../../../app'
import Connect from '../../../../database'
import { hashSync } from 'bcryptjs'
import { v4 as generateUUID } from 'uuid'


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
  const deposit = {
    amount: 150,
    description: 'Any description'
  }
  const withdraw = {
    amount: 50,
    description: 'Any description'
  }
  const invalidWithdraw = {
    amount: 160,
    description: 'Any description'
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

  it('Should be able to create a deposit', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set({ Authorization: token })
      .send(deposit)
      .expect(201)

    expect(response.body).toHaveProperty('user_id', user.id)
    expect(response.body).toHaveProperty('type', 'deposit')
    expect(response.body).toHaveProperty('amount', deposit.amount)
  })

  it('Should be able to create a withdraw', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({ Authorization: token })
      .send(withdraw)
      .expect(201)

    expect(response.body).toHaveProperty('user_id', user.id)
    expect(response.body).toHaveProperty('type', 'withdraw')
    expect(response.body).toHaveProperty('amount', withdraw.amount)
  })

  it('Should not be able to create a withdraw if the balance is less than the amount', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({ Authorization: token })
      .send(invalidWithdraw)
      .expect(400)

    expect(response.body).toHaveProperty('message', 'Insufficient funds')
  })

})

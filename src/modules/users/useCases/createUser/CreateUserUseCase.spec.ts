import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { CreateUserError } from './CreateUserError'

describe('Create a new User', () => {
  let userRepository: InMemoryUsersRepository
  let createUserUserCase: CreateUserUseCase

  const user = {
    name: 'User Test',
    email: 'user@mail.com',
    password: '123456789'
  }
  const userAlreadyExists = {
    name: 'User Test',
    email: 'user@mail.com',
    password: '123456789'
  }

  beforeAll(() => {
    userRepository = new InMemoryUsersRepository()
    createUserUserCase = new CreateUserUseCase(userRepository)
  })

  it('Should be able to create a user', async () => {
    await createUserUserCase.execute(user)

    const newUser = await userRepository
      .findByEmail(user.email)

    expect(newUser).toHaveProperty('id')
  })
  
  it('Should not be able to create a user if the user already exists', async () => {
    await expect(() => createUserUserCase.execute(userAlreadyExists))
      .rejects
      .toBeInstanceOf(CreateUserError)
  })
})

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { CreateUserUseCase } from '../createUser/CreateUserUseCase'
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

describe('Authenticate user', () => {
  let userRepository: InMemoryUsersRepository
  let authenticateUserUserCase: AuthenticateUserUseCase

  const user = {
    name: 'User Test',
    email: 'user@mail.com',
    password: '123456789'
  }
  const userCredentials = {
    email: user.email,
    password: user.password
  }
  const userCredentialsWithInvalidEmail = {
    email: 'Invalid Email',
    password: user.password
  }
  const userCredentialsWithInvalidPassword = {
    email: user.email,
    password: user.password.split('').reverse().join('')
  }

  beforeAll(async () => {
    userRepository = new InMemoryUsersRepository()
    authenticateUserUserCase = new AuthenticateUserUseCase(userRepository)

    const createUserUseCase = new CreateUserUseCase(userRepository)
    await createUserUseCase.execute(user)
  })

  it('Should be able to authenticate the use', async () => {
    const response = await authenticateUserUserCase
      .execute(userCredentials)

    expect(response).toHaveProperty('token')
  })

  it('Should not be able to authenticate with invalid email', async () => {
    await expect(() => authenticateUserUserCase.execute(userCredentialsWithInvalidEmail))
      .rejects
      .toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('Should not be able to authenticate with invalid password', async () => {
    await expect(() => authenticateUserUserCase.execute(userCredentialsWithInvalidPassword))
      .rejects
      .toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})

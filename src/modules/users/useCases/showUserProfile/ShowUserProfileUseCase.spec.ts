import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

describe('Show user profile', () => {
  let userRepository:InMemoryUsersRepository
  let showUserProfileUseCase: ShowUserProfileUseCase
  let user_id: string | undefined

  const user = {
    name: 'User Test',
    email: 'user@mail.com',
    password: '123456789'
  }
  const userCredentials = {
    email: user.email,
    password: user.password
  }

  beforeAll(async () => {
    userRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepository)

    const createUserUseCase = new CreateUserUseCase(userRepository)
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository)

    await createUserUseCase.execute(user)
    const response = await authenticateUserUseCase
      .execute(userCredentials)

    user_id = response.user?.id
  })

  it('Should be able to show user profile', async () => {
    const user = await showUserProfileUseCase.execute(user_id as string)

    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email', user.email)
  })

  it('Should not be able to show user profile if user not exists', async () => {
    await expect(() => showUserProfileUseCase.execute('user_id that not exists'))
      .rejects
      .toBeInstanceOf(ShowUserProfileError)
  })
})


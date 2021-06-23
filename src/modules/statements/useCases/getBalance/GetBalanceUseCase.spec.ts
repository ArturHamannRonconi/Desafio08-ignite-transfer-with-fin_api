import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

describe('Get the balance', () => {
  let statementRepository: InMemoryStatementsRepository
  let usersRepository: InMemoryUsersRepository
  let getBalanceUseCase: GetBalanceUseCase
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
    statementRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementRepository, usersRepository)

    const createUserUseCase = new CreateUserUseCase(usersRepository)
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)

    await createUserUseCase.execute(user)
    const response = await authenticateUserUseCase
      .execute(userCredentials)

    user_id = response.user?.id
  })

  it('Should be able to get the balance', async () => {
    const response = await getBalanceUseCase
      .execute({ user_id: user_id as string })

    expect(response).toHaveProperty('balance')
    expect(response).toHaveProperty('statement')
  })

  it('Should be able to get the balance', async () => {
    await expect(() => getBalanceUseCase
      .execute({ user_id: 'user_id that is Invalid'})
    )
    .rejects
    .toBeInstanceOf(GetBalanceError)
  })
})

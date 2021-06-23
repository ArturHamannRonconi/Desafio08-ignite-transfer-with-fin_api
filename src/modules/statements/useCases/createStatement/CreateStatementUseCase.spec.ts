import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateStatementError } from './CreateStatementError'

describe('Create a statement', () => {
  let statementRepository: InMemoryStatementsRepository
  let usersRepository: InMemoryUsersRepository
  let createStatementUseCase: CreateStatementUseCase
  let user_id: string | undefined
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

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
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementRepository)

    const createUserUseCase = new CreateUserUseCase(usersRepository)
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)

    await createUserUseCase.execute(user)
    const response = await authenticateUserUseCase
      .execute(userCredentials)

    user_id = response.user?.id
  })

  it('Should be able to create a deposit', async () => {
    const depositStatement = await createStatementUseCase
      .execute({
        user_id: user_id as string,
        type: OperationType.DEPOSIT,
        amount: 1500,
        description: 'any Description'
      })

    expect(depositStatement).toHaveProperty('id')
    expect(depositStatement).toHaveProperty('type', OperationType.DEPOSIT)
  })

  it('Should be able to create a withdraw', async () => {
    const depositStatement = await createStatementUseCase
      .execute({
        user_id: user_id as string,
        type: OperationType.WITHDRAW,
        amount: 500,
        description: 'any Description'
      })

    expect(depositStatement).toHaveProperty('id')
    expect(depositStatement).toHaveProperty('type', OperationType.WITHDRAW)
  })

  it('Should not be able to create a deposit if user not exists', async () => {
    await expect(() => createStatementUseCase
      .execute({
        user_id: 'user_id that not exists',
        type: OperationType.DEPOSIT,
        amount: 500,
        description: 'any Description'
      })
    )
    .rejects
    .toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('Should not be able to create a withdraw if the balance is less than the amount', async () => {
    await expect(() => createStatementUseCase
      .execute({
        user_id: user_id as string,
        type: OperationType.WITHDRAW,
        amount: 1100,
        description: 'any Description'
      })
    )
    .rejects
    .toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})

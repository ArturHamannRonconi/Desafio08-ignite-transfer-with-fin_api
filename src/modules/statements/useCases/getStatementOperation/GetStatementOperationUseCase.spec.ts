import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

describe('Get statement operation', () => {
  let statementRepository: InMemoryStatementsRepository
  let usersRepository: InMemoryUsersRepository
  let getStatementOperationUseCase: GetStatementOperationUseCase
  let user_id: string | undefined
  let statement_id: string | undefined
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementRepository
    )

    const createUserUseCase = new CreateUserUseCase(usersRepository)
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
    const createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    )

    await createUserUseCase.execute(user)
    const response = await authenticateUserUseCase
      .execute(userCredentials)

    user_id = response.user?.id

    const response_2 = await createStatementUseCase
      .execute({
        user_id: user_id as string,
        type: OperationType.DEPOSIT,
        amount: 1500,
        description: 'any Description'
      })

    statement_id = response_2?.id
  })

  it('Should be able to get statement operation', async () => {
    const response = await getStatementOperationUseCase.execute({
      user_id: user_id as string,
      statement_id: statement_id as string
    })

    expect(response.type).toBe(OperationType.DEPOSIT)
  })

  it('Should not be able to get statement operation if user not exsits', async () => {
    await expect(() => getStatementOperationUseCase.execute({
      user_id: 'ID that is Invalid',
      statement_id: statement_id as string
    }))
      .rejects
      .toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('Should not be able to get statement operation if statement not exsits', async () => {
    await expect(() => getStatementOperationUseCase.execute({
      user_id: user_id as string,
      statement_id: 'ID that is Invalid'
    }))
      .rejects
      .toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })

})

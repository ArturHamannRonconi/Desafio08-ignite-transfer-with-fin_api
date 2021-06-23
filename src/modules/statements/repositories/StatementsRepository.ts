import { getRepository, Repository } from "typeorm"

import { Statement } from "../entities/Statement"
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO"
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO"
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO"
import { IStatementsRepository } from "./IStatementsRepository"

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>

  constructor() {
    this.repository = getRepository(Statement)
  }

  async create(createStatement: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create(createStatement)
    return this.repository.save(statement)
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    })
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const deposit_withdraw_statement = await this.repository.find({
      where: { user_id }
    })

    const receiver_statement = await this.repository.find({
      where: { receiver_id: user_id }
    })

    const statement = [...deposit_withdraw_statement, ...receiver_statement]


    const balance = statement.reduce((acc, operation) => {

      const operationIsDeposit = operation.type === 'deposit'
      const operationIsWithDraw = operation.type === 'withdraw'
      const operationIsTrasnfer = operation.type === 'transfer'
      const userIsSender = operation.sender_id === user_id
      const userIsReceiver = operation.receiver_id === user_id

      if(operationIsDeposit || (operationIsTrasnfer && userIsReceiver))
        acc += operation.amount

      if(operationIsWithDraw || (operationIsTrasnfer && userIsSender))
        acc -= operation.amount

      return acc
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}

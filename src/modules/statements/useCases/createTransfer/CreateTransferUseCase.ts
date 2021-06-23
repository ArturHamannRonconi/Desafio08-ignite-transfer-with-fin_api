import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import Dealers from "./Dealers";
import Transfer from "./Transfer";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

@injectable()
class CreateTransferUseCase
{
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {  }

  public async execute({ amount, description }: Transfer, { sender_id, receiver_id }: Dealers)
  {
    await this.verifyUsersExists({ sender_id, receiver_id })
    this.verifyUsersAreTheSame({ sender_id, receiver_id })
    await this.verifyIfHasPositiveBalance(sender_id, amount)
    const transfer = await this
      .createTransfer({ amount, description }, { sender_id, receiver_id })

    return transfer
  }

  private async verifyUsersExists({ sender_id, receiver_id }: Dealers): Promise<void>
  {
    const [ sender, receiver ] = await Promise.all([
      this.usersRepository.findById(sender_id),
      this.usersRepository.findById(receiver_id)
    ])

    if(!sender) throw new CreateTransferError.SenderNotFound()
    if(!receiver) throw new CreateTransferError.ReceiverNotFound()
  }

  private async verifyUsersAreTheSame({ sender_id, receiver_id }: Dealers): Promise<void>
  {
    if(sender_id === receiver_id)
      throw new CreateTransferError.TheSameAccount()
  }

  private async verifyIfHasPositiveBalance(sender_id: string, amount: number): Promise<void>
  {
    const { balance } =  await this
      .statementsRepository
      .getUserBalance({ user_id: sender_id })

    if(balance < amount) throw new CreateTransferError.InsufficientFunds()
  }

  private async createTransfer({ amount, description }: Transfer, { sender_id, receiver_id }: Dealers): Promise<Statement>
  {
    const statement = await this.statementsRepository.create({
      amount,
      description,
      sender_id,
      receiver_id,
      type: OperationType.TRANSFER,
      user_id: sender_id
    })

    return statement
  }
}

export default CreateTransferUseCase

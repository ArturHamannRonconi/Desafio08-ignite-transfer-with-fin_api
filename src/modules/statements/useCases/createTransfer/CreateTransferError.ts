import { AppError } from "../../../../shared/errors/AppError"

export namespace CreateTransferError
{
  export class SenderNotFound extends AppError
  {
    constructor()
    {
      super('Sender not found', 404)
      Object.setPrototypeOf(this, SenderNotFound.prototype)
    }
  }

  export class ReceiverNotFound extends AppError
  {
    constructor()
    {
      super('Receiver not found', 404)
      Object.setPrototypeOf(this, ReceiverNotFound.prototype)
    }
  }

  export class InsufficientFunds extends AppError
  {
    constructor()
    {
      super('Insufficient funds', 400)
      Object.setPrototypeOf(this, InsufficientFunds.prototype)
    }
  }

  export class TheSameAccount extends AppError
  {
    constructor()
    {
      super('Not possible to transfer to the same account', 409)
      Object.setPrototypeOf(this, TheSameAccount.prototype)
    }
  }
}

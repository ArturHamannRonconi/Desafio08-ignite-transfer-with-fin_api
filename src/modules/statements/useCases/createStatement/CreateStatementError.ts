import { AppError } from "../../../../shared/errors/AppError"

export namespace CreateStatementError
{
  export class UserNotFound extends AppError
  {
    constructor()
    {
      super('User not found', 404)
      Object.setPrototypeOf(this, UserNotFound.prototype)
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
}

import { AppError } from "../../../../shared/errors/AppError"

export class CreateUserError extends AppError
{
  constructor()
  {
    super('User already exists')
    Object.setPrototypeOf(this, CreateUserError.prototype)
  }
}

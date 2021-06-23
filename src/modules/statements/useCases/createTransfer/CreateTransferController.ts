import { Request, Response } from "express";
import { container } from "tsyringe";
import CreateTransferUseCase from "./CreateTransferUseCase";

class CreateTransferController
{
  public async handle(request: Request, response: Response): Promise<Response>
  {
    const { amount, description } = request.body
    const { user_id: receiver_id } = request.params
    const { id: sender_id } = request.user

    const createTransferUseCase = container.resolve(CreateTransferUseCase)
    const transfer = await createTransferUseCase.execute(
      { amount, description },
      { sender_id, receiver_id }
    )

    return response.status(201).json(transfer)
  }
}

export { CreateTransferController }

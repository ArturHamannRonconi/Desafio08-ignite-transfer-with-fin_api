import { Statement } from "../../entities/Statement"

export type ICreateStatementDTO =
Pick<
  Statement,
  'user_id' |
  'description' |
  'amount' |
  'type'
> | Pick<
Statement,
'user_id' |
'description' |
'amount' |
'type' |
'sender_id' |
'receiver_id'
>


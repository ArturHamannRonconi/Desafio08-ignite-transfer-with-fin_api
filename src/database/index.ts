import { createConnection, getConnectionOptions } from 'typeorm'

export default async () => {
  const connectionOptions = await getConnectionOptions()

  if(process.env.NODE_ENV === 'test')
    Object.assign(connectionOptions, {
      database: 'fin_api_test',
      port: 5433
    })

  return await createConnection(connectionOptions)
}

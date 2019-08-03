/*
 * Funktion, die den Datensatz verarbeitet und
 *    {success: Boolean, result: Any}
 * zurückgibt oder einen Fehler wirft
 */
import Log from '../../log'
import Executor from './Executor'
import { getMessage } from '../api/api-dashboard'
import { getQueuename, errorHandler } from './utils'

const log = Log('nurLog')

export const nurLog = async (record) => {
  log.trace('Record', record)
  const { ID, ENVIRONMENT, OPERATION, MESSAGE, SENDERFQN } = record
  const { messageType } = record.filter

  const execute = new Executor('Nur Log')

  try {
    await execute.step('ermittle Queuename', async () => {
      return await getQueuename(execute, MESSAGE, OPERATION, SENDERFQN)
    })

    await execute.step('get Message', () => getMessage(ENVIRONMENT, messageType, ID))
  } catch (err) {
    await errorHandler(execute, err)
  }

  return execute.getResults()
}

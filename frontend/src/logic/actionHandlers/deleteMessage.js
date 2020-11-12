/*
 * Funktion, die den Datensatz verarbeitet und
 *    {success: Boolean, result: Any}
 * zurückgibt oder einen Fehler wirft
 */
import Log from '../../log'
import { deleteMessage, doNotFindMessage, getMessage } from '../api/api-dashboard'
import Executor from './Executor'
import { errorHandler } from './utils'

const log = Log('deletemessages')

export const deleteMessages = async (record) => {
  log.trace('Record', record)
  const { ID, ENVIRONMENT } = record
  const { messageType } = record.filter

  const execute = new Executor('Delete Message')

  try {
    /* 1 */
    await execute.step('get Message', () => getMessage(ENVIRONMENT, messageType, ID))

    /* 2 */
    await execute.step('delete Message', () => deleteMessage(ENVIRONMENT, messageType, ID))

    /* 3 */
    await execute.step('check Message deleted', () => doNotFindMessage(ENVIRONMENT, messageType, ID))

  } catch (err) {
    /* ERROR */ await errorHandler(execute, err)
  }

  return execute.getResults()
}

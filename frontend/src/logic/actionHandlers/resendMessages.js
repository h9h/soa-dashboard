/*
 * Funktion, die den Datensatz verarbeitet und
 *    {success: Boolean, result: Any}
 * zurückgibt oder einen Fehler wirft
 */
import Log from '../../log'
import { deleteMessage, doNotFindMessage, getMessage, resendMessage } from '../api/api-dashboard'
import Executor from './Executor'
import { errorHandler, getQueuename } from './utils'

const log = Log('resendmessages')

export const resendMessages = withQueueMessage => async (record) => {
  log.trace('Record', record)
  const { ID, ENVIRONMENT, MEP, OPERATION, MESSAGE, SENDERFQN } = record
  const { messageType } = record.filter
  const mep = !MEP || MEP.indexOf('unbekannt') > -1 ? 'fireAndForget' : MEP

  const execute = new Executor('Resend Message' + (withQueueMessage ? '' : ' (Message aus Job-Data)'))

  try {
    /* 1 */
    await execute.step('ermittle Queuename', async () => {
      return await getQueuename(execute, MESSAGE, OPERATION, SENDERFQN)
    })

    if (withQueueMessage) {
      /* 2 */
      const data = await execute.step('get Message', () => getMessage(ENVIRONMENT, messageType, ID))
      execute.setValue('message', data ? data.MESSAGE : null)
    } else {
      execute.setValue('message', MESSAGE)
    }

    /* 2/3 */
    await execute.step('resend Message', () => resendMessage(
      ENVIRONMENT,
      mep,
      OPERATION,
      {
        queuename: execute.getValue('queuename'),
        topicname: execute.getValue('topicname'),
      },
      execute.getValue('message')))

    /* 3/4 */
    await execute.step('delete Message', () => deleteMessage(ENVIRONMENT, messageType, ID))

    /* 4/5 */
    await execute.step('check Message deleted', () => doNotFindMessage(ENVIRONMENT, messageType, ID))

  } catch (err) {
    /* ERROR */ await errorHandler(execute, err)
  }

  return execute.getResults()
}

import { parse } from '../../logic/xml'
import jp from 'jsonpath'
import { getModelvalue, MODELS } from './models'

/**
 * Nehme eine Message entgegen und gebe ein Object mit den Werten des zum Array fields aus der Message zurück.
 * Genommen wird unabhängig von Position in der Message der Wert des ersten Tags, der mit dem jeweiligen
 * Objekt-Key übereinstimmt.
 *
 * @param message die Service-Message
 * @param fields ein Objekt mit Keys für welche man Werte möchte
 */
export const parseMessage = (message, fields) => {
  const json = parse(message)

  return fields.reduce((acc, key) => {
    const values = jp.query(json, `$..${key}`)
    acc[key] = values.length > 0 ? values[0] : null
    return acc
  }, {})
}

function getFehlermeldung (senderFQN, SENDERFQN, meldung) {
  const fehlermeldung = `${meldung} für SenderFQN "${senderFQN}"/"${SENDERFQN}"`
  return {success: false, result: fehlermeldung, fehlermeldung}
}

export async function getQueuename (execute, MESSAGE, OPERATION, SENDERFQN) {
  let fields
  try {
    fields = parseMessage(MESSAGE, ['senderFQN'])
  } catch (_) {
    fields = {senderFQN: MESSAGE.senderFQN}
  }
  if (!fields.senderFQN) {
    return getFehlermeldung(fields.senderFQN, SENDERFQN, 'senderFQN nicht ermittelbar')
  }

  const values = await getModelvalue(MODELS.SENDERFQN_2_QUEUENAME, fields.senderFQN)
  if (!values) {
    return getFehlermeldung(fields.senderFQN, SENDERFQN, 'Keine Werte zu SenderFQN modelliert')
  }

  if (typeof values === 'string') {
    execute.setValue('queuename', values)
    return {success: true, result: {operation: OPERATION, senderFQN: SENDERFQN, queuename: values}}
  } else {
    if (values.QueueName) {
      execute.setValue('queuename', values.QueueName)
    }
    if (values.TopicName) {
      execute.setValue('topicname', values.TopicName)
    }

    if (!values.QueueName && !values.TopicName) return getFehlermeldung(fields.senderFQN, SENDERFQN, 'Queue-/Topicname nicht modelliert')

    return {
      success: true,
      result: {
        operation: OPERATION,
        senderFQN: SENDERFQN,
        queuename: values.QueueName,
        topicname: values.TopicName
      }
    }
  }
}

export const errorHandler = async (execute, err) => {
  await execute.step('Errorhandler', () => {
    return {success: false, result: err.message, fehlermeldung: err.message}
  })
}

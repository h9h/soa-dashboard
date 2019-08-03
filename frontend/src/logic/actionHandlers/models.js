import { getModel } from '../api/rest-api-local'
import Log from '../../log'

const log = Log('models')

const Models = new Map()

export const MODELS = {
  SENDERFQN_2_QUEUENAME: 'SenderFQN2QueueName'
}

export const getModelvalue = async (modelname, key) => {
  if (Models.has(modelname)) return Models.get(modelname)[key]

  const model = await getModel(modelname)
  if (model) {
    log.trace('caching Model', modelname, model)
    Models.set(modelname, JSON.parse(model))
    return Models.get(modelname)[key]
  }

  throw new Error(`Missing Model-Value ${modelname}.${key}`)
}

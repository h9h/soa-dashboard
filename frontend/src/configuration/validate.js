import { Validator } from 'jsonschema'
import { CONFIGURATION_SCHEMA, DEFINITIONS } from './constants'

export const validateConfiguration = o => {
  const v = new Validator()
  Object.keys(DEFINITIONS).forEach(k => {
    v.addSchema(DEFINITIONS[k], DEFINITIONS[k].id)
  })

  return v.validate(o, CONFIGURATION_SCHEMA)
}

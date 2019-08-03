import { validateConfiguration } from './validate'
import {initialize } from './useConfiguration'

import { defaultConfiguration } from './constants'

initialize()

export { useConfiguration, getConfiguration, setConfiguration } from './useConfiguration'

export const test = {
  defaultConfiguration,
  validateConfiguration
}

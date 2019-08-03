import moment from 'moment'
import { logToFile } from '../api/rest-api-local'

export const EVENTS = {
  START: 'start',
  ERROR: 'error',
  END: 'end',
  LIST: 'list'
}

export function getJobLogName (jobname, aktionname) {
  const job = jobname.indexOf('.job.json') === jobname.length - 9 ? jobname.substring(0, jobname.length - 9) : jobname
  return `${job}.${aktionname}.${moment().format('HHmmss')}`
}

export const DEFAULT_CONFIG = {
  stopIfErrCountGreater: 10
}

export class Job {
  /**
   * Konstruktor eines Jobs
   *
   * @param records Array der zu verarbeitenden Daten
   * @param handler Function, die den Datensatz verarbeitet und {success: Boolean, result: Any} zurückgibt
   *        oder einen Fehler wirft
   * @param listener eine Callback Funktion { timestamp, event, data }
   * @param config Konfiguration, @see(DEFAULT_CONFIG)
   */
  constructor(records, handler, listener = fileListener(getJobLogName('Job', 'GENERIC')), config = {}) {
    this.records = records
    this.handler = handler
    this.listener = listener
    this.results = []
    this.messageIDs = []
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.errorCount = 0
    this.aborted = { aborted: false, reason: '' }
  }

  abort = reason => {
    this.aborted = { aborted: true, reason }
  }

  /**
   * Verarbeitet den nächsten anstehenden Satz, falls es weitere gibt
   * @returns {boolean} true, falls noch Verarbeitung ausstehend, false wenn fertig
   */
  next = async () => {
    if (this.aborted.aborted) throw Error(this.aborted.reason)
    if (this.config.stopIfErrCountGreater > 0 && this.errorCount > this.config.stopIfErrCountGreater) {
      const reason = `Errorcount exceeded limit: ${this.config.stopIfErrCountGreater}`
      this.aborted = { aborted: true, reason }
      throw Error(reason)
    }

    const index = this.results.length
    if (index >= this.records.length) return false

    const record = this.records[index]
    this.listener(EVENTS.START, { index, record })

    const work = async () => {
      try {
        const {success, result} = await this.handler(record)
        this.messageIDs.push([record.MESSAGEID, success])
        return { index, success, result }
      } catch (error) {
        this.listener(EVENTS.ERROR, { index, error })
        return { index, success: false, result: error }
      }
    }

    const out = await work()
    if (!out.success) this.errorCount++
    this.listener(EVENTS.END, out)
    this.results.push(out)

    return (this.results.length < this.records.length)
  }

  getResults = () => {
    this.listener(EVENTS.LIST, { messageIds: this.messageIDs })
    return {
      results: [...this.results],
      abort: this.aborted,
      messageIDs: this.messageIDs
    }
  }
}

export const fileListener = destination => {
  const ltf = logToFile(destination)
  return (event, data) => {
    const result = { logEvent: event, ...data }
    if (event === EVENTS.LIST) result.job = destination
    ltf(result)
  }
}

import Log from '../../log'

class Executor {
  constructor (jobname) {
    this.log = Log(jobname)
    this.jobname = jobname
    this.index = 0
    this.results = {
      success: true,
      result: {['' + this.index + '-Job ' + this.jobname]: {job: this.jobname, timestamp: Date.now()}}
    }
    this.log.trace('constructor Executor', this.index, jobname)
    this.values = new Map()
  }

  setValue = (key, value) => this.values.set(key, value)
  getValue = key => this.values.get(key)

  step = async (stepname, stepFn) => {
    // wenn ein Fehler aufgetreten ist, wird nicht weiter ausgeführt
    if (!this.successful()) return null

    // ausführen
    const {success, result, fehlermeldung} = await stepFn()
    if (fehlermeldung) this.setValue('fehlermeldung', fehlermeldung)
    this.results.success = this.results.success && success
    this.index++
    const data = typeof result === 'object' ? result : {result}
    this.results.result['' + this.index + '-' + stepname] = {step: stepname, timestamp: Date.now(), ...data}
    this.log.trace('step', this.index, stepname, success, result)
    return data
  }

  successful = () => this.results.success

  getResults = () => {
    const key = this.successful() ? 'OK' : 'FEHLER'
    this.results.result[key] = {
      meldung: this.successful() ? 'Erfolgreich durchgeführt' : this.getValue('fehlermeldung') || ('Fehler aufgetreten, siehe Ergebnisse unter Schritt ' + this.index),
      values: [...this.values.entries()].reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})
    }
    return this.results
  }
}

export default Executor

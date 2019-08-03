import moment from 'moment'
// import crossfilter from 'crossfilter2'

const TIMEFORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'

const prop = (data, key) => data.reduce((acc, item) => {
  acc.push(item[key])
  return acc
}, [])

export const getTimespan = (data, fieldname) => {
  const propArray = prop(data, fieldname)
  return [propArray.reduce((acc, item) => item < acc ? item : acc, Number.MAX_SAFE_INTEGER), propArray.reduce((acc, item) => item > acc ? item : acc, Number.MIN_SAFE_INTEGER)]
}

export class Timestep {
  constructor (timerangeInMinutes) {
    this.timestep = timerangeInMinutes > 45 ? '1m' : timerangeInMinutes < 3 ? '1s' : '10s'
  }

  quantizeTime () {
    switch (this.timestep) {
      case '1s':
        return time => moment(time, 'x').startOf('second')
      case '10s':
        return time => {
          const t = moment(time, 'x')
          t.subtract(t.seconds() % 10, 'seconds')
          t.subtract(t.milliseconds(), 'milliseconds')
          return t
        }
      default: // minute - '1m'
        return time => moment(time, TIMEFORMAT).startOf('minute')
    }
  }

  formatTime () {
    if (this.timestep === '1m') {
      return mom => mom.format('YYYY-MM-DDTHH:mm')
    } else {
      return mom => mom.format('YYYY-MM-DDTHH:mm:ss')
    }
  }

  getMoment () {
    if (this.timestep === '1m') {
      return time => moment(time, 'YYYY-MM-DDTHH:mm')
    } else {
      return time => moment(time, 'YYYY-MM-DDTHH:mm:ss')
    }
  }

  toHHmm () {
    if (this.timestep === '1m') {
      return timestring => moment(timestring, 'YYYY-MM-DDTHH:mm').format('HH:mm')
    } else {
      return timestring => moment(timestring, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')
    }
  }

  toNextTickTimestring () {
    return time => this.formatTime()(this.step()(this.getMoment()(time)))
  }

  step () {
    switch (this.timestep) {
      case '1s':
        return time => time.add(1, 'seconds')
      case '10s':
        return time => time.add(10, 'seconds')
      default: // minute - '1m'
        return time => time.add(1, 'minutes')
    }
  }

  getTick () {
    return time => this.formatTime()(this.quantizeTime()(time))
  }

  getTimerange (low, high) {
    const quantizer = this.quantizeTime()
    const formatter = this.formatTime()
    const step = this.step()

    const start = quantizer(low)
    const end = quantizer(high)

    const result = []
    while (start <= end) {
      result.push(formatter(start))
      step(start)
    }
    return result
  }
}

export const getStatistik = (data) => {
  if (!data || data.length === 0) {
    return { isEmpty: true }
  }


  /*
  const ndx = crossfilter(data)

  const dimensions = {
    Timestamp: ndx.dimension(d => d.Timestamp),
    second: ndx.dimension(d => moment(d.Timestamp).startOf('second')),
    MESSAGEID: ndx.dimension(d => d.MESSAGEID)
  }
  */

  let anzahl = 0
  const messageSet = new Set()

  const counted = data.reduce((acc, point) => {
    const ts = moment(point.Timestamp).startOf('second').format('YYYY-MM-DDTHH:mm:ss')

    if (!acc[ts]) acc[ts] = {
      messageAnzahl: 0,
      faultAnzahl: 0
    }

    // Zähle eindeutige MessageIds
    if (!messageSet.has(point.MESSAGEID)) {
      messageSet.add(point.MESSAGEID)
      acc[ts].messageAnzahl++
    }

    // Zähle logpoints, differenziert, ob Fault oder nicht
    if (parseInt(point.LOGPOINTNO, 10) > 50) {
      acc[ts].faultAnzahl++
    }
    anzahl++
    return acc
  }, {})

  const statistik = []
  Object.keys(counted).forEach(x => {
    statistik.push({
      time: x,
      anzahlMessages: counted[x].messageAnzahl,
      anzahlFaultpoints: counted[x].faultAnzahl,
    })
  })

  return {
    isEmpty: anzahl === 0,
    statistik,
  }
}

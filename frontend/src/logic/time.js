import moment from 'moment'

export const TIME_FORMAT = 'HH:mm:ss'

export const convertToMoment = raw => {
  const inputFormat = raw.length > 25 ? 'YYYY-MM-DDTHH:mm:ss.SSSZ' : 'YYYY-MM-DDTHH:mm:ssZ'
  return moment(raw, inputFormat)
}

export const getDuration = duration => time => {
  return {
    duration,
    bis: time.format(TIME_FORMAT),
    von: defaultSubtract(duration)(time).format(TIME_FORMAT)
  }
}

export const getDurationUnitText = unit => {
  switch(unit) {
    case "seconds": return "Sekunden"
    case "hours": return "Stunden"
    default: return "Minuten"
  }
}

export const getDurations = unit => {
  switch(unit) {
    case "seconds": return [60, 120]
    case "hours": return [1, 2, 6, 12]
    default: return [10, 30, 60]
  }
}
export const defaultSubtract = duration => mom => {
  return moment(mom).subtract(duration.anzahl, duration.unit)
}

export const widenTime = widenFilter => (von, bis) => {
  const { anzahlVor, anzahlZurueck, unit } = widenFilter
  return {
    von: moment(von, TIME_FORMAT).subtract(anzahlZurueck, unit).format(TIME_FORMAT),
    bis: moment(bis, TIME_FORMAT).add(anzahlVor, unit).format(TIME_FORMAT)
  }
}

export const calculateNewDates = (state, key, value) => {
  const stateVon = moment(state.datumVon, 'YYYY-MM-DD')
  const stateBis = moment(state.datumBis, 'YYYY-MM-DD')

  const newDate = moment(value, 'YYYY-MM-DD')

  if (key === 'datumVon') {
    if (newDate <= stateBis) {
      return { datumVon: value, datumBis: state.datumBis }
    } else {
      const diff = stateBis.diff(stateVon, 'days')
      return {
        datumVon: value,
        datumBis: newDate.add(diff, 'days').format('YYYY-MM-DD'),
      }
    }
  }

  if (key === 'datumBis') {
    if (newDate >= stateVon) {
      return { datumVon: state.datumVon, datumBis: value }
    } else {
      const diff = stateBis.diff(stateVon, 'days')
      return {
        datumVon: newDate.subtract(diff, 'days').format('YYYY-MM-DD'),
        datumBis: value
      }
    }
  }

  return {
    datumVon: state.datumVon,
    datumBis: state.datumBis
  }
}

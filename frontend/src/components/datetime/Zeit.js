import React from 'react'
import Flatpickr from 'react-flatpickr'
import { German } from 'flatpickr/dist/l10n/de'
import moment from 'moment'
import { TIME_FORMAT } from '../../logic/time'

const Options = {
  locale: German,
  enableTime: true,
  enableSeconds: TIME_FORMAT !== 'HH:mm',
  noCalendar: true,
  dateFormat: TIME_FORMAT === 'HH:mm' ? 'H:i' : 'H:i:S',
  time_24hr: true,
}

const Zeit = props => {
  const {date, setDate, ...rest} = props

  const options = {...Options, ...rest, defaultDate: date}

  const handleChange = v => {
    const value = v[0]
    const d = moment(value).format(TIME_FORMAT)
    setDate(d)
  }

  return (
    <Flatpickr className="time"
               value={date}
               options={options}
               onChange={handleChange}
    />
  )
}

export default Zeit

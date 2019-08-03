import React from 'react'
import Flatpickr from 'react-flatpickr'
import { German } from 'flatpickr/dist/l10n/de'
import moment from 'moment'

const Options = {
  locale: German,
  dateFormat: 'd.m.Y',
}

const Datum = props => {
  const {date, setDate, ...rest} = props
  const options = {...Options, ...rest, defaultDate: moment(date, 'YYYY-MM-DD').format('DD.MM.YYYY')}

  const handleChange = v => {
    const value = v[0]
    const d = moment(value).format('YYYY-MM-DD')
    setDate(d)
  }

  return (
    <Flatpickr
      value={moment(date, 'YYYY-MM-DD').format('DD.MM.YYYY')}
      options={options}
      onChange={handleChange}/>
  )
}

export default Datum

// set default locale
import * as d3 from 'd3'
import { getColor, getLengthColors } from './utils'
import { range } from 'ramda'
import DataContext from './DataContext'
import React from 'react'
import moment from 'moment'

const formatMillisecond = d3.timeFormat('.%L')
const formatSecond = d3.timeFormat(':%S')
const formatMinute = date => moment(date).format('HH:mm')
const formatHour = date => moment(date).format('HH')
const formatDay = date => moment(date).locale('de').format('dd DD.MM.')
const formatMonth = d3.timeFormat('%B')
const formatYear = d3.timeFormat('%Y')

export function multiFormat (date) {
  return (d3.timeSecond(date) < date ? formatMillisecond
    : d3.timeMinute(date) < date ? formatSecond
      : d3.timeHour(date) < date ? formatMinute
        : d3.timeDay(date) < date ? formatHour
          : d3.timeMonth(date) < date ?  formatDay
            : d3.timeYear(date) < date ? formatMonth
              : formatYear)(date)
}

// export const printFilter = (filter, top = 10) => {
//   /* eslint-disable */
//   let f = eval(filter)
//   /* eslint-enable */
//
//   if (f.top) { f = f.top(top) }
//   if (f.dimension) {f = f.dimension(() => '').top(top) }
//   return (filter + '(' + f.length + ') = '
//     + json2string(f)
//       .replace('[', '[\n\t')
//       .replace(/},/g, '},\n\t')
//       .replace(']', '\n]'))
// }

export const getColorFunction = colorScheme => {
  const colorFn = getColor(colorScheme)
  return range(0, getLengthColors(colorScheme) - 1).map(colorFn)
}

export const reduceAverage = attr => ([
  function add (p, v) {
    ++p.count
    p.sum += v[attr]
    p.avg = p.count > 0 ? p.sum / p.count : 0
    return p
  },
  function remove (p, v) {
    --p.count
    p.sum -= v[attr]
    p.avg = p.count > 0 ? p.sum / p.count : 0
    return p
  },
  function init () {
    return {count: 0, sum: 0, avg: 0}
  }
])

export const reduceAverageWeighted = attr => ([
  function add (p, v) {
    p.count += v.ANZAHLGESAMT
    p.sum += v.ANZAHLGESAMT * v[attr]
    p.avg = p.count > 0 ? p.sum / p.count : 0
    return p
  },
  function remove (p, v) {
    p.count -= v.ANZAHLGESAMT
    p.sum -= v.ANZAHLGESAMT * v[attr]
    p.avg = p.count > 0 ? p.sum / p.count : 0
    return p
  },
  function init () {
    return {count: 0, sum: 0, avg: 0}
  }
])

export const reduceIdentity = () => ([
  () => 1,
  () => 0,
  () => 0
])

export const renderPlot = (data, colorScheme) => renderChart => (
  <DataContext dimensions={data.dims}
               zeitDomain={[moment(data.datumVon, 'YYYY-MM-DD').startOf('day').toDate(), moment(data.datumBis, 'YYYY-MM-DD').endOf('day').toDate()]}
               renderChart={renderChart}
               colorScheme={colorScheme}
  />
)

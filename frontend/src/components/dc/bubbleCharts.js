import { getColorFunction } from './dcUtils'
import dc from 'dc'
import * as d3 from 'd3'
import moment from 'moment'

const createBubbleChart = (div, colorScheme, legend = d => d.name) => {
  const colors = getColorFunction(colorScheme)

  const chart = dc.bubbleChart(div)

  chart.margins().left = 75 // damit y-Axis Labels nicht abgeschnitten werden
  chart.margins().right = 75 // damit y-Axis Labels nicht abgeschnitten werden

  chart
    .ordinalColors(colors)
    .elasticRadius(true)
    .legend(dc.legend().itemHeight(13).gap(5).legendText(legend))

  return chart
}

const reduce = [
  function add (p, v) {
    console.log('add', v)
    return p
  },
  function remove (p, v) {
    console.log('remove', v)
    return p
  },
  function init () {
    return 0
  }
]

export const renderBubbleChartTimingBus = (div, ndx, dimensions, colorScheme) => {
  const chart = createBubbleChart(div, colorScheme)

  const zeitDim = dimensions.zeit
  const minDate = moment(zeitDim.bottom(1)[0].Date).startOf('day').toDate()
  const maxDate = moment(zeitDim.top(1)[0].Date).endOf('day').toDate()

  const anzahl = zeitDim.group().reduce(reduce)

  chart
    .dimension(zeitDim)
    .group(anzahl)
    .x(d3.scaleTime().domain([minDate, maxDate]))
    .keyAccessor(d => d.key[0])
    .valueAccessor(d => d.key[1])
    .radiusValueAccessor(d => d.value)

  chart.render()
}

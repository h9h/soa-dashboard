import { getColorFunction } from './dcUtils'
import { ZAHL_FORMAT } from './utils'
import dc from 'dc'
import * as d3 from 'd3'

const createRowChart = (div, colorScheme, withAxis = true) => {
  const colors = getColorFunction(colorScheme)

  const chart = dc.rowChart(div)

  chart.margins().left = 20
  chart.margins().top = 20
  chart.ordinalColors(colors)

  if (withAxis) {
    chart.on('pretransition', function () {
      chart.select('g.axis').attr('transform', 'translate(0,0)')
      chart.selectAll('line.grid-line').attr('y2', chart.effectiveHeight())
    })

    const axis = d3.axisTop()
    axis.tickFormat(t => {
      return t === Math.floor(t) ? t : ''
    })
    chart.xAxis(axis)
  }

  chart
    .height(div.clientHeight)
    .width(div.clientWidth)
    .elasticX(true)
    .fixedBarHeight(20)
    .turnOnControls()
    .title(d => ([
      d.key,
      'Anzahl Calls: ' + ZAHL_FORMAT(d.value)
    ].join('\n')))

  d3.select(div).select('g.row').select('text').attr('fill', 'black')

  return chart
}

export const renderRowChartListServices = ({div, dimensions, colorScheme}) => {
  const dimension = dimensions.operation
  const anzahl = dimension.group().reduceSum(dc.pluck('ANZAHLGESAMT'))

  const chart = createRowChart(div, colorScheme, false)

  chart.margins().left = 75
  chart
    .height(10000)
    .group(anzahl)
    .dimension(dimension)
    .elasticX(true)

  chart.render()
}

export const renderRowChartServicesTopN = n => ({div, dimensions, colorScheme}) => {
  const chart = createRowChart(div, colorScheme)

  const serviceDim = dimensions.operation
  const anzahl = serviceDim.group().reduceSum(dc.pluck('ANZAHLGESAMT'))

  chart
    .group(anzahl)
    .dimension(serviceDim)
    .data(g => g.top(n))

  chart.render()
}

export const renderRowChartFaultsTopN = n => ({div, dimensions, colorScheme}) => {
  const chart = createRowChart(div, colorScheme)

  const serviceDim = dimensions.operation
  const anzahl = serviceDim.group().reduceSum(dc.pluck('ANZAHLFAULT'))

  chart
    .group(anzahl)
    .dimension(serviceDim)
    .data(g => g.top(n))

  chart.render()
}

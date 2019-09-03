import { ZAHL_FORMAT } from './utils'
import dc from 'dc'
import * as d3 from 'd3'
import { getColorFunction } from './dcUtils'

const createRowChart = (div, color, withAxis = true) => {
  const colors = [color]

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

  return chart
}

export const renderRowChartListServices = ({div, dimensions, colorScheme}) => {
  const dimension = dimensions.operation
  const anzahl = dimension.group().reduceSum(dc.pluck('ANZAHLGESAMT'))
  const colors = getColorFunction(colorScheme)

  const chart = createRowChart(div, colors[0], false)

  chart.margins().left = 75
  chart
    .height(10000)
    .group(anzahl)
    .dimension(dimension)
    .elasticX(true)

  chart.render()
}

export const renderRowChartServicesTopN = n => ({div, dimensions, colorScheme}) => {
  const colors = getColorFunction(colorScheme)
  const chart = createRowChart(div, colors[0])

  const serviceDim = dimensions.operation
  const anzahl = serviceDim.group().reduceSum(dc.pluck('ANZAHLGESAMT'))

  chart
    .group(anzahl)
    .dimension(serviceDim)
    .data(g => g.top(n))

  chart.render()
}

export const renderRowChartFaultsTopN = n => ({div, dimensions, colorScheme}) => {
  const colors = getColorFunction(colorScheme)
  const chart = createRowChart(div, colors[1])

  const serviceDim = dimensions.operation
  const anzahl = serviceDim.group().reduceSum(dc.pluck('ANZAHLFAULT'))

  chart
    .group(anzahl)
    .dimension(serviceDim)
    .data(g => g.top(n))

  chart.render()
}

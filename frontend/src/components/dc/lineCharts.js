import { getColorFunction, multiFormat, reduceAverageWeighted } from './dcUtils'
import { ZAHL_FORMAT } from './utils'
import dc from 'dc'
import moment from 'moment'
import * as d3 from 'd3'

// ---------------------------------------------------------------
// Chart Defaults
// ---------------------------------------------------------------
const createCompositeChart = (div, colorScheme, dimensions) => {
  const colors = getColorFunction(colorScheme)

  const chart = dc.compositeChart(div)

  const zeitDim = dimensions.zeit
  const minDate = moment(zeitDim.bottom(1)[0].Date).startOf('day').toDate()
  const maxDate = moment(zeitDim.top(1)[0].Date).endOf('day').toDate()

  chart.margins().left = 75 // damit y-Axis Labels nicht abgeschnitten werden
  chart.margins().right = 0 // damit y-Axis Labels nicht abgeschnitten werden
  chart.ordinalColors(colors)


  chart.dimension(zeitDim)
    .shareColors(true)
    .elasticY(true)
    .yAxisPadding("5%")
    .x(d3.scaleTime().domain([minDate, maxDate]))
    .elasticX(true)
    .brushOn(false)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .legend(dc.legend().x(105).y(10).itemHeight(13).gap(8))
    .title(d => `${moment(d.key).format('DD.MM.YYYY HH:mm')}: ${ZAHL_FORMAT(+d.value || +d.value.avg)}`)
    .renderTitle(true)

  chart.xAxis().tickFormat(multiFormat)

  return chart
}

const createLineChart = chart => {
  const lineChart = dc.lineChart(chart)

  lineChart
    .curve(d3.curveMonotoneX)
    .dotRadius(10)
    .renderDataPoints({radius: 3, fillOpacity: 0.4, strokeOpacity: 0.0})
    .renderArea(true)
    .defined(d => d.y != null ? d.y : null)
    .xyTipsOn(true)

  return lineChart
}

export const renderChartBrush = (margins = {left: 75, right: 0 }, setRange = () => {}) => ({ div, dimensions, zeitDomain }) => {
  const zeitDim = dimensions.zeit
  const anzahl = zeitDim.group().reduceSum(dc.pluck('ANZAHLGESAMT'))

  const chart = dc.lineChart(div)

  chart.yAxis()
    .tickFormat(() => '')

  chart.xAxis()
    .tickFormat(multiFormat)

  chart.margins().left = margins.left
  chart.margins().right = margins.right

  chart
    .height(80)
    .ordinalColors(['#dddddd'])
    .curve(d3.curveMonotoneX)
    .x(d3.scaleTime().domain(zeitDomain))
    .dimension(zeitDim)
    .group(anzahl, 'Gesamtanzahl Calls')
    .brushOn(true)
    .elasticY(true)
    .elasticX(true)
    .renderArea(true)
    .yAxisLabel('Brush')

  chart.on('filtered', chart => {
    const filters = chart.filters()
    if (filters.length) {
      const range = filters[0]
      console.log('Filtered range', range)
      setRange(range)
    } else {
      setRange(null)
    }
  })
  chart.render()

  return chart
}

export const renderLineChartAnzahlCalls = ({div, dimensions, colorScheme}) => {
  const chart = createCompositeChart(div, colorScheme, dimensions)

  chart
    .yAxisLabel('Anzahl Calls (pro Stunde)')
    .compose([
      createChartGesamtanzahl(chart, dimensions),
      createChartFault(chart, dimensions)
    ])

  chart.render()
}

export const renderLineChartTimingCalls = ({div, dimensions, colorScheme}) => {
  const chart = createCompositeChart(div, colorScheme, dimensions)
  chart
    .yAxisLabel('Durchschnitt Antwort (ms)')
    .compose([
      createChartAntwortzeit(chart, dimensions),
      createChartVerarbeitungszeit(chart, dimensions)
    ])

  chart.render()
}

export const renderLineChartAnzahlUndTimingCalls = ({div, dimensions, colorScheme}) => {
  const chart = createCompositeChart(div, colorScheme, dimensions)
  chart
    .yAxisLabel('Anzahl Serviceaufrufe (pro Stunde)')
    .rightYAxisLabel('Durchschnittliche Antwortzeit (ms)')
    .compose([
      createChartGesamtanzahl(chart, dimensions),
      createChartFault(chart, dimensions),
      createChartAntwortzeit(chart, dimensions)
        .useRightYAxis(true)
    ])

  chart.render()
}


const createChartGesamtanzahl = (chart, dimensions) => {
  const anzahl = dimensions.zeit.group().reduceSum(dc.pluck('ANZAHLGESAMT'))
  return createLineChart(chart).group(anzahl, 'Gesamtanzahl Calls')
}

const createChartFault = (chart, dimensions) => {
  const anzahl = dimensions.zeit.group().reduceSum(dc.pluck('ANZAHLFAULT'))
  return createLineChart(chart).group(anzahl, 'davon Faults')
}

const createChartAntwortzeit = (chart, dimensions) => {
  const antwortzeit = dimensions.zeit.group().reduce(...reduceAverageWeighted('DURCHSCHNITT_GESAMT_ZEIT'))
  return createLineChart(chart)
    .group(antwortzeit, 'Antwortzeit')
    .valueAccessor(d => d.value.avg)
}

const createChartVerarbeitungszeit = (chart, dimensions) => {
  const antwortzeit = dimensions.zeit.group().reduce(...reduceAverageWeighted('DURCHSCHNITT_PROVIDER_ZEIT'))
  return createLineChart(chart)
    .group(antwortzeit, 'Verarbeitungszeit')
    .valueAccessor(d => d.value.avg)
}

import { getColorFunction, multiFormat, reduceAverageWeighted } from './dcUtils'
import { ZAHL_FORMAT } from './utils'
import { compositeChart, lineChart, legend, pluck } from 'dc'
import moment from 'moment'
import * as d3 from 'd3'
import crossfilter from 'crossfilter2'
import { sendInfo } from '../../App'

// ---------------------------------------------------------------
// Chart Defaults
// ---------------------------------------------------------------
const createCompositeChart = (div, colorScheme, dimensions) => {
  const colors = getColorFunction(colorScheme)
  const chart = compositeChart(div)

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
    .legend(legend().x(105).y(10).itemHeight(13).gap(8))
    .title(d => `${moment(d.key).format('DD.MM.YYYY HH:mm')}: ${ZAHL_FORMAT(+d.value || +d.value.avg)}`)
    .renderTitle(true)

  chart.xAxis().tickFormat(multiFormat)

  return chart
}

const createLineChart = chart => {
  const myChart = lineChart(chart)

  myChart
    .curve(d3.curveMonotoneX)
    .dotRadius(10)
    .renderDataPoints({radius: 3, fillOpacity: 0.4, strokeOpacity: 0.0})
    .renderArea(true)
    .defined(d => d.y != null ? d.y : null)
    .xyTipsOn(true)

  return myChart
}

export const renderChartBrush = (margins = {left: 75, right: 0 }, setRange = () => {}) => ({ div, dimensions, zeitDomain }) => {
  const zeitDim = dimensions.zeit
  const anzahl = zeitDim.group().reduceSum(pluck('ANZAHLGESAMT'))

  const chart = lineChart(div)

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
    .yAxisLabel('# Calls pro Stunde')
    .compose([
      createChartGesamtanzahl(chart, dimensions),
      createChartFault(chart, dimensions)
    ])

  chart.render()
}

const createChartGesamtanzahl = (chart, dimensions) => {
  const anzahl = dimensions.zeit.group().reduceSum(pluck('ANZAHLGESAMT'))
  return createLineChart(chart).group(anzahl, 'Gesamtanzahl Calls')
}

const createChartFault = (chart, dimensions) => {
  const anzahl = dimensions.zeit.group().reduceSum(pluck('ANZAHLFAULT'))
  return createLineChart(chart).group(anzahl, 'davon Faults')
}

const createChartAntwortzeit = (chart, dimensions) => {
  const antwortzeit = dimensions.zeit.group().reduce(...reduceAverageWeighted('DURCHSCHNITT_GESAMT_ZEIT'))
  return createLineChart(chart)
    .group(antwortzeit, '∅ Antwortzeit')
    .valueAccessor(d => d.value.avg)
}

const createChartVerarbeitungszeit = (chart, dimensions) => {
  const zeiten = dimensions.zeit
  const antwortzeit = zeiten.group().reduce(...reduceAverageWeighted('DURCHSCHNITT_PROVIDER_ZEIT'))

  const maxTimeDay = crossfilter(zeiten.filter(d => {
    const zeit = moment(d)
    return zeit.hour() >= 8 && zeit.hour() < 20
  }).top(Infinity)).dimension(d => d.Date)

  //console.log('Filtered', maxTimeDay.group().top(Infinity))
  const maxTimeDayVerarbeitungszeit = maxTimeDay
    .group()
    .reduce(...reduceAverageWeighted('DURCHSCHNITT_PROVIDER_ZEIT'))
    .order(d => d.avg)
    .top(1)[0].value.avg
  sendInfo(`Maximale durchschnittliche Verarbeitungszeit (zwischen 8:00 und 20:00): ${Math.round(maxTimeDayVerarbeitungszeit)} ms`)

  return createLineChart(chart)
    .group(antwortzeit, '∅ Verarbeitungszeit')
    .valueAccessor(d => d.value.avg)
}

const createLine = (chart, dimensions, type) => {
  const zeiten = dimensions.zeit
  const antwortzeit = zeiten.group().reduce(...reduceAverageWeighted(type))
  const myChart = lineChart(chart)

  myChart
    .curve(d3.curveMonotoneX)
    .dotRadius(0)
    .renderArea(false)
    .defined(d => d.y != null ? d.y : null)
    .xyTipsOn(false)
    .group(antwortzeit, type)
    .valueAccessor(d => d.value.avg)
    .dashStyle([1, 4])

  myChart.legendables = () => {}

  return myChart
}


export const renderLineChartTimingCalls = ({div, dimensions, colorScheme}) => {
  const chart = createCompositeChart(div, colorScheme, dimensions)
  const colors = ['#F8B620', '#FF0000', ...getColorFunction(colorScheme)]
  chart.ordinalColors(colors)

  chart
    .yAxisLabel('∅ Antwortzeit (ms)')
    .compose([
      createLine(chart, dimensions, 'warnThreshold'),
      createLine(chart, dimensions, 'errorThreshold'),
      createChartAntwortzeit(chart, dimensions),
      createChartVerarbeitungszeit(chart, dimensions),
    ])

  chart.render()
}

export const renderLineChartAnzahlUndTimingCalls = ({div, dimensions, colorScheme}) => {
  const chart = createCompositeChart(div, colorScheme, dimensions)
  chart
    .yAxisLabel('Anzahl Serviceaufrufe (pro Stunde)')
    .rightYAxisLabel('∅ Antwortzeit (ms)')
    .compose([
      createChartGesamtanzahl(chart, dimensions),
      createChartFault(chart, dimensions),
      createChartAntwortzeit(chart, dimensions)
        .useRightYAxis(true)
    ])

  chart.render()
}

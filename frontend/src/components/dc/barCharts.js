import { getColorFunction, multiFormat } from './dcUtils'
import dc from 'dc'
import * as d3 from 'd3'
import { TIMING_BREAKPOINTS, TIMING_BUS_BREAKPOINTS } from '../../logic/api/rest-api-statistics'
import { COLOR_SCHEMES, legendTiming, TIMINGS } from './utils'
import moment from 'moment'
import { renderPieChartDomain } from './pieCharts'

const cx = (div) => div.clientHeight
const widthLegend = 250
const marginLegend = 20
const minWidthForLegend = 400

export const HISTOGRAMM_COLORS = ['#dddddd', ...COLOR_SCHEMES.GreenRed10.slice(1)]

const createBarChart = (div, colorScheme, legend) => {
  const height = cx(div)
  const chart = dc.barChart(div)

  chart.margins().left = 30
  chart.margins().right = div.clientWidth < minWidthForLegend ? 20 : widthLegend

  chart.xAxis(d3.axisBottom())

  chart
    .ordinalColors(HISTOGRAMM_COLORS)
    .colorAccessor(d => d.key)
    .height(height)
    .width(div.clientWidth)
    .title(legend)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .yAxisLabel('Prozent')
    .elasticY(true)

  return chart
}

function setChartTitleAndLegend (div, title, text, colors, colorSquare = false) {
  if (div.clientWidth < minWidthForLegend) return

  const haveTitle = !!title
  const yOffset = haveTitle ? 40 : 10

  if (haveTitle) {
    d3.select(div)
      .select('svg')
      .append('text')
      .text(title)
      .attr('x', div.clientWidth - widthLegend + marginLegend)
      .attr('y', 20)
      .attr('style', 'font-weight: bold')
  }

  const marginText = colorSquare ? 15 : 30
  const xText = div.clientWidth - widthLegend + marginLegend

  text.forEach((t,i) => {
    const g = d3.select(div)
      .select('svg')
      .append('g')

    if (colorSquare) {
      g
        .append('rect')
        .attr('width', 13)
        .attr('height', 13)
        .attr('fill', colors[i])
        .attr('x', xText)
        .attr('y', yOffset - 10 + 14 * i)
    } else {
      g
        .append('text')
        .text(`[ ${i} ]`)
        .attr('style', 'font-size: 11px')
        .attr('color', colors[i])
        .attr('stroke', 'currentColor')
        .attr('x', xText)
        .attr('y', yOffset + 14 * i)
    }

    g
      .append('text')
      .text(t)
      .attr('style', 'font-size: 11px')
      .attr('x', xText + marginText)
      .attr('y', yOffset + 14 * i)
  })
}

export const renderBarChartTiming = timingKey => ({div, dimensions, colorScheme}) => {
  const breakpoints = timingKey === TIMINGS.BUS ? TIMING_BUS_BREAKPOINTS : TIMING_BREAKPOINTS
  const legend = legendTiming(breakpoints)
  const chart = createBarChart(div, colorScheme, legend)

  const timingDim = dimensions[timingKey.key]
  const anzahl = timingDim.group().reduceCount()

  chart
    .dimension(timingDim)
    .group(anzahl)
    .valueAccessor(d => d.value / timingDim.groupAll().value() * 100)

  chart.render()

  const text = d3.range(breakpoints.length + 1).map(bp => legend(bp))
  chart.on('postRender', () => setChartTitleAndLegend(div, timingKey.title, text, HISTOGRAMM_COLORS))
}

export const renderBarChartLogpoints = ({div, dimensions, setBis}) => {
  const chart = dc.barChart(d3.select(div));

  chart.margins().left = 100
  chart.margins().right = 10
  chart.margins().bottom = 18

  const dimTime = dimensions.time
  const minDate = moment(dimTime.bottom(1)[0].time, 'YYYY-MM-DDTHH:mm:ss').toDate()
  const maxDate = moment(dimTime.top(1)[0].time, 'YYYY-MM-DDTHH:mm:ss').toDate()

  const calls = dimTime.group().reduceSum(dc.pluck('anzahlMessages'))
  const faults = dimTime.group().reduceSum(dc.pluck('anzahlFaultpoints'))

  chart
    .width(div.clientWidth)
    .height(div.clientHeight)
    .x(d3.scaleTime().domain([minDate, maxDate]).nice())
    .legend(dc.legend().x(30).y(20).itemHeight(13).gap(5))
    .renderHorizontalGridLines(true)
    .dimension(dimTime)
    .group(calls, "Calls")
    .brushOn(false)
    .centerBar(true)
    .xUnits(d3.timeSeconds)
    .title(p => `${moment(p.key).format('HH:mm:ss')}:\n\nAnzahl Calls: ${p.value}`)
    .yAxisLabel('Anzahl/sek')

  chart
    .yAxis()
      .ticks(5)

  chart.xAxis()
    .tickFormat(multiFormat)

  chart.stack(faults, 'Faults')

  chart.on('pretransition', function(chart) {
    chart.selectAll('rect.bar').on('click.esbdashboard', function(d) {
      console.log('Clicked für setBis', moment(d.data.key).format('HH:mm:ss'))
      setBis(moment(d.data.key).format('HH:mm:ss'))
    })
  })

  chart
    .render();
}

export const renderBarChartDomain = ({div, dimensions, colorScheme}) => {
  const dimension = dimensions.domain
  const domains = dimension.group().reduceSum(dc.pluck('ANZAHLGESAMT'))
  const colors = getColorFunction(colorScheme)
  const height = cx(div)
  const withLegend = div.clientWidth >= minWidthForLegend

  const leftDiv = d3.select(div).append('div').attr('style', withLegend ? 'float: left; width: 66%;' : 'width: 100%;')
  const chart = dc.barChart(leftDiv)

  chart.margins().left = 60
  chart.margins().right = 20

  chart.ordinalColors(colors)

  chart
    .colorAccessor(d => d.key)
    .width(leftDiv.clientWidth)
    .height(height)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .yAxisLabel('Anzahl Calls')
    .elasticY(true)
    .dimension(dimension)
    .group(domains, "Anzahl Calls")
    .brushOn(false)
    .xAxis().tickValues([])

  chart.render()

  if (withLegend) {
    const rightDiv = d3.select(div).append('div').attr('style', 'float: left; width: 33%;')
    renderPieChartDomain({ div: rightDiv, dimensions, colorScheme, onlyLegend: true })
  }
}

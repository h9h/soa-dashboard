import { getColorFunction, multiFormat } from './dcUtils'
import { barChart, units, pluck, legend } from 'dc'
import * as d3 from 'd3'
import { TIMING_BREAKPOINTS, TIMING_BUS_BREAKPOINTS } from '../../logic/api/rest-api-statistics'
import { COLOR_SCHEMES, legendTiming, TIMINGS } from './utils'
import moment from 'moment'
import Log from '../../log'

const log = Log('barcharts')

const cx = (div) => div.clientHeight
const widthLegend = 250
const marginLegend = 20
const minWidthForLegend = 400

export const HISTOGRAMM_COLORS = ['#dddddd', ...COLOR_SCHEMES.GreenRed10.slice(1)]

const createBarChart = (div, legend) => {
  const height = cx(div)
  const chart = barChart(div)

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
    .xUnits(units.ordinal)
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

export const renderBarChartTiming = timingKey => ({div, dimensions}) => {
  const breakpoints = timingKey === TIMINGS.BUS ? TIMING_BUS_BREAKPOINTS : TIMING_BREAKPOINTS
  const legend = legendTiming(breakpoints)
  const chart = createBarChart(div, legend)

  const timingDim = dimensions[timingKey.key]
  const anzahl = timingDim.group().reduceCount()
  const fraction = 100 / timingDim.groupAll().value()

  log.trace('renderBarChartTiming', { Daten: anzahl.all(), Anzahl: anzahl.size(), Fraction: fraction })

  chart
    .dimension(timingDim)
    .group(anzahl)
    .valueAccessor(d => d.value * fraction)

  chart.render()

  const text = d3.range(breakpoints.length + 1).map(bp => legend(bp))
  chart.on('postRender', () => setChartTitleAndLegend(div, timingKey.title, text, HISTOGRAMM_COLORS))
}

export const renderBarChartLogpoints = ({div, dimensions, setBis}) => {
  const chart = barChart(d3.select(div));

  chart.margins().left = 100
  chart.margins().right = 10
  chart.margins().bottom = 18

  const dimTime = dimensions.time
  const minDate = moment(dimTime.bottom(1)[0].time, 'YYYY-MM-DDTHH:mm:ss').toDate()
  const maxDate = moment(dimTime.top(1)[0].time, 'YYYY-MM-DDTHH:mm:ss').toDate()

  const calls = dimTime.group().reduceSum(pluck('anzahlMessages'))
  const faults = dimTime.group().reduceSum(pluck('anzahlFaultpoints'))

  log.trace('Anzahl Calls', calls)
  log.trace('Anzahl Faults', faults)

  chart
    .width(div.clientWidth)
    .height(div.clientHeight)
    .x(d3.scaleTime().domain([minDate, maxDate]).nice())
    .legend(legend().x(30).y(20).itemHeight(13).gap(5))
    .renderHorizontalGridLines(true)
    .dimension(dimTime)
    .group(calls, "Ok")
    .brushOn(false)
    .centerBar(true)
    .xUnits(d3.timeSeconds)
    .title(p => `${moment(p.key).format('HH:mm:ss')}:\n\nAnzahl Servicecalls: ${p.value}`)
    .yAxisLabel('Anzahl/sek')

  chart
    .yAxis()
      .ticks(5)

  chart.xAxis()
    .tickFormat(multiFormat)

  chart.stack(faults, 'Fault')

  chart.on('pretransition', function(chart) {
    chart.selectAll('rect.bar').on('click.esbdashboard', function(_, d) {
      console.log('Clicked für setBis', moment(d.data.key).format('HH:mm:ss'))
      setBis(moment(d.data.key).format('HH:mm:ss'))
    })
  })

  chart
    .render();
}

export const renderBarChartDomain = ({div, dimensions, colorScheme}) => {
  const dimension = dimensions.domain
  const domains = dimension.group().reduceSum(pluck('ANZAHLGESAMT'))
  log.trace('Domains', domains.all())
  const domainNames = domains.all().map(pluck('key'))
  const colors = getColorFunction(colorScheme)
  const height = cx(div)

  const chart = barChart(div)

  chart.margins().left = 60
  chart.margins().right = 60
  chart.margins().bottom = 120

  chart.ordinalColors(colors)

  chart
    .colorAccessor(d => d.key)
    .width(div.clientWidth)
    .height(height)
    .x(d3.scaleBand())
    .xUnits(units.ordinal)
    .yAxisLabel('Anzahl Calls')
    .elasticY(true)
    .dimension(dimension)
    .group(domains, "Anzahl Calls")
    .brushOn(false)
    .xAxis().tickValues(domainNames)

  chart.on('pretransition', c => {
    c.select('.axis.x')
      .attr("text-anchor", "end")
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dy", "0.2em")
      .attr("dx", "-1em")
      .attr("style", "font-size: 12px")
  })

  chart.render()
}

import { getColorFunction, multiFormat } from './dcUtils'
import dc from 'dc'
import * as d3 from 'd3'
import { TIMING_BREAKPOINTS, TIMING_BUS_BREAKPOINTS } from '../../logic/api/rest-api-statistics'
import { COLOR_SCHEMES, legendTiming, TIMINGS } from './utils'
import moment from 'moment'

const cx = (div) => div.clientHeight
const stretchFactor = 1.2

export const HISTOGRAMM_COLORS = ['#dddddd', ...COLOR_SCHEMES.GreenRed10.slice(1)]

const createBarChart = (div, colorScheme, legend) => {
  const height = cx(div)
  const chart = dc.barChart(div)

  chart.margins().left = 30
  chart.margins().right = div.clientWidth - stretchFactor * height

  chart.xAxis(d3.axisBottom())

  chart
    .ordinalColors(HISTOGRAMM_COLORS)
    .colorAccessor(d => d.key)
    .height(height)
    .width(div.clientWidth)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .title(legend)
    .yAxisLabel('Prozent')
    .elasticY(true)

  return chart
}

function setChartTitle (div, title, text, colors) {
  d3.select(div)
    .select('svg')
    .append('text')
    .text('Histogramm: ' + title)
    .attr('x', stretchFactor * cx(div) + 20)
    .attr('y', 20)
    .attr('style', 'font-weight: bold')

  text.forEach((t,i) => {
    const svg = d3.select(div)
      .select('svg')

    svg
      .append('text')
      .text(`[ ${i} ]`)
      .attr('style', 'font-size: 12px')
      .attr('color', colors[i])
      .attr('stroke', 'currentColor')
      .attr('x', stretchFactor * cx(div) + 20)
      .attr('y', 40 + 14 * i)

    svg
      .append('text')
      .text(t)
      .attr('style', 'font-size: 12px')
      .attr('x', stretchFactor * cx(div) + 50)
      .attr('y', 40 + 14 * i)
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
  chart.on('postRender', () => setChartTitle(div, timingKey.title, text, HISTOGRAMM_COLORS))
}

export const renderBarChartLogpoints = ({div, dimensions, setBis}) => {
  const chart = dc.barChart(d3.select(div));

  chart.margins().left = 100

  const dimTime = dimensions.time
  const minDate = moment(dimTime.bottom(1)[0].time, 'YYYY-MM-DDTHH:mm:ss').toDate()
  const maxDate = moment(dimTime.top(1)[0].time, 'YYYY-MM-DDTHH:mm:ss').toDate()

  const calls = dimTime.group().reduceSum(dc.pluck('anzahlMessages'))
  const faults = dimTime.group().reduceSum(dc.pluck('anzahlFaultpoints'))

  chart
    .width(div.clientWidth)
    .height(div.clientHeight)
    .x(d3.scaleTime().domain([minDate, maxDate]))
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
  const all = domains.top(Infinity)
  const colors = getColorFunction(colorScheme)
  const height = cx(div)

  const chart = dc.barChart(div)

  chart.margins().left = 60
  chart.margins().right = div.clientWidth - height

  chart.ordinalColors(colors)

  chart
    .colorAccessor(d => d.key)
    .width(div.clientWidth)
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

  const text = d3.range(all.length).map(d => all[d].key).sort()
  chart.on('postRender', () => setChartTitle(div, 'Domänen', text, colors))
}

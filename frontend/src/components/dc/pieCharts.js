import { getColorFunction, reduceIdentity } from './dcUtils'
import {pieChart, legend, pluck} from 'dc'
import * as d3 from 'd3'
import { TIMING_BREAKPOINTS, TIMING_BUS_BREAKPOINTS } from '../../logic/api/rest-api-statistics'
import { legendTiming, TIMINGS } from './utils'

const cx = (div) => div.clientWidth/3

const createPieChart = ({ div, colorScheme, legendFunction = d => d.name, onlyLegend = false }) => {
  const colors = getColorFunction(colorScheme)

  const centre = cx(div)
  const radius = Math.min(centre, div.clientHeight/2)
  const xLegend = centre + radius + 20

  const chart = pieChart(div)
  chart
    .ordinalColors(colors)
    .colorAccessor(d => d.key)
    .innerRadius(onlyLegend ? radius : Math.min(50, centre/2))
    .radius(radius)
    .externalRadiusPadding(0)
    .cx(centre)
    .legend(legend().itemHeight(13).gap(1).x(xLegend).legendText(legendFunction))

  return chart
}

export const renderPieChartDomain = ({div, dimensions, colorScheme, onlyLegend = false}) => {
  const dimension = dimensions.domain
  const anzahl = dimension.group().reduce(...reduceIdentity())

  const chart = createPieChart({ div, colorScheme, onlyLegend })
  chart
    .dimension(dimension)
    .group(anzahl)
    .ordering(d => d.key)
    .colorAccessor(d => d.key)
    .title(d => d.key)

  chart.render()

  if (!onlyLegend) chart.on('postRender', () => setChartTitle(div, 'Domäne'))
}

function setChartTitle (div, text) {
  d3.select(div)
    .select('svg')
    .append('text')
    .text(text)
    .attr('x', cx(div))
    .attr('y', div.clientHeight / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('style', 'font-weight: bold')
}

export const renderPieChartWelcherBus = ({div, dimensions, colorScheme}) => {
  const busDim = dimensions.bus
  const anzahl = busDim.group().reduceSum(pluck('ANZAHLGESAMT'))

  const chart = createPieChart({ div, colorScheme })
  chart
    .dimension(busDim)
    .group(anzahl)

  chart.render()

  chart.on('postRender', () => setChartTitle(div, 'Bus'))
}

export const renderPieChartTiming = timingKey => ({div, dimensions, colorScheme}) => {
  const breakpoints = timingKey === TIMINGS.BUS ? TIMING_BUS_BREAKPOINTS : TIMING_BREAKPOINTS
  const chart = createPieChart({ div, colorScheme, legendFunction: legendTiming(breakpoints) })

  const timingDim = dimensions[timingKey.key]
  const anzahl = timingDim.group().reduceCount()

  chart
    .dimension(timingDim)
    .group(anzahl)
    .ordering(d => d.key)

  chart.render()

  chart.on('postRender', () => setChartTitle(div, timingKey.title))
}

export const renderPieChartMep = ({div, dimensions, colorScheme}) => {
  const chart = createPieChart({ div, colorScheme })

  const mepDim = dimensions.mep
  const anzahl = mepDim.group().reduceSum(pluck('ANZAHLGESAMT'))

  chart
    .dimension(mepDim)
    .group(anzahl)

  chart.render()

  chart.on('postRender', () => setChartTitle(div, 'MEP'))
}

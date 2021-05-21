import { getColorFunction, reduceIdentity } from './dcUtils'
import {sunburstChart} from 'dc'

const createSunburstChart = (div, colorScheme) => {
  const colors = getColorFunction(colorScheme)

  const chart = sunburstChart(div)

  chart.ordinalColors(colors)

  chart
    .height(Math.min(div.clientHeight, div.clientWidth) - 20)
    .width(Math.min(div.clientHeight, div.clientWidth) - 20)

  return chart
}

export const renderSunburstChart = ({div, dimensions, colorScheme}) => {
  const dimension = dimensions.serviceTree
  const anzahl = dimension.group().reduce(...reduceIdentity())

  const chart = createSunburstChart(div, colorScheme, false)

  chart
    .group(anzahl)
    .dimension(dimension)

  chart.render()
}

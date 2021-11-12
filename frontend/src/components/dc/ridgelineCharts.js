import * as d3 from 'd3'
import moment from 'moment'
import { colorGenerator, TIMINGS, ZAHL_FORMAT } from './utils'
import Chart from './DCChart'
import { multiFormat } from './dcUtils'

const xAxis = (width, height, margin, x) => g => g
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x)
    .ticks(width / 80)
    .tickSizeOuter(0)
    .tickFormat(multiFormat)
  )

const yAxis = (margin, y) => g => g
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
  .call(g => g.select('.domain').remove())

const zAxis = (margin, z) => g => g
  .attr('transform', `translate(${margin.left},${margin.top})`)
  .call(d3.axisLeft(z)
    .tickSize(5)
    .tickPadding(4)
    .ticks(5)
  )

const wertFunction = wert => {
  switch (wert) {
    case TIMINGS.GESAMT.key:
      return v => v.DURCHSCHNITT_GESAMT_ZEIT
    case TIMINGS.PROVIDER.key:
      return v => v.DURCHSCHNITT_PROVIDER_ZEIT
    case TIMINGS.BUS.key:
      return v => v.DURCHSCHNITT_BUS_ZEIT
    case 'anzahlGesamt':
      return v => v.ANZAHLGESAMT
    case 'anzahlFault':
      return v => v.ANZAHLFAULT
    case 'ContributionGesamtZeit':
      return v => v.ContributionGesamtZeit
    default:
      return () => 0
  }
}

const createTooltip = (div) => {
  const element = d3.select(div)
    .append('div')
    .attr('class', 'ridgelineTooltip')
    .style('opacity', 0)

  return {
    mouseover: (event, d) => {
      element.transition()
        .duration(200)
        .style('opacity', .9)
      element.html(`
${d.name}<br />
Extent: [${ZAHL_FORMAT(d3.min(d.values))}, ${ZAHL_FORMAT(d.maximum)}]<br />
Median: ${ZAHL_FORMAT(Math.round(d3.median(d.values)))}<br />
Durchschnitt: ${ZAHL_FORMAT(Math.round(d3.mean(d.values)))}
`)
        .style('left', (event.pageX - 150) + 'px')
        .style('top', (event.pageY - 150) + 'px')
    },

    mouseout: () => {
      element.transition()
        .duration(500)
        .style('opacity', 0)
    }
  }
}

// Line at Mouse
const createCursorline = (div, getDate) => {
  const svg = d3.select(div).select('svg')
  const height = svg.node().getBoundingClientRect().height

  const setTimeIfChanged = fn => {
    const oldTime = null
    return time => {
      if (oldTime && time === oldTime) return
      fn(time)
    }
  }

  const element = svg.append("g")
    .attr("class", "mouse-over-effects")
    .append("path")
    .attr("id", "time")
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("stroke-dasharray", "5,5")
    .style("opacity", "0")

  const textDiv = d3.select(div).append('div')
    .attr('class', 'ridgelineTooltipTime')

  const elementText = textDiv
    .style("opacity", "0")

  const setTime = event => setTimeIfChanged(time => {
    elementText.text(time)
      .style("left", (event.pageX) + "px")
      .style("top", "1px")
  })

  return {
    mouseover: () => {
      element.transition()
        .duration(200)
        .style('opacity', .7)
      elementText.transition()
        .duration(200)
        .style('opacity', .9)
    },
    mousemove: function (event) {
      const x = event.pageX - 20
      const time = moment(getDate(x)).add(30, 'minutes').startOf('hour').format('DD.MM.YYYY HH:mm')

      element.attr("d", () => `M${x},${height} ${x},0`)
      setTime(event)(time)
    },
    mouseout: () => {
      element.transition()
        .duration(500)
        .style('opacity', 0)
      elementText.transition()
        .duration(500)
        .style('opacity', 0)
    }
  }
}

// siehe https://observablehq.com/@d3/ridgeline-plot
export const renderRidgelinePlot = (dimension, wert, range) => ({div, dimensions}) => {
  const zeitDim = dimensions.zeit
  const serviceDim = dimension === 'service' ? dimensions.shortName : dimensions.operation

  const wertFn = wertFunction(wert)

  // sammle die Zeiten als Wert zu einem Datum in einem Objekt
  const serviceDimGroup = serviceDim.group().reduce(
    /* add */ (p, v) => {
      p[moment(v.Date).valueOf()] = wertFn(v)
      return p
    },
    /* remove */ (p, v) => {
      delete p[moment(v.Date).valueOf()]
      return p
    },
    /* init */ () => ({})
  )

  const chart = ridgelineChart(div)
  chart.dimension(zeitDim)
    .group(serviceDimGroup)
    .wert(wert)
    .range(range)

  chart.render()
}

function ermittleTextCaption (wert, data, globalMax) {
  const t1 = `Anzahl Sätze: ${data.series.length}`
  const unit = wert.indexOf('anzahl') === 0 ? 'Stück' : wert.indexOf('Contribution') === 0 ? 'ms x Anzahl' :'ms in Summe'
  const t2 = `Globales Maximum: ${ZAHL_FORMAT(globalMax)} ${unit}`
  return `${t1} - ${t2}`
}

class RidgelineChart extends Chart {
  constructor(div) {
    super(div)

    this._wert = ''
    this._range = null
  }

  wert(wert) {
    this._wert = wert
    return this
  }

  range(range) {
    this._range = range
    return this
  }

  resetSvg() {
    super.resetSvg()
    d3.select(this._div).select('text').remove()
    d3.select(this._div).select('.mouse-over-effects').remove()
    d3.select(this._div).select('.ridgelineTooltip').remove()
    d3.select(this._div).select('.ridgelineTooltipTime').remove()
  }

  redraw() {
    super.redraw()
    const nextColorArea = colorGenerator('HueCircle19')
    const nextColorLine = colorGenerator('HueCircle19')

    let dates = this._dimension
      .group()
      .reduceCount()
      .top(Infinity)
      .map(item => '' + moment(item.key).valueOf())

    if (this._range) {
      const startTime = '' + moment(this._range[0]).valueOf()
      const endTime = '' + moment(this._range[1]).valueOf()
      dates = dates.filter(item => startTime <= item && item <= endTime)
    }

    dates.sort()

    const all = this._group.all()

    // Mappe die Datumswerte an die entsprechende Stelle im Array, korrespondierend dem Array der Dates
    const series = all.map(object => {
      const values = new Array(dates.length).fill(0)
      Object.keys(object.value).forEach(key => {
        values[dates.indexOf('' + key)] = object.value[key]
      })

      const name = object.key
      const maximum = d3.max(values)
      const point = `${name} (${ZAHL_FORMAT(maximum)})`

      return {name, values, maximum, point}
    }).filter(o => o.maximum > 0)

    const data = {
      /* name: operation, values: Array von timing, je date */
      series: series.sort((a, b) => b.maximum - a.maximum),
      dates: dates.map(d => moment(parseInt(d, 10)).toDate())
    }

    const globalMax = d3.max(data.series, d => d.maximum)

    const margin = ({top: 150, right: 20, bottom: 130, left: 250})

    const width = this._div.clientWidth
    const height = data.series.length * 16 + margin.bottom + margin.top

    const x = d3.scaleTime()
      .domain(d3.extent(data.dates))
      .range([margin.left, width - margin.right])
    const getDate = x.invert

    const y = d3.scalePoint()
      .domain(data.series.map(d => d.point))
      .range([margin.top, height - margin.bottom])

    const z = d3.scaleLinear()
      .domain([0, globalMax]).nice()
      .range([0, -0.9 * margin.top])

    const curve = this._range ? d3.curveLinear : d3.curveMonotoneX

    const area = d3.area()
      .curve(curve)
      .defined(d => !isNaN(d))
      .x((d, i) => x(data.dates[i]))
      .y0(0)
      .y1(d => z(d))

    const line = area.lineY1()

    d3.select(this._div).append('text')
      .text(ermittleTextCaption(this._wert, data, globalMax))

    const svg = d3.select(this._div).append('svg')
    svg.attr('width', width)
    svg.attr('height', height)

    svg.append('g').call(xAxis(width, height, margin, x))
    svg.append('g').call(yAxis(margin, y))
    svg.append('g').call(zAxis(margin, z))

    // Graph-Lines-Group
    const group = svg.append('g')
      .selectAll('g')
      .data(data.series)
      .join('g')
      .attr('transform', d => `translate(0,${y(d.point) + 1})`)
    // da unsere y-Scale über d.point geht werden damit die Datenreihen über die X-Achse verteilt

    // Tooltip / Cursorline
    const tooltip = createTooltip(this._div)
    const cursorLine = createCursorline(this._div, getDate)

    svg
      .on('mouseover', d => {
        cursorLine.mouseover(d)
      })
      .on('mouseout', () => {
        cursorLine.mouseout()
      })
      .on('mousemove', d => {
        cursorLine.mousemove(d)
      })

    group
      .append('g')
      .attr('class', 'ridgelinePath')
      .append('path')
      .attr('class', 'ridgelinePath__path')
      .attr('fill', () => nextColorArea())
      .attr('d', d => area(d.values))
      .on('mouseover', (event, d) => {
        tooltip.mouseover(event, d)
        cursorLine.mouseover(d)
      })
      .on('mouseout', () => {
        tooltip.mouseout()
        cursorLine.mouseout()
      })
      .on('mousemove', d => {
        cursorLine.mousemove(d)
      })

    group.append('path')
      .attr('fill', 'none')
      .attr('stroke', () => nextColorLine())
      .attr('d', d => line(d.values))
  }
}

const ridgelineChart = div => {
  return new RidgelineChart(div)
}

import {registerChart} from 'dc'
import * as d3 from 'd3'

class Chart {
  constructor(div) {
    this._div = div
    this._dimension = null
    this._group = null

    registerChart(this)
  }

  dimension(dimension) {
    this._dimension = dimension
    return this
  }

  group(group) {
    this._group = group
    return this
  }

  resetSvg() {
    d3.select(this._div).select('svg').remove()
  }

  redraw() {
    this.resetSvg()
  }

  render() {
    this.redraw()
    return this
  }

  filterAll() { /* do nothing */ }
}

export default Chart

import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { colorGenerator } from '../dc/utils'
import WartenAnzeiger from '../WartenAnzeiger'

class CheckaliveD3 {
  constructor(div, graph) {
    this._div = div
    this.graph = graph
  }

  render() {
    this.redraw()
    return this
  }

  redraw() {
    const nextColorNode = colorGenerator('HueCircle19')

    const margin = ({top: 10, right: 10, bottom: 10, left: 10})

    const width = this._div.clientWidth - margin.left - margin.right
    const height = this._div.clientWidth - margin.top - margin.bottom

    const svg = d3.select(this._div)
      .append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const link = svg
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .style('stroke', d => d.isAlive ? '#0f0': '#f00')

    const node = svg
      .selectAll('circle')
      .data(this.graph.nodes)
      .enter()
      .append('circle')
        .attr('r', 20)
      .style('fill', () => nextColorNode())

    const ticked = () => {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("cx", function (d) { return d.x+6; })
        .attr("cy", function(d) { return d.y-6; });
    }

    d3.forceSimulation(this.graph.nodes)
      .force('link', d3.forceLink()
        .id(d => d.name)
        .links(this.graph.links)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width/2, height/2))
      .on('end', ticked)
  }
}

const CheckaliveGraph = ({ graph, ...props }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref) return
    const g = new CheckaliveD3(ref.current, graph)
    g.render()
  }, [ref, graph])

  if (!ref) return <WartenAnzeiger />

  return (
    <div ref={ref}
         style={{ width: "100%", height: "100%" }}
         {...props.styles}
    />
  )
}

export default CheckaliveGraph

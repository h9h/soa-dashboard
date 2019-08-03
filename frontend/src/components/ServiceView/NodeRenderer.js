import React from 'react'
import format from 'xml-formatter'
import { ObjectLabel } from 'react-inspector'

const NodeRenderer = ({root, depth, name, data}) => {
  if (depth === 0) return <span>{root}</span>
  if (['__cdata'].indexOf(name) > -1) {
    return <pre>{format(data, { stripComments: false }).replace(/\s*\n/g, '\n')}</pre>
  }
  return <ObjectLabel name={name} data={data}/>
}

export default NodeRenderer

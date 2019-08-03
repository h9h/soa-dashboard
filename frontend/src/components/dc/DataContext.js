import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'

import WartenAnzeiger from '../WartenAnzeiger'

const DataContext = ({ dimensions, renderChart, colorScheme, zeitDomain, setBis, ...props }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref) return
    renderChart({ div: ref.current, dimensions, colorScheme, zeitDomain, setBis})
  }, [ref, dimensions, renderChart, colorScheme, zeitDomain, setBis])

  if (!ref) return <WartenAnzeiger />

  return (
    <div ref={ref}
         style={{ width: "100%", height: "100%" }}
         {...props.styles}
    />
  )
}

export default DataContext

DataContext.propTypes = {
  dimensions: PropTypes.object.isRequired,
  renderChart: PropTypes.func.isRequired,
  colorScheme: PropTypes.string,
  zeitDomain: PropTypes.arrayOf(PropTypes.object),
}

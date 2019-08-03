import React from 'react'
import { Green, Grey, Red } from '../styles'

const Originator = ({row}) => {
  if (row.value === 'ESB0') {
    return <Green>{row.value}</Green>
  } else if (row.value === 'OSB') {
    return <Red>{row.value}</Red>
  }

  return <Grey>{row.value}</Grey>
}

export default Originator

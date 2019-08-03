import React from 'react'
import styled from 'styled-components'

const R = styled.span`
  border: solid darkgray 1px;
  white-space: pre; 
`
const Rahmen = ({children}) => <R>{children}</R>

export default Rahmen

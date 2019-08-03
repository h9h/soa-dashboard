import React from 'react'
import { Icon } from './icons'
import styled from 'styled-components'

const A = styled.a`
  text-align: center;
  vertical-align: middle;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  &:hover {
    background-color: #e2e6ea;
    border-color: #dae0e5;
  }
`

const LinkButton = ({ href, glyph, text }) => (
  <A href={href} target="_blank" rel="noopener noreferrer">
    {glyph && <Icon glyph={glyph}/>}
    {text && (' ' + text)}
  </A>
)

export default LinkButton

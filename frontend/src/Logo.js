import React from 'react'
import logo from './customisation/logo.png'
import useComponentSize from '@rehooks/component-size'

const Logo = (props) => {
  const {width} = useComponentSize(props.element)
  return (
    <img src={logo} alt="logo" width={width * 0.9} {...props}/>
  )
}

export const LogoUnsized = (props) => {
  return (
    <img src={logo} alt="logo" {...props}/>
  )
}

export default Logo

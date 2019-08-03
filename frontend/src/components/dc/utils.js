import React from 'react'
import Tipp from '../Tipp'
import styled from 'styled-components'

const NoOfColors = styled.span`
  color: grey;
  font-size: smaller;  
`
const ColorBox = styled.span`
  color: ${props => props.color};
  &::after {
    content: "▰";
  }
`
export const getLengthColors = scheme => {
  return COLOR_SCHEMES[scheme].length
}

export const getColor = scheme => {
  const colors = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.Tableau10
  return index => {
    const i = parseInt('' + index, 10)
    return colors[i % colors.length]
  }
}

export const colorGenerator = scheme => {
  const colors = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.Tableau10
  let index = 0
  return () => {
    return colors[index++ % colors.length]
  }
}

function showColors (colors, anzahl) {
  return <>
    {colors.map((c, i) => {
      if (anzahl && anzahl > 0 && i > (anzahl - 1)) return null
      return <ColorBox key={i} color={c} />
    })}
  </>
}

const getSchemeRepresentation = scheme => {
  const schemeValue = scheme && scheme.value ? scheme.value : scheme
  const colors = COLOR_SCHEMES[schemeValue] || COLOR_SCHEMES.Tableau10
  return (
    <>
      {showColors(colors, 5)}
      &nbsp;
      <Tipp title={scheme}
            content={(
              <>
                <div>ColorScheme mit {colors.length} Farben:</div>
                {showColors(colors)}
              </>
            )}>
        <NoOfColors>[{colors.length}]</NoOfColors>
      </Tipp>
    </>
  )
}

export const getSchemeOptions = () => {
  return Object.keys(COLOR_SCHEMES)
    .sort((a, b) => COLOR_SCHEMES[a].length - COLOR_SCHEMES[b].length)
    .map(cs => ({label: getSchemeRepresentation(cs), value: cs}))
}

export class ColorRobin {
  constructor (scheme) {
    this.colors = getColor(scheme)
    this.names = new Map()
  }

  getColor (name) {
    if (this.names.has(name)) {
      return this.colors(this.names.get(name))
    }
    this.names.set(name, this.names.size)
    return this.colors(this.names.get(name))
  }
}

export const COLOR_SCHEMES = {
  Tableau10: [
    '#4E79A7',
    '#F28E2B',
    '#E15759',
    '#76B7B2',
    '#59A14F',
    '#EDC948',
    '#B07AA1',
    '#FF9DA7',
    '#9C755F',
    '#BAB0AC'],
  Tableau20: [
    '#4E79A7',
    '#A0CBE8',
    '#F28E2B',
    '#FFBE7D',
    '#59A14F',
    '#8CD17D',
    '#B6992D',
    '#F1CE63',
    '#499894',
    '#86BCB6',
    '#E15759',
    '#FF9D9A',
    '#79706E',
    '#BAB0AC',
    '#D37295',
    '#FABFD2',
    '#B07AA1',
    '#D4A6C8',
    '#9D7660',
    '#D7B5A6'],
  ColorBlind10: [
    '#1170aa',
    '#fc7d0b',
    '#a3acb9',
    '#57606c',
    '#5fa2ce',
    '#c85200',
    '#7b848f',
    '#a3cce9',
    '#ffbc79',
    '#c8d0d9'],
  SeattleGrays5: ['#767f8b', '#b3b7b8', '#5c6068', '#d3d3d3', '#989ca3'],
  Traffic9: [
    '#b60a1c',
    '#e39802',
    '#309143',
    '#e03531',
    '#f0bd27',
    '#51b364',
    '#ff684c',
    '#ffda66',
    '#8ace7e'],
  MillerStone11: [
    '#4f6980',
    '#849db1',
    '#a2ceaa',
    '#638b66',
    '#bfbb60',
    '#f47942',
    '#fbb04e',
    '#b66353',
    '#d7ce9f',
    '#b9aa97',
    '#7e756d'],
  SuperfishelStone10: [
    '#6388b4',
    '#ffae34',
    '#ef6f6a',
    '#8cc2ca',
    '#55ad89',
    '#c3bc3f',
    '#bb7693',
    '#baa094',
    '#a9b5ae',
    '#767676'],
  NurielStone9: [
    '#8175aa',
    '#6fb899',
    '#31a1b3',
    '#ccb22b',
    '#a39fc9',
    '#94d0c0',
    '#959c9e',
    '#027b8e',
    '#9f8f12'],
  Greens9: [
    '#f7fcf5',
    '#e5f5e0',
    '#c7e9c0',
    '#a1d99b',
    '#74c476',
    '#41ab5d',
    '#238b45',
    '#006d2c',
    '#00441b'
  ],
  Reds9: [
    '#fff5f0',
    '#fee0d2',
    '#fcbba1',
    '#fc9272',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#a50f15',
    '#67000d'
  ],
  GreenRed10: [
    '#006d2c',
    '#238b45',
    '#41ab5d',
    '#74c476',
    '#d5bb21',
    '#f8b620',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#a50f15',

  ],
  RedBlueBrown12: [
    '#466f9d',
    '#91b3d7',
    '#ed444a',
    '#feb5a2',
    '#9d7660',
    '#d7b5a6',
    '#3896c4',
    '#a0d4ee',
    '#ba7e45',
    '#39b87f',
    '#c8133b',
    '#ea8783'],
  HueCircle19: [
    '#1ba3c6',
    '#2cb5c0',
    '#30bcad',
    '#21B087',
    '#33a65c',
    '#57a337',
    '#a2b627',
    '#d5bb21',
    '#f8b620',
    '#f89217',
    '#f06719',
    '#e03426',
    '#f64971',
    '#fc719e',
    '#eb73b3',
    '#ce69be',
    '#a26dc2',
    '#7873c0',
    '#4f7cba'],
  RedGreen7: [
    '#a3123a',
    '#e33f43',
    '#f8816b',
    '#ced7c3',
    '#73ba67',
    '#44914e',
    '#24693d'],
  GreenBlue7: [
    '#24693d',
    '#45934d',
    '#75bc69',
    '#c9dad2',
    '#77a9cf',
    '#4e7fab',
    '#2a5783'],
  RedBlue7: [
    '#a90c38',
    '#e03b42',
    '#f87f69',
    '#dfd4d1',
    '#7eaed3',
    '#5383af',
    '#2e5a87'],
  Temperature7: [
    '#529985',
    '#6c9e6e',
    '#99b059',
    '#dbcf47',
    '#ebc24b',
    '#e3a14f',
    '#c26b51'],
  BlueGreen7: [
    '#feffd9',
    '#f2fabf',
    '#dff3b2',
    '#c4eab1',
    '#94d6b7',
    '#69c5be',
    '#41b7c4'],
  Blue10: [
    '#b9ddf1',
    '#a5cfe9',
    '#92c0df',
    '#80b0d5',
    '#72a3c9',
    '#6394be',
    '#5485b2',
    '#4878a6',
    '#3d6a98',
    '#305d8a'],
}

export const legendTiming = breakpoints => d => {
  const index = parseInt(d.name || d.key || d, 10)
  if (!index || index === 0) return breakpoints[0] === 0 ? 'Keine Zeitmessung' : `bis ${breakpoints[0]} ms`
  if (index === breakpoints.length) return `mehr als ${breakpoints[breakpoints.length - 1]} ms`
  return `${breakpoints[index - 1]} <= ms < ${breakpoints[index]}`
}

export const TIMINGS = {
  GESAMT: {key: 'timingGesamt', title: 'Zeit Gesamt'},
  PROVIDER: {key: 'timingProvider', title: 'Zeit Provider'},
  BUS: {key: 'timingBus', title: 'Zeit Bus'},
}

export const ZAHL_FORMAT = Intl.NumberFormat('de-DE').format

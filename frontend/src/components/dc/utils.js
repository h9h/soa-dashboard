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
    content: '▰';
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
  GreenBlue7: [
    '#24693d',
    '#45934d',
    '#75bc69',
    '#c9dad2',
    '#77a9cf',
    '#4e7fab',
    '#2a5783'],
  BlueGreen7: [
    '#feffd9',
    '#f2fabf',
    '#dff3b2',
    '#c4eab1',
    '#94d6b7',
    '#69c5be',
    '#41b7c4'],
  ColorpickerGreenRed10: [
    '#35C445',
    '#6ABF2E',
    '#8DBA1A',
    '#A9B30C',
    '#C1AC12',
    '#D5A421',
    '#E59C33',
    '#F19545',
    '#F99056',
    '#FD8C68'
  ], // http://tristen.ca/hcl-picker/#/hcl/10/1/35C445/FD8C68
  ColorBlind25: [
    '#d67b2b',
    '#a65cd1',
    '#49c058',
    '#d4499c',
    '#85b937',
    '#5971cb',
    '#d5a32d',
    '#8c529b',
    '#b1b23a',
    '#bd91d8',
    '#438530',
    '#d6425a',
    '#51c2a1',
    '#d84d2c',
    '#4fa7d6',
    '#a7472f',
    '#7db96d',
    '#9c4664',
    '#37845f',
    '#dd809f',
    '#697329',
    '#de8268',
    '#a3ae68',
    '#8f672b',
    '#d1a360'
  ], // https://medialab.github.io/iwanthue/
  Sapiens: [
    '#354147',
    '#FF4A00',
    '#FD7622',
    '#969EA2',
    '#499DF3',
    '#13D0AB',
    '#DADFE2',
    '#FC1C74',
    '#FFC43E',
    '#5F6C72',
    '#6061ED',
    '#46CAEF'
  ]
}

export const legendTiming = breakpoints => d => {
  const index = parseInt(d.name || d.key || d, 10)
  if (!index || index === 0) return breakpoints[0] === 0 ? 'Keine Zeitmessung' : `bis ${breakpoints[0]} ms`
  if (index === breakpoints.length) return `mehr als ${breakpoints[breakpoints.length - 1]} ms`
  return `${breakpoints[index - 1]} <= ms < ${breakpoints[index]}`
}

export const TIMINGS = {
  GESAMT: {key: 'timingGesamt', title: 'Antwortzeit'},
  PROVIDER: {key: 'timingProvider', title: 'Verarbeitungszeit'},
  BUS: {key: 'timingBus', title: 'Bus-Zeit'},
}

export const ZAHL_FORMAT = Intl.NumberFormat('de-DE').format

import React from 'react'
import Form from 'react-bootstrap/Form'
import ButtonWithTip from '../ButtonWithTip'

const RowAktionen = ({ row }) => {
  console.log('XXXXX')
  if (row.aggregated) return <RowAktionenAggregated row={row} />
  return <RowAktionenEinzel row={row} />
}

export default RowAktionen


const RowAktionenAggregated = ({ row }) => {
  const buttons = []

  return <ButtonRow buttons={buttons} />
}

const RowAktionenEinzel = ({ row }) => {
  const buttons = []

  return <ButtonRow buttons={buttons} />
}

const ButtonRow = ({ buttons }) => (
  <Form inline>
    {buttons.map(button => (
      <ButtonWithTip
        key={button.title}
        title={button.title}
        description={button.description}
        glyph={button.glyph}
        handleClick={button.handleClick}
      />
    ))}
  </Form>
)

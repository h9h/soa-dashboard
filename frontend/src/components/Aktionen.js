import React, { useState } from 'react'
import { DEFAULT_CONFIG } from '../logic/transactions/Job'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import FormControl from 'react-bootstrap/FormControl'
import Blank from './Blank'
import ButtonWithTip from './ButtonWithTip'

export const AKTIONEN = {
  NUR_LOG: 'Nur Log-Durchlauf',
  RESEND: 'Re-Send Messages (Nachricht aus Queue)',
  RESEND_JOBDATA: 'Re-Send Messages (Nachricht aus lokaler Datei)'
}

const OptionenAktion = () => (
  <>
    <option key={'-'} value={''}>keine Aktion gewählt</option>
    {Object.entries(AKTIONEN).map(([key, val]) => <option key={key} value={val}>{val}</option>)}
  </>
)

export const Aktionen = ({onClickAktion}) => {
  const [aktion, setAktion] = useState({name: '-', config: DEFAULT_CONFIG})

  const onChangeAktionName = e => setAktion({...aktion, name: e.target.value})
  const onChangeAktionStopIfErrCountGreater = e => setAktion({
    ...aktion,
    config: {...aktion.config, stopIfErrCountGreater: parseInt('' + e.target.value, 10)}
  })

  return (
    <>
      <h3>Aktionen</h3>
      <Form inline>
        <FormGroup controlId="select.aktion">
          <FormControl as="select"
                       value={aktion.name}
                       onChange={onChangeAktionName}
                       style={{width: '300px'}}
          >
            <OptionenAktion/>
          </FormControl>
          <Blank/>
          <Blank/>
          Abbruch, wenn Fehlerzahl größer
          <Blank/>
          <FormControl as="input"
                       value={aktion.config.stopIfErrCountGreater}
                       onChange={onChangeAktionStopIfErrCountGreater}
                       style={{width: '50px'}}
          />
          <Blank/>
          <Blank/>
          { onClickAktion && (
            <ButtonWithTip
              title="Aktion"
              description="Führe Aktion aus"
              glyph="execute"
              handleClick={() => onClickAktion(aktion)}
              disabled={aktion.name === '-'}
            />
          )}
        </FormGroup>
      </Form>
    </>
  )
}

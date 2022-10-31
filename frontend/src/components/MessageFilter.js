import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Blank from './Blank'
import ButtonWithTip from './ButtonWithTip'
import styled from 'styled-components'
import ReactJson from 'react-json-view'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Tipp from './Tipp'
import moment from 'moment'
import MessageFilterInput from './MessageFilterInput'

const FilterExample = styled.div`
  color: grey;
  font-size: smaller;
  padding-top: 10px;
  padding-bottom: 10px;
`

const checkFilter = filter => {
  const result = []
  if (filter.indexOf('=') > -1 && filter.indexOf('==') < 0) { result.push('Zuweisung statt Vergleich? Bitte mittels "===" testen!')}
  return result
}

/* eslint-disable */
const testEvaluateFilter = (filter, row) => {
  try {
    const index = 0
    const now = moment()
    const evaluated = eval(filter)
    const hinweise = checkFilter(filter)
    /* eslint-enable */
    if (evaluated && typeof evaluated === 'object') {
      return { hinweise, ...evaluated }
    } else {
      return { hinweise, evaluated }
    }
  } catch (e) {
    return {error: e.message}
  }
}

const MessageFilter = ({row, defaultFilter, handleFilter}) => {
  const [filter, setFilter] = useState(defaultFilter)

  const handleFilterChange = event => {
    const value = event.target ? event.target.value : event
    setFilter(value)
  }

  const messageId = row && row.MESSAGEID ? row.MESSAGEID : ''
  let testFilter = testEvaluateFilter(filter, row)

  return (
    <>
      <Row>
        <Col>
          <div>
          <Form  className="d-flex" onSubmit={() => false}>
            <FormGroup>
              <Tipp title="Filter" content={(
                <>
                  <div>Mittels dieses Filters können Sie die geladenen Sätze weiter einschränken.</div>
                  <div>
                    Dazu wird der jeweilige Satz in der Variablen <code>row</code> zur Verfügung gestellt.
                    Der Filterausdruck ist reiner JavaScript-Code und muss einen boolschen Wert als Ergebnis liefern.
                  </div>
                  <div>
                    Beispiele
                    <ul>
                      <li><code>row.MESSAGEID === '...'</code> - Nachricht mit dieser MessageID</li>
                      <li><code>row.SENDERFQN.indexOf('SAP-CML') > -1</code> - SenderFQN enthält 'SAP-CML'</li>
                      <li><code>row.Timestamp.valueOf() > Date.now() - 1000*60*60*2</code> - jünger als 2 Stunden</li>
                      <li><code>Ausdruck1 && Ausdruck2</code> - Ausdruck1 und Ausdruck2 sind wahr</li>
                    </ul>
                  </div>
                  <div>
                    Tipp: Wenn Sie als Filterausdruck einfach <code>row</code> eingeben, wird der Inhalt der Variablen
                    angezeigt. So finden Sie einfach heraus, auf welche Variablen Sie zugreifen können.
                  </div>
                </>
              )}>
                <Form.Label>Filter: </Form.Label>
              </Tipp>
              <Blank/>
              <MessageFilterInput
                row={row}
                onChange={handleFilterChange}
                value={filter}
              />
              <Blank/>
              <Blank/>
              <ButtonWithTip
                title="Filter"
                description="Filtere Nachrichten. Diese Filterung ist dann auch für die Speicherung des Jobs relevant."
                glyph="filter"
                handleClick={() => {
                  handleFilter(filter)
                }}
                disabled={filter !== '' && (testFilter.evaluated !== true && testFilter.evaluated !== false)}
              />
            </FormGroup>
          </Form>
          </div>
        </Col>
      </Row>
      <FilterExample>
        <Row>
          <Col xs={4}>
            {messageId && (
              <div>
                Test-Message:<br/>
                {messageId}<br/>
                (Message durch Click auf Message-ID in der Tabelle auswählen)
              </div>
            )}
          </Col>
          <Col xs={8}>
            {messageId && (
              <ReactJson src={testFilter}
                         name={null}
                         collapsed={2}
                         shouldCollapse={field => {
                           if (!field.name) return false
                           return field.name !== 'evaluated' && field.name !== 'hinweise'
                         }}
                         collapseStringsAfterLength={150}
                         displayDataTypes={false}
                         displayObjectSize={false}
                         enableClipboard={false}
              />
            )}
          </Col>
        </Row>
      </FilterExample>
    </>
  )
}

export default MessageFilter

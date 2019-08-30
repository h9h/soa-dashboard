import React from 'react'
import Container from 'react-bootstrap/Container'
import Header from './components/Header'
import BodyArea from './components/BodyArea'
import LogTable, { UnconnectedLogTable } from './components/LogTable'
import Log from './log'
import { Helmet } from 'react-helmet'
import HeaderStandalone from './components/HeaderStandalone'
import moment from 'moment'

const log = Log('pagedashboard')

const PageDashboard = props => {
  log.trace('Mount PageDashboard')

  if (props && props.match && props.match.params) {
    const {match: {params: { umgebung, datum, von, bis, searchType, searchValue }}} = props
    if (umgebung) {
      log.trace('...mit Parametern', umgebung, datum, von, bis, searchType, searchValue)

      const title = <div>
        Nachrichten auf {umgebung} am {moment(datum, 'YYYY-MM-DD').format('DD.MM.YYYY')}
        {searchValue ? ` für ${searchType} ${decodeURIComponent(searchValue)}` :  ` von ${von} bis ${bis}`}
      </div>

      return (
        <>
          <Helmet>
            <title>{umgebung}/{datum}/{bis}</title>
          </Helmet>
          <Container fluid>
            <HeaderStandalone title={title}/>
            <BodyArea>
              <UnconnectedLogTable {...props.match.params}/>
            </BodyArea>
          </Container>
        </>
      )
    }
  }

  return (
    <>
      <Helmet>
        <title>ESB-Dashboard</title>
      </Helmet>
      <Container fluid>
        <Header/>
        <BodyArea>
          <LogTable/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageDashboard

import React from 'react'
import Container from 'react-bootstrap/Container'
import Header from './components/Header'
import BodyArea from './components/BodyArea'
import LogTable, { UnconnectedLogTable } from './components/LogTable'
import Log from './log'
import { Helmet } from 'react-helmet'
import HeaderStandalone from './components/HeaderStandalone'

const log = Log('pagedashboard')

const PageDashboard = props => {
  log.trace('Mount PageDashboard')

  if (props && props.match && props.match.params) {
    const {match: {params: { umgebung, datum, von, bis, searchType, searchValue }}} = props
    if (umgebung) {
      log.trace('...mit Parametern', umgebung, datum, von, bis, searchType, searchValue)

      return (
        <>
          <Helmet>
            <title>{umgebung}/{datum}/{bis}</title>
          </Helmet>
          <Container fluid>
            <HeaderStandalone umgebung={umgebung} datum={datum} von={von} bis={bis} searchType={searchType} searchValue={searchValue}/>
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

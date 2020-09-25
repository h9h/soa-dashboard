import React from 'react'
import Container from 'react-bootstrap/Container'
import Header from './components/Header'
import BodyArea from './components/BodyArea'
import Log from './log'
import { Helmet } from 'react-helmet'
import HeaderStandalone from './components/HeaderStandalone'
import moment from 'moment'
import LogpointTable from './components/LogpointTable'
import { useDispatch, useSelector } from 'react-redux'

const log = Log('pagedashboard2')

/*
Diese Funktion unterscheidet, ob die Seite mit Parametern aufgerufen wurde oder nicht.
Falls mit Parametern, dann werden diese ausgewertet, und als State der Anwendung zurückgegeben.
Falls nicht, dann wird der Redux-State genommen.

Als Ergebnis steht in beiden Fällen ein Objekt mit den notwendigen Parametern für die Logpunkt
Selektion und Anzeige zur Verfügung.
 */
const usePropsOrState = (props) => {
  const stateProps = useSelector(state => ({
    umgebung: state.umgebung,
    datum: state.datum,
    von: state.von,
    bis: state.bis,
    searchType: state.logSearchType,
    searchValue: state.logSearchValue,
  }))

  let dispatch = useDispatch()

  if (props && props.match && props.match.params && props.match.params.umgebung) {
    console.log('props.match.params', props.match.params)
    const {match: {params: {umgebung, datum, von, bis, searchType, searchValue}}} = props
    stateProps.umgebung = umgebung
    stateProps.datum = datum
    stateProps.von = von
    stateProps.bis = bis
    stateProps.searchType = searchType
    stateProps.searchValue = searchValue ? decodeURIComponent(searchValue): searchValue
    stateProps.standalone = true
    dispatch = () => {}
  } else {
    stateProps.standalone = false
  }

  console.log('StateProps', stateProps)
  return [stateProps, dispatch]
}

const PageDashboard2 = props => {
  log.trace('Mount or render PageDashboard')
  const [state/*, dispatch*/] = usePropsOrState(props)
  const {umgebung, datum, von, bis, searchType, searchValue, standalone} = state

  const headerTitle = (
    <div>
      Nachrichten auf {umgebung} am {moment(datum, 'YYYY-MM-DD').format('DD.MM.YYYY')}
      {searchValue ? ` für ${searchType} ${searchValue}` :  ` von ${von} bis ${bis}`}
    </div>
  )

  const helmetTitle = standalone ? `${umgebung}/${datum}/${bis}` : 'ESB Dashboard'
  const header = standalone ? <HeaderStandalone title={headerTitle}/> : <Header />

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
      </Helmet>
      <Container fluid>
        {header}
        <BodyArea>
          <LogpointTable {...state}/>
        </BodyArea>
      </Container>
    </>
  )
}

export default PageDashboard2

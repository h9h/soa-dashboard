import React, { useState } from 'react'
import DieSeiten from './DieSeiten'
import SectionDashboard from './SectionDashboard'
import SectionNavigation from './SectionNavigation'
import SectionDashboardBody from './SectionDashboardBody'
import SectionUndeliveredMessages from './SectionUndeliveredMessages'
import SectionJobs from './SectionJobs'
import styled from 'styled-components'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Grey } from '../styles'

const Inhaltsverzeichnis = styled.ul`
`
const KapitelLink = styled.li`
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`

const CONTENT = {
  'Die Seiten des Dashboards': <DieSeiten/>,
  'Navigieren im Dashboards': <SectionNavigation/>,
  'Die Startseite des Dashboards': <SectionDashboard/>,
  'Umgang mit Servicecalls und Logpunkten': <SectionDashboardBody/>,
  'Nicht zugestellte Nachrichten': <SectionUndeliveredMessages />,
  'Jobs (Resend etc.)': <SectionJobs/>
}

export default () => {
  const [page, setPage] = useState(Object.keys(CONTENT)[0])

  const Kapitel = ({titel}) => {
    return (
      <KapitelLink onClick={() => {
        setPage(titel)
      }} active={titel === page}>{titel}</KapitelLink>
    )
  }

  return (
    <>
      <Row>
        <Col xs={4}>
          <Grey>
            <h3>Inhaltsverzeichnis:</h3>
            <Inhaltsverzeichnis>
              {Object.keys(CONTENT)
                .map(titel => <Kapitel key={titel} titel={titel}/>)}
            </Inhaltsverzeichnis>
          </Grey>
        </Col>
        <Col xs={8}>
          {CONTENT[page]}
        </Col>
      </Row>
    </>
  )
}

import React from 'react'
import Section from './Section'
import { HeaderForm } from '../Header'
import moment from 'moment'
import IconExplanation from './IconExplanation'
import ComponentExplanation from './ComponentExplanation'
import FormControl from 'react-bootstrap/FormControl'
import { getUmgebungen } from '../../logic/api/api-dashboard'
import { getConfiguration } from '../../configuration'
import Datum from '../datetime/Datum'
import Zeit from '../datetime/Zeit'
import { Paragraph } from './styles'
import { LOG_SEARCH_TYPES } from '../../logic/store'

const noop = () => {}
const datum = moment().format('YYYY-MM-DD')
const zeit = '12:00'

const selection = (
  <FormControl as="select" value={'EW'} onChange={noop}>
    {getUmgebungen(getConfiguration().umgebungen)
      .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
  </FormControl>
)

const selection2 = (
  <FormControl as="select" value={'Message-Id'} onChange={noop}>
    {['Message-Id', 'Sender-FQN', 'Referenz']
      .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
  </FormControl>
)

const datuminput = (
  <FormControl
    as={Datum}
    date={datum}
    setDate={noop}
  />
)

const zeitInput = (
  <FormControl
    as={Zeit}
    date={zeit}
    setDate={noop}
  />
)

export default () => (
  <Section title="Die Dashboard-Seite">
    <Paragraph>
      Die Dashboard-Seite ist die Startseite des ESB-Dashboards. Sie bietet
      einen schnellen Überblick auf den aktuellen Verlauf der Logpunkte der SOA.
    </Paragraph>
    <Paragraph>
      Wir jede Seite im ESB-Dashboard besteht das Dashboard aus der Kopfleiste
      mit dem Menü, dem Körper und der allgemeinen Fußleiste, die sich auf jeder
      Seite wieder findet.
    </Paragraph>
    <Paragraph>
      Die Menüleiste der Dashboard-Seite - wie auch der anderen Seiten - setzt
      sich aus dem für die Seite
      spezifischen Teil links und der allgemeinen Navigation rechts zusammen.
    </Paragraph>
    <Paragraph>Hier ist der spezifische Teil:</Paragraph>
    <Paragraph>
      <HeaderForm setFilter={noop}
                  actualise={noop}
                  datum={datum}
                  bis={'12:00'}
                  searchType={LOG_SEARCH_TYPES.MESSAGEID}
                  searchValue={''}
                  width={200}
      />
    </Paragraph>
    <Paragraph>
      Die Elemente im einzelnen:
    </Paragraph>
    <IconExplanation glyph="actualise">
      aktualisiere die Selektionszeit auf Jetzt und lade die neuen Logpunkte
    </IconExplanation>
    <ComponentExplanation component={selection}>
      Auswahl der Umgebung
    </ComponentExplanation>
    <ComponentExplanation component={datuminput}>
      das Datum, zu dem die Logpunkte selektiert werden sollen
    </ComponentExplanation>
    <ComponentExplanation component={zeitInput}>
      die Ende-Zeit, bis zu der Logpunkte selektiert werden sollen.
    </ComponentExplanation>
    <ComponentExplanation component={selection2}>
      Optionale Suchkriterien. Zur Verfügung stehen:
      <ul>
        <li>Message-Id</li>
        <li>Sender FQN</li>
        <li>
          Referenz - Suche nach einer fachlichen Referenz (Vertragsnummer, Schadennnummer etc)<br />
          <em>N.B.</em> derzeit ist die API noch nicht überall verteilt, daher funktioniert es noch nicht
        </li>
      </ul>
    </ComponentExplanation>
    <IconExplanation glyph="execute">
      führt die Selektion mit den eingegebenen Kriterien aus.
    </IconExplanation>
    <IconExplanation glyph="snapshot">
      öffnet einen neuen Brower-Tab mit der gewünschten Selektion. Der Link
      dieses Tabs
      ist auch zur Weitergabe an weitere Personen geeignet.
    </IconExplanation>
  </Section>
)

import React from 'react'
import Section from './Section'
import moment from 'moment'
import IconExplanation from './IconExplanation'
import ComponentExplanation from './ComponentExplanation'
import FormControl from 'react-bootstrap/FormControl'
import { getUmgebungen } from '../../logic/api/api-dashboard'
import Datum from '../datetime/Datum'
import Zeit from '../datetime/Zeit'
import { Paragraph } from './styles'
import { getConfigurationValue } from '../../logic/configuration'

const noop = () => {}
const datum = moment().format('YYYY-MM-DD')
const zeit = '12:00'

const selection = (
  <FormControl as="select" value={'EW'} onChange={noop}>
    {getUmgebungen(getConfigurationValue('umgebungen'))
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
    <Paragraph>
      Die Elemente des spezifischen Teils im einzelnen:
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
      die Ende-Zeit, bis zu der Logpunkte selektiert werden sollen. Im Default wird über einen Zeitraum von 10 Minuten
      gesucht. In Produktion unter Tage sind die 10.000 Logpunkte, die bei einem einzelnen Query geliefert werden,
      innerhalb weniger Sekunden aufgebraucht.
    </ComponentExplanation>
    <ComponentExplanation component={selection2}>
      Optionale Suchkriterien. Zur Verfügung stehen:
      <ul>
        <li>Message-Id</li>
        <li>Sender FQN</li>
        <li>
          Referenz - Suche nach einer fachlichen Referenz (Vertragsnummer, Schadennnummer etc)
        </li>
        <li>Service-Namespace - Suche nach einem Service, z.B. <i>http://example.com/service/domian/subdomain/PartnerAuskunft1</i></li>
      </ul>
      Wenn hiermit gesucht wird, dann wird der Suchzeitraum auf eine Stunde ausgedehnt. Daher kann die Suche ein paar Sekunden dauern.
    </ComponentExplanation>
    <IconExplanation glyph="daylight">
      Zeigt nur die Tagesdaten an (06:00 - 20:00).
    </IconExplanation>
    <IconExplanation glyph="night">
      Zeigt nur die Daten der Nachtverarbeitung an (21:00 - 5:00).
    </IconExplanation>
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

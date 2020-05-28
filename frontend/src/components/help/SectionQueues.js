import React from 'react'
import Section from './Section'
import { Paragraph, Abbildung } from './styles'
import ComponentExplanation from './ComponentExplanation'
import FormControl from 'react-bootstrap/FormControl'
import { getUmgebungen } from '../../logic/api/api-dashboard'
import { Icon } from '../icons'
import { getConfigurationValue } from '../../logic/configuration'

const noop = () => {}

const selection = (
  <FormControl as="select" value={'EW'} onChange={noop}>
    {getUmgebungen(getConfigurationValue('umgebungen'))
      .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
  </FormControl>
)

const queues = (
  <FormControl as="select" value={'ME'} onChange={noop}>
    <option key='ME'>ME</option>
  </FormControl>
)

export default () => (
  <Section title="Seite 'Queues'">
    <Paragraph>
      Auf der Seite "Queues" <Icon glyph={'queues'}/> werden Informationen zu den Queues dargestellt.
    </Paragraph>
    <Paragraph>
      Über die Kopfzeile können Sie die Auswahl der Nachrichten beeinflussen. Die Elemente im einzelnen:
    </Paragraph>
    <ComponentExplanation component={selection}>
      Auswahl der Umgebung
    </ComponentExplanation>
    <ComponentExplanation component={queues}>
      Auswahl der Queue, abhängig von der Umgebung
    </ComponentExplanation>
    <p />
    <h3>Die Spalten der Tabelle</h3>
    <Paragraph>
      <Abbildung>
        <img alt="Spalten der Queue-Tabelle" src="./images/QueuesTable.png" width="90%"/>
      </Abbildung>
      <em>Expiration:</em> Die Zeit in Stunden, bis eine nicht zugestellte Nachricht in der Dead-Letter Queue landet.<br />
      <em>Waiting/Ready:</em> Zählt Sätze, die aktuell zur Verarbeitung stehen bzw. gerade verarbeitet werden.<br />
      <em>Expired:</em> Anzahl abgelaufener Nachrichten, für die bereits alle Retry-Versuche durchlaufen wurden. Ein erneuter Resend-Anstoß aus der Queue erfolgt nicht mehr.<br />
      <em>Scheduler:</em> Damit ist der DB-Scheduler auf der ME-DB gemeint. (e-Klasse MEVIXX10, i-Klasse MEXXXX10...) Ein Restart des Scheduler kann z.b. von den DB-Admins ausgeführt werden.<br />
    </Paragraph>
  </Section>
)

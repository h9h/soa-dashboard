import React from 'react'
import Section from './Section'
import IconExplanation from './IconExplanation'
import { Paragraph } from './styles'
import { HeaderForm } from '../HeaderMessages'
import ComponentExplanation from './ComponentExplanation'
import FormControl from 'react-bootstrap/FormControl'
import { getUmgebungen } from '../../logic/api/api-dashboard'
import Datum from '../datetime/Datum'
import moment from 'moment'
import { OptionenMessageTypes } from '../../logic/tableConfMessages'
import MessageFilter from '../MessageFilter'
import { Icon } from '../icons'
import { getConfigurationValue } from '../../logic/configuration'

const noop = () => {}

const selection = (
  <FormControl as="select" value={'EW'} onChange={noop}>
    {getUmgebungen(getConfigurationValue('umgebungen'))
      .map(umgebung => <option key={umgebung}>{umgebung}</option>)}
  </FormControl>
)

const von = moment().subtract(14, 'days').format('YYYY-MM-DD')
const bis = moment().format('YYYY-MM-DD')

const datuminput = datum => (
  <FormControl
    as={Datum}
    date={datum}
    setDate={noop}
  />
)

const messageTyp = (
  <FormControl
    as="select"
    value={'Undelivered'}
    onChange={noop}
  >
    {OptionenMessageTypes}
  </FormControl>
)

const row =     {
    "ID": "beb9aed2-a2a6-42d2-adbb-af51e00d37ef",
    "LOGTIMESTAMP": "2019-06-25T16:11:56.022+02:00",
    "ENVIRONMENT": "EW",
    "OPERATION": "eineServiceOperation",
    "SERVICE": "http://cluster/in/domaenen/EinService1",
    "MEP": "fireAndForget",
    "MESSAGETYPE": "Request",
    "MESSAGEID": "M-888AB404-DE20-0472-E053-0A02153EF7B6",
    "SENDERFQN": "fully.quallified.name:EinService",
    "PROCESSINSTANCEID": "P-888AB404-DE1F-0472-E053-0A02153EF7B6",
    "SENDERTIMESTAMP": "2019-05-10T15:03:42.300Z",
    "PARENTPROCESSINSTANCEID": null,
    "RELATESTOMESSAGEID": null,
    "ENCODING": null,
    "MESSAGE": "hier wäre ein Nachrichteninhal",
    "ERRORCODE": "ein.error.code",
    "REASON": "net.sf.saxon.trans.XPathException: org.xml.sax.SAXParseException; cvc-pattern-valid: Wert '' ist nicht Facet-gültig in Bezug auf Muster '[a-z][\\.a-z]{0,63}([A-Za-z][\\-a-zA-Z_0-9]{0,15}):([A-Za-z][\\-a-zA-Z_0-9]{0,255}):([A-Za-z][\\-a-zA-Z_0-9]{0,255})' für Typ 'senderFQNType'.",
    "REPLYCONTEXT": null,
    "filter": {
      "umgebung": "EW",
      "messageType": "Undelivered",
      "datumVon": "2019-06-20",
      "datumBis": "2019-06-26"
    },
    "Sender": "de.name.des.senders:provider",
    "Timestamp": "2019-06-25T14:11:56.022Z",
    "ServiceOperation": [
      "http://cluster/in/domaenen/EinService1",
      "eineServiceOperation"
    ],
    "MessageSize": 1045
  }

  export default () => (
  <Section title="Nicht zugestellte Nachrichten">
    <Paragraph>
      Auf der Seite ESB-Messages werden die nicht-zugestellten Nachrichten angezeigt. "Nicht zugestellte Nachrichten" können sein:
      <ul>
        <li><code>Undelivered</code>: Nachrichten, die nicht vom Bus an den Provider ausgeliefert werden können</li>
        <li><code>Rejected</code>: Nachrichten, die der Bus nicht weiterverarbeiten kann</li>
        <li><code>Dead Letter</code>: Nachrichten, deren Time-To-Live abgelaufen ist</li>
      </ul>
    </Paragraph>
    <Paragraph>
      Über die Kopfzeile können Sie die Auswahl der Nachrichten beeinflussen:
    </Paragraph>
    <Paragraph>
      <HeaderForm umgebung="EW" messageType="Undelivered" datumVon="2019-06-15" datumBis="2019-07-01" setFilterMessages={noop}/>
    </Paragraph>
    <Paragraph>Die Elemente im einzelnen:</Paragraph>
    <ComponentExplanation component={selection}>
      Auswahl der Umgebung
    </ComponentExplanation>
    <ComponentExplanation component={messageTyp}>
      Auswahl des Message-Typs: "Undelivered", "Rejected" oder "Dead Letter"
    </ComponentExplanation>
    <ComponentExplanation component={datuminput(von)}>
      das Datum, ab dem die Nachrichten selektiert werden sollen
    </ComponentExplanation>
    <ComponentExplanation component={datuminput(bis)}>
      das Datum, bis zum dem die Nachrichten selektiert werden sollen (inklusive)
    </ComponentExplanation>
    <IconExplanation glyph="execute">
      führt die Selektion mit den eingegebenen Kriterien aus.
    </IconExplanation>
    <p />
    <h3>Gezielte Auswahl aus den selektierten Sätzen</h3>
    <Paragraph>
      Für das Resenden von Nachrichten muss es möglich sein, Nachrichten gezielt auszuwählen. Dies ist mithilfe des Filters möglich:
      Die Variable <code>row</code> enthält jeweils einen Nachrichtensatz. Diejenigen Sätze werden gefiltert, für die die Auswertung
      des Ausdrucks <code>true</code> ergibt. Der Ausdruck kann dabei beliebiger JavaScript-Code sein.
    </Paragraph>
    <Paragraph>
      z.B.:
      <ul>
        <li><code>row.OPERATION.indexOf('Partner') > -1</code>: selektiert alle Sätze, deren Operationsname "Partner" enthält</li>
        <li><code>row.SENDERFQN === 'ein.voll.qualifizierter.sender'</code>: selektiert alle Sätze mit dem gegebenen SenderFQN</li>
      </ul>
      Zur Hilfestellung wird die Evaluation des Ausdrucks rechts unterhalb des Filters als "evaluated" dargestellt. Tipp: Um zu sehen, welche
      Elemente im Satz zur Verfügung stehen, als Ausdruck einfach <code>row</code> angeben. Das folgende Element ist interaktiv - probieren Sie es aus!
    </Paragraph>
    <Paragraph>
      <MessageFilter row={row} defaultFilter='' handleFilter={noop} />
    </Paragraph>
    <Paragraph>
      Standardmäßig wird der erste Datensatz für das Filterbeispiel ("Test-Message") eingestellt. Wenn man sehen möchte, welches Ergebnis der Filter
      für einen anderen Satz ergibt, reicht es, die Zelle Message-ID des gewünschten Satzes anzuklicken, dann wird dieser eingestellt.
    </Paragraph>
    <Paragraph>
      Mittels <Icon glyph="filter" /> wird der Filter auf die Datensätze angewandt.
    </Paragraph>
    <p />
    <h3>Persistieren der Auswahl</h3>
    <Paragraph>
      Damit die Auswahl in einem Job (z.B. Resend) verwendet werden kann, müssen die Datensätze gespeichert werden. Dies
      können Sie über das Eingabefeld "Job-Name" tun. Bitte beachten Sie dabei, dass keine Prüfung erfolgt, ob dieser
      Name bereits vorher verwendet wurde - im Zweifelsfall wird überschrieben!
    </Paragraph>
    <Paragraph>
      Beim Speichern mittels <Icon glyph="save" /> werden die aktuellen Sätze der Tabelle in eine lokale Datei gespeichert.
      Mittels <Icon glyph="jobs" /> können Sie auf die Jobs-Seite wechseln und erhalten dabei den gerade gespeicherten Job
      voreingestellt.
    </Paragraph>
  </Section>
)

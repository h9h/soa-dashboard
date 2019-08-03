import React from 'react'
import Section from './Section'
import { Paragraph, Bold } from './styles'
import ComponentExplanation from './ComponentExplanation'
import MessageId from '../cells/MessageId'
import { LogpointNummer } from '../cells/LogpointNummer'
import { Timing } from '../cells/Timing'
import { MEP_NAMES } from '../../logic/mep'

const messageId = 'M-65a96216-7bec-400e-9da5-487917351657'

const row = {
  aggregated: true,
  subRows: [
    {filter: {}, Timestamp: 1, LOGPOINTNO: 2, MESSAGEID: messageId, MEP: MEP_NAMES.requestReply },
    {Timestamp: 2, LOGPOINTNO: 8, MESSAGEID: messageId, MEP: MEP_NAMES.requestReply },
    {Timestamp: 1, LOGPOINTNO: 9, MESSAGEID: messageId, MEP: MEP_NAMES.requestReply },
    {Timestamp: 1001, LOGPOINTNO: 10, MESSAGEID: messageId, MEP: MEP_NAMES.requestReply },
    {Timestamp: 106, LOGPOINTNO: 11, MESSAGEID: messageId, MEP: MEP_NAMES.requestReply },
    {Timestamp: 118, LOGPOINTNO: 57, MESSAGEID: messageId, MEP: MEP_NAMES.requestReply },
  ],
}
export default () => (
  <Section title="Der Aufbau der Dashboard Seite">
    <Paragraph>
      Das Körper des Dashboards setzt sich aus zwei Bereichen zusammen:
    </Paragraph>
    <ul>
      <li><Paragraph>einer <Bold>Balkengrafik</Bold> im oberen Bereich, die die
        Verteilung der Servicecalls darstellt:</Paragraph>
        <img width="100%" alt="Balkendiagram der Servicecalls"
             src="./images/logpointdistribution.png"/>
      </li>
      <li><Paragraph>und einer <Bold>Tabelle</Bold>, in der die Servicecalls mit
        ihren Logpunkten dargestellt werden:</Paragraph>
        <img width="100%" alt="Tabelle der Servicecalls"
             src="./images/logtable.png"/>
      </li>
    </ul>
    <Paragraph>Durch Klick auf den Spaltenkopf wird die jeweilige Spalte
      sortiert. Ein zweiter Klick kehrt die Sortierung um. Unterhalb des
      Spaltenkopfes besteht die Möglichkeit ein Filterkriterium
      einzugeben.</Paragraph>
    <Paragraph>Weitere Interaktionen sind mit den Zellen der Tabelle möglich,
      dies ist im folgenden erläutert:</Paragraph>
    <ComponentExplanation component={<MessageId
      row={{value: messageId}}/>}>
      Eine einzelne Zeile der Tabelle stellt einen Servicecall dar. Zu einem
      Servicecall werden i.d.R. mehrere Logpunkte geschrieben. Die Tabellenzeile
      aggregiert daher über eine Message-ID. Bei Klick auf die Message-ID wird
      die Zeile aufgeklappt, um die einzelnen aggregierten Logpunkte des Calls
      anzuzeigen.
    </ComponentExplanation>
    <ComponentExplanation component={<Timing row={row}/>}>
      In der Spalte Timestamp werden die Zeiten auf dem Bus bzw. beim Provider
      dargestellt.<br/>
      Vor der eckigen Klammer steht die Zeit des Requests auf dem Bus, dahinter
      des Responses. Innerhalb der eckigen Klammer steht die Zeit, die der
      Provider verbrauchte. Ggf. steht dort hinter einem "/" eine weitere Zahl
      (wie in unserem Beispiel):
      diese wäre dann die Zeit aufgrund der Logpunkte 9 und 10 - also des
      Providers. Allerdings ist die Auflösung dort i.d.R. nur sekundengenau und
      daher unbrauchbar. Die vordere Zahl ist die Zeit zwischen Verlassen des
      Busses und Rückkehr auf dem Bus vom Provider und damit eine Annäherung an
      die tatsächlich für die Verarbeitung benötigte Zeit.<br/>J
      e nach MEP wird als Antwortzeit die Zeit für den gesamten Roundtrip, oder
      nur bis zum Acknowledge dargetellt. Die Ampelfarbe gibt eine Indikation
      für die Dauer bis zur Antwort.<br/>
      Bei Klick auf diese Zelle wird der Servicecall in einer grafischen
      Timeline modal dargestellt
    </ComponentExplanation>
    <ComponentExplanation component={<LogpointNummer row={row}/>}>
      In der Spalte Logpunkte sind die Logpunkte des Calls in ihrer zeitlichen
      Sequenz dargestellt. Blaue Logpunkte sind dabei Logpunkte des Busses,
      Schwarze Logpunkte kommen vom Provider, und Rote Logpunkte symbolisieren
      Faults. Steht der Balken oberhalb der Ziffer, so befinden wir uns beim
      Request, ansonsten beim Response/Fault. Vertikale Linien deuten eine
      Netzwerkstrecke an.<br/>Bei Klick auf diese Zelle wird der Servicecall in
      einem separaten Browser-Tab mit einer teilbaren URL dargestellt.
    </ComponentExplanation>
  </Section>
)

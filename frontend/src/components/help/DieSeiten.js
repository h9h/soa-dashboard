import React from 'react'
import Section from './Section'
import { Icon } from '../icons'
import { Paragraph } from './styles'

export default () => (
  <Section title="Die Seiten des Dashboards">
    <Paragraph>
      Die Standardseite - <Icon glyph={'dashboard'}/> das Dashboard an sich -
      bietet eine Sicht auf die Logpunkte und Messages.
    </Paragraph>
    <Paragraph>
      Die Seite "Queues" - <Icon glyph={'queues'}/> - liefert Informationen über
      die Fachqueues.
    </Paragraph>
    <Paragraph>
      Auf der Seite "Nachrichten" - <Icon glyph={'messages'}/> - können die
      Nachrichten analysiert werden, die nicht richtig verarbeitet wurden.
    </Paragraph>
    <Paragraph>
      Schließlich gibt es noch die Seite "Statistik" - <Icon
      glyph={'statistics'}/> - die verschiedene Sichten auf die Verteilung der
      Servicecalls darstellt.
    </Paragraph>
    <Paragraph>
      Falls die Jobs-API verfügbar ist, gibt es auch dazu eine Seite - <Icon
      glyph={'jobs'}/>.
    </Paragraph>
  </Section>
)

import React from 'react'
import Section from './Section'
import { NavigationForm }  from '../Navigation'
import IconExplanation from './IconExplanation'
import { Paragraph } from './styles'

const noop = () => {}

const page = () => (
  <Section title="Die Navigationselemente">
    <Paragraph>
      Auf jeder Seite befindet sich rechts im Seitenkopf der Navigationsbereich.
      Je nachdem, ob die Jobs-API verfügbar ist oder nicht, sieht dieser Bereich so aus:
    </Paragraph>
    <NavigationForm page="a" userId="otto" logout={noop} /> oder <NavigationForm page="a" userId="otto" logout={noop} haveJobsApi={true}/>
    <Paragraph>Die Symbole im einzelnen:</Paragraph>
    <IconExplanation glyph="dashboard">
      zurück zum Dashboard
    </IconExplanation>
    <IconExplanation glyph="queues">
      zu den Fachqueues
    </IconExplanation>
    <IconExplanation glyph="messages">
      zu den nicht zugestellten Nachrichten (undelivered, expired, rejected)
    </IconExplanation>
    <IconExplanation glyph="statistics">
      zu den statistischen Auswertungen der Services und Logpunkte
    </IconExplanation>
    <IconExplanation glyph="jobs">
      House-Keeping Jobs, z.B. Resend-Funktionalität
    </IconExplanation>
  </Section>
)

export default page

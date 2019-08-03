import React from 'react'
import Section from './Section'
import { Paragraph } from './styles'

export default () => {
  return (
    <Section title="Jobs">
      <Paragraph>
        Die Seite Jobs ist in zwei Spalten unterteilt: Links ist die "Eingabe", rechts die "Ausgabe".
      </Paragraph>
      <Paragraph>
      <img alt="Darstellung der Jobs-Seite" src="./images/PageJobs.png" width="75%"/>
      </Paragraph>
    </Section>
  )
}

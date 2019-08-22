import React from 'react'
import Section from './Section'
import { Paragraph } from './styles'

export default () => {
  const recipient = process.env.REACT_APP_MAILGROUP_RIGHTS

  return (
    <Section title="Jobs">
      <Paragraph>
        Jobs sind Aktionen, die auf gespeicherten Selektionen ausgeführt werden können. Derzeit ist das im wesentlichen
        die "Resend" Funktionalität, d.h. das Wiedereinstellen von Nachrichten in die verarbeitende Queue zur erneuten
        Auslieferung.
      </Paragraph>
      {process.env.REACT_APP_MAILGROUP_RIGHTS && (
        <Paragraph>
          Für die Resend-Funktionalität ist eine spezielle Berechtigung erforderlich. Falls sie benötigt wird,
          bitte <a href={`mailto://${recipient}?subject=Antrag auf Berechtigung zur Resend-Funktionalität&body=Hiermit beantrage ich die Erteilung des Rechts "resend"%0d%0a%0d%0aMeine User-ID ist: XXX%0d%0aDas Recht benötige ich, da XXX`}>hierüber</a> beantragen.
        </Paragraph>
      )}
      <Paragraph>
        Die Seite Jobs ist in zwei Spalten unterteilt: Links ist die "Eingabe", rechts die "Ausgabe".
      </Paragraph>
      <Paragraph>
      <img alt="Darstellung der Jobs-Seite" src="./images/PageJobs.png" width="75%"/>
      </Paragraph>
    </Section>
  )
}

import React from 'react'
import Section from './Section'
import { Paragraph, Header, Abbildung } from './styles'
import { NavigationForm } from '../Navigation'
import { Aktionen } from '../Aktionen'

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
          bitte <a
          href={`mailto://${recipient}?subject=Antrag auf Berechtigung zur Resend-Funktionalität&body=Hiermit beantrage ich die Erteilung des Rechts "resend"%0d%0a%0d%0aMeine User-ID ist: XXX%0d%0aDas Recht benötige ich, da XXX`}>hierüber</a> beantragen.
        </Paragraph>
      )}
      <Paragraph>
        <Header>Installation</Header>
        Im Standardfall ist die Jobs Funktion im Dashboard zunächst nicht sichtbar. Um die Funktion verfügbar zu machen
        sind folgende Schritte notwendig:
        <ul>
          <li>
            <em>Einmalig bei erstmaliger Verwendung:</em>
            <p>Anlage folgender Ordner im lokalen C:/-Laufwerk
              <ul>
                <li>Dashboard</li>
                <li>DashboardModel</li>
              </ul>
            </p>
          </li>
          <li>
            Stellen Sie bitte sicher, dass Sie die aktuelle Zuordnungs-JSON SenderFQN2QueueName lokal im Verzeichnis
            <br/>
            <code>C:\DashboardModel\SenderFQN2QueueName.json</code>
            <br/>gespeichert haben. Diese finden Sie <a
            href="http://ceiser.pr.sv.loc/ceiser.interfaces/SenderFQN2QueueName.json">hier</a>.
          </li>
        </ul>
      </Paragraph>
      <Paragraph>
        <Header>Wenn Sie die Jobs-Funktionalität verwenden wollen</Header>
        Starten Sie folgende Datei (oder eine lokale Kopie der Datei):
        <p>
          <em><code>W:\GGR-IGF1-02-SOA\98 SOA Tools\ESB-Dashboard\esb-jobs.exe</code></em>
        </p>
        Nach dem erneuten Aufruf des Dasboards wird die Jobs Funktionalität damit nun angeboten:
        <Paragraph>
          <Abbildung>
            <NavigationForm page="jobs" userId="otto" logout={() => {}} haveJobsApi={true}/>
          </Abbildung>
        </Paragraph>
      </Paragraph>
      <Paragraph>
        <Header>Arbeiten mit der Jobs Funktion</Header>
        Die Seite Jobs ist in zwei Spalten unterteilt: Links ist die "Eingabe", rechts die "Ausgabe".
      </Paragraph>
      <Paragraph>
        <Abbildung>
          <img alt="Darstellung der Jobs-Seite" src="./images/PageJobs.png" width="90%"/>
        </Abbildung>
      </Paragraph>
      <Paragraph>
        <Header>ESB-Jobs</Header>
        Um überhaupt die Funktionen nutzen zu können ist zunächst die gewünschte Anzahl von Sätzen zu selektieren.
        Die Daten werden in einer Datei im Ordner <code>C:/Dashboard</code> abgelegt. Im Anschluss erscheint die Datei
        in der ESB-Jobs Dropdownliste und man kann mit der selektierten Anzahl Sätze eine Aktion ausführen.
        <br/>
        Die aktivierte Jobs Funktion verändert zur Selektion auch die Darstellung im Bereich Undelivered/Deadletter
        Queue.
        Es erscheint eine Speichern-Funktion und eine Filterfunktion um die Datensätze genau selektieren zu können.
        <Paragraph>
          <Abbildung>
            <img alt="Filter und speichern als Job" src="./images/FilterAndSaveJobs.png" width="90%"/>
          </Abbildung>
        </Paragraph>
      </Paragraph>
      <Paragraph>
        <Header>Aktionen</Header>
        Folgende Funktionen stehen derzeit im Bereich Jobs zur Verfügung:
        <Paragraph>
          <Abbildung>
            <Aktionen anzahlMessages={9} onClickAktion={() => {}}/>
          </Abbildung>
        </Paragraph>
      </Paragraph>
      <Paragraph>
        <Header>Nur Log-Durchlauf</Header>

        Dies ist eine Simulation der Resend Funktion. Es werden die Datensätze aus der lokalen Datei selektiert und
        geprüft ob sie noch im Dashboard zu finden sind.

        <Header>Re-Send Messages (Nachricht aus Queue)</Header>
        Die Nachrichten werden anhand der ausgewählten JOBS Datei identifiziert, im Originalzustand aus den Queues
        genommen und dem ESB erneut im Originalzustand übergeben. Anschließend wird die erfolgreich versendete Nachricht
        gelöscht.

        <Header>Re-Send Messages (Nachricht aus lokaler Datei)</Header>
        Die Nachrichten werden anhand der ausgewählten JOBS Datei identifiziert und die evtl. veränderte Nachricht aus
        der lokalen Datei genommen und dem ESB erneut übergeben. Die Originalnachricht wird im Anschluss gelöscht.
        <br/>
        ACHTUNG: Diese Funktion taucht nur dann in der Dropdownliste auf, wenn die JOBS Datei nur eine kleine
        Nachrichtenanzahl enthält
        <Paragraph>
          <Abbildung>
          <Header>Warum werden nicht immer die Nachrichteninhalte gespeichert?</Header>
          Um Jobs über gequeuete Nachrichten laufen zu lassen, müssen diese Nachrichten selektiert und lokal gespeichert
          werden. Die erfolgt bis zu einer Maximal-Anzahl inklusive der tatsächlichen Message der Nachricht. Wenn die
          Selektion größer ist, wird die eigentliche Nachricht nicht mehr gespeichert, sondern nur noch die Metadaten.
          Diese Größe kann über den Einstellungsparameter "maxQueuedMessagesWithMessagecontent" gesteuert werden.
          Auch ohne eigentlichen Nachrichteninhalt können alle Jobs außer "Resend Message (Message aus Job-Data)"
          weiterhin vorgenommen werden.
          Nur für den Job "Resend Message (Message aus Job-Data)" braucht man ja den eigentlichen Nachrichteninhalt, um
          ihn lokal modifizieren zu können.
          </Abbildung>
        </Paragraph>
        <Header>Lösche Messages</Header>
        Die Nachrichten werden anhand der ausgewählten JOBS Datei identifiziert und gelöscht.
      </Paragraph>
    </Section>
  )
}

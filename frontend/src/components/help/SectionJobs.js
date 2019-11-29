import React from 'react'
import Section from './Section'
import { Paragraph, Header, Abbildung } from './styles'
import { NavigationForm } from '../Navigation'
import { Aktionen } from '../Aktionen'
import { Icon } from '../icons'

export default () => {
  const recipient = process.env.REACT_APP_MAILGROUP_RIGHTS

  return (
    <>
      <Section title="Jobs">
        <Paragraph>
          Jobs sind Aktionen, die auf gespeicherten Selektionen ausgeführt werden können. Derzeit ist das im
          wesentlichen
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
          Im Standardfall ist die Jobs Funktion im Dashboard zunächst nicht sichtbar. Um die Funktion verfügbar zu
          machen
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
      </Section>
      <Section title="Arbeiten mit der Jobs Funktion">
        <Paragraph>
          Die Seite Jobs ist in zwei Spalten unterteilt: Links ist die "Eingabe", rechts die "Ausgabe".
        </Paragraph>
        <Paragraph>
          <Abbildung>
            <img alt="Darstellung der Jobs-Seite" src="./images/PageJobs.png" width="90%"/>
          </Abbildung>
        </Paragraph>
      </Section>
      <Section title="ESB-Jobs">
        <Paragraph>
          Um überhaupt die Funktionen nutzen zu können ist zunächst die gewünschte Anzahl von Sätzen zu selektieren.<br />
          Dies erfolgt aus der Seite "Nachrichten" - <Icon glyph={'messages'}/>.<br />
          Die aktivierte Jobs Funktion verändert zur Selektion auch die Darstellung im Bereich Undelivered/Deadletter
          Queue. Es erscheint eine Speichern-Funktion und eine Filterfunktion um die Datensätze genau selektieren zu können.
        </Paragraph>
        <Paragraph>
          <Abbildung>
            <img alt="Filter und speichern als Job" src="./images/FilterAndSaveJobs.png" width="90%"/>
          </Abbildung>
        </Paragraph>
        <Paragraph>
          Die selektierten Daten werden beim Speichern in einer Datei im Ordner <code>C:/Dashboard</code> abgelegt. Im Anschluss erscheint die Datei
          in der ESB-Jobs Dropdownliste und man kann mit den selektierten Nachrichten eine Aktion ausführen.
          <br/>
        </Paragraph>
      </Section>
      <Section title="Aktionen">
        <Paragraph>
          Folgende Funktionen stehen derzeit im Bereich Jobs zur Verfügung:
          <Paragraph>
            <Abbildung>
              <Aktionen anzahlMessages={9} onClickAktion={() => {}}/>
            </Abbildung>
          </Paragraph>
        </Paragraph>
        <Paragraph>
          <Header>Aktion "Nur Log-Durchlauf"</Header>

          Dies ist eine Simulation der Resend Funktion. Es werden die Datensätze aus der lokalen Datei selektiert und
          geprüft ob sie noch im Dashboard zu finden sind.

          <Header>Aktion "Re-Send Messages (Nachricht aus Queue)"</Header>
          Die Nachrichten werden anhand der ausgewählten JOBS Datei identifiziert, im Originalzustand aus den Queues
          genommen und dem ESB erneut im Originalzustand übergeben. Anschließend wird die erfolgreich versendete
          Nachricht
          gelöscht.

          <Header>Aktion "Re-Send Messages (Nachricht aus lokaler Datei)"</Header>
          Die Nachrichten werden anhand der ausgewählten JOBS Datei identifiziert und die evtl. veränderte Nachricht aus
          der lokalen Datei genommen und dem ESB erneut übergeben. Die Originalnachricht wird im Anschluss gelöscht.
          <br/>
          ACHTUNG: Diese Funktion taucht nur dann in der Dropdownliste auf, wenn die JOBS Datei nur eine kleine
          Nachrichtenanzahl enthält
          <Paragraph>
            <Abbildung>
              <Header>Warum werden nicht immer die Nachrichteninhalte gespeichert?</Header>
              Um Jobs laufen zu lassen, müssen diese Nachrichten zunächst selektiert und lokal gespeichert
              werden. Dies erfolgt bis zu einer Maximal-Anzahl an Nachrichten inklusive der tatsächlichen
              Nachrichteninhalts. Wenn die
              Selektion größer ist als diese Maximal-Anzahl, wird die eigentliche Nachricht nicht mehr gespeichert,
              sondern nur noch die Metadaten der Nachricht.
              <br/>
              <Paragraph>
                <Abbildung>
                  Diese Größe kann über den
                  Einstellungsparameter <code>maxQueuedMessagesWithMessagecontent</code> gesteuert werden:<br/>
                  <img alt="Job Log" src="./images/Einstellungen.png" width="30%"/>&nbsp;
                  <img alt="Job Log" src="./images/maxQueue.png" width="50%"/>
                </Abbildung>
              </Paragraph>
              Auch ohne eigentlichen Nachrichteninhalt können alle Jobs außer "Resend Message (Message aus Job-Data)"
              weiterhin vorgenommen werden.
              Nur für den Job "Resend Message (Message aus Job-Data)" braucht man ja den eigentlichen Nachrichteninhalt,
              um
              ihn lokal modifizieren zu können.
            </Abbildung>
          </Paragraph>
          <Header>Aktion "Lösche Messages"</Header>
          Die Nachrichten werden anhand der ausgewählten JOBS Datei identifiziert und gelöscht.
        </Paragraph>
        <Paragraph>
          <Header>Ergebnis einer Aktion:</Header>
          Die mit einer ausgewählten Datei genutzten Funktionen werden in einer Log Datei im Laufwerk unter C:/Dashboard
          abgelegt.
          <Paragraph>
            <Abbildung>
              <img alt="Job Log" src="./images/JobLog.png" width="90%"/>
            </Abbildung>
          </Paragraph>
        </Paragraph>
      </Section>
    </>
  )
}

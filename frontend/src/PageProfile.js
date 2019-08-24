import React, { useState } from 'react'
import ReactJson from 'react-json-view'
import styled from 'styled-components'
import BodyArea from './components/BodyArea'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import HeaderProfile from './components/HeaderProfile'
import Container from 'react-bootstrap/Container'
import { Grey } from './components/styles'
import { toast } from 'react-toastify'
import ButtonWithTip from './components/ButtonWithTip'
import Log from './log'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { updateConfiguration } from './logic/actions'
import { validateConfiguration } from './logic/configuration'

const log = Log('pageprofile')

const PageProfile = (props) => {
  const [configuration, setConfiguration] = useState({ ...props.configuration })

  const storeChange = (values) => {
    const validationResult = validateConfiguration(values)

    if (validationResult.errors.length > 0) {
      const messages = validationResult.errors.map(
        e => `${e.property}: ${e.message}`)
      toast(
        <div>
          <h3>Fehler</h3>
          <ul>
            {messages.map(m => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>,
        {type: toast.TYPE.ERROR},
      )

      setConfiguration({...props.configuration})
      return
    }

    toast(
      `Konfiguration erfolgreich geändert`,
      {type: toast.TYPE.SUCCESS},
    )

    props.updateConfiguration(values)
  }

  const handleChange = change => {
    log.trace('Change', {...change})
    const {updated_src} = change
    storeChange(updated_src)
  }

  return (
    <>
      <Helmet>
        <title>Einstellungen</title>
      </Helmet>
      <Container fluid>
        <HeaderProfile/>
        <BodyArea>
          <Row>
            <Col>
              <Hilfe/>
            </Col>
            <Col>
              <h2>Aktuelle Konfiguration:</h2>
              <ReactJson
                src={configuration}
                name={false}
                onEdit={edit => handleChange(edit)}
                onAdd={add => handleChange(add)}
                onDelete={del => handleChange(del)}
                enableClipboard={false}
              />
            </Col>
            <Col xs={{span: 6, offset: 6}}>
              <ButtonWithTip
                text="Konfiguration auf Defaultwerte zurücksetzen"
                title="Konfiguration zurücksetzen"
                description="Setzt die aktuelle Konfiguration auf die Default-Konfiguration zurück"
                glyph="resetConfiguration"
                handleClick={() => {
                  props.updateConfiguration(null)
                  toast(
                    `Konfiguration auf Defaultwerte zurückgesetzt`,
                    {type: toast.TYPE.SUCCESS},
                  )
                }}
              />
            </Col>
          </Row>
        </BodyArea>
      </Container>
    </>
  )
}

const Keyword = styled.span`
  color: darkblue;
`

const Hilfe = () => (
  <Grey>
    <article>
      <header>
        <h2>Erläuterungen</h2>
      </header>
      <section>
        <header>
          <h3>Konfiguration "Umgebungen"</h3>
        </header>
        <p>
          Sie können hier beliebig viele Umgebungen eintragen. Wenn Sie mit der
          Maus über die Zeile <Keyword>"umgebungen"</Keyword> streichen,
          erscheint ein grüner Kreis
          mit einem "+"-Zeichen. Damit können Sie einen neuen Eintrag anlegen.
        </p>
        <p>
          Sie werden nach einem Namen gefragt, dieser ist das Kürzel der neuen
          Umgebung.
        </p>
        <p>
          Bestätigen Sie den Namen, so wird ein neuer Eintrag mit dem Wert
          "null"
          angelegt. Diesen können Sie bearbeiten indem Sie mit der Maus über den
          neuen Eintrag streichen und das grüne Editor-Symbol anklicken.
        </p>
      </section>
      <section>
        <header>
          <h3>Konfiguration "Time"</h3>
        </header>
        <p>
          Die <Keyword>"time.duration"</Keyword> legt die Standard-Zeitspanne
          fest, für die Daten geholt
          werden. D.h. beim Öffnen der Applikation wird der Filtereintrag "bis"
          mit der aktuellen Uhrzeit belegt und "von" daraus mithilfe dieser
          Zeitspanne abgeleitet. Im Standard sind das 10 Minuten.
        </p>
        <p>
          Ebenso wird "von" daraus abgeleitet, wenn Sie "bis" manuell ändern.
        </p>
        <section>
          <header>
            <h3>Weiteres</h3>
          </header>
          <p>
            <Keyword>"filter.umgebung"</Keyword> legt die beim Start
            eingestellte Umgebung fest.
            Diese muss in <Keyword>"umgebungen"</Keyword> vorhanden sein,
            ansonsten wird der erste
            Eintrag der Liste eingestellt.
          </p>
          <p>
            <Keyword>"logtable"</Keyword> konfiguriert die auswählbaren
            Zeilenanzahlen und die
            voreingestellte Zeilenanzahl pro Seite der Datentabelle im
            Dashboard.
          </p>
          <p>
            <Keyword>"mock"</Keyword> dient Testzwecken.
          </p>
          <p>
            <Keyword>"advanced"</Keyword> beeinflusst die Anzeige von
            Benachrichtigungen.
          </p>
          <p>
            Mit <Keyword>"debug"</Keyword> kann man die Log-Ausgabe
            beeinflussen. Änderungen hier
            werden allerdings erst nach Reload der Seite wirksam.<br/>
            (Log-)Level könnnen von "0" bis "4" festgelegt werden:
          </p>
          <ul>
            <li key={0}>"0" - logge alles</li>
            <li key={1}>"1" - alles ab Info</li>
            <li key={2}>"2" - alles ab Warning</li>
            <li key={3}>"3" - alles ab Error</li>
            <li key={4}>"4" - logge nichts</li>
          </ul>
        </section>
      </section>
    </article>
  </Grey>
)

export default connect(
  state => ({
    configuration: state.configuration,
  }),
  dispatch => ({
    updateConfiguration: values => dispatch(updateConfiguration(values)),
  }),
)(PageProfile)

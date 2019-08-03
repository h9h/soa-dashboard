import React, {useState, useEffect} from 'react'
import Container from 'react-bootstrap/Container'
import BodyArea from './components/BodyArea'
import Log from './log'
import { Helmet } from 'react-helmet'
import Jobs from './components/Jobs'
import HeaderJobs from './components/HeaderJobs'
import { getModel, getConfig } from './logic/api/rest-api-local'

const log = Log('pagejobs')

const senderFQN2QueueName = 'SenderFQN2QueueName'

const PageJobs = () => {
  log.trace('Mount PageJobs')
  const [errors, setErrors] = useState([])

  useEffect(() => {
    const checkPrerequisites = async () => {
      const errs = []
      const resultS2Q = await getModel(senderFQN2QueueName)
      const verzeichnis = await getConfig('MODEL_PATH')
      if (!resultS2Q) errs.push(
        <div>
          <p>Model "${senderFQN2QueueName}" fehlt in lokaler Konfiguration.</p>
          <p>
            Bitte vom SOA-Server besorgen und als <code>{verzeichnis}/{senderFQN2QueueName}.json</code> speichern"
          </p>
        </div>
      )

      setErrors(errs)
    }
    checkPrerequisites()
  }, [])

  return (
    <>
      <Helmet>
        <title>ESB-Jobs</title>
      </Helmet>
      <Container fluid>
        <HeaderJobs/>
        <BodyArea>
          {errors.length === 0 ? (
            <Jobs/>
          ) : (
            <>
              <h3>Voraussetzung sind noch nicht erfüllt</h3>
              <ul>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </>
          )}
        </BodyArea>
      </Container>
    </>
  )
}

export default PageJobs

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Blank from './Blank'
import FormControl from 'react-bootstrap/FormControl'
import ButtonWithTip from './ButtonWithTip'
import moment from 'moment'
import { notification, withNotification } from '../logic/notification'
import { connect } from 'react-redux'
import { setJobname } from '../logic/actions'
import Log from '../log'
import { endsWith } from 'ramda'
import { saveJob } from '../logic/api/rest-api-local'
import Tipp from './Tipp'

const log = Log('savejob')

const createJobname = (umgebung = '', datumVon = '', datumBis = '', messageType = '') => {
  const m = messageType && messageType.length > 3 ? messageType.substring(0, 3) : messageType
  const lfdNummer = moment().format('HHmmss')
  return `${umgebung}.${m}.${datumBis}.${datumVon}.${lfdNummer}`
}

const SaveJob = ({job, ...props}) => {
  const {umgebung, datumVon, datumBis, messageType} = job
  const [jobname, setJobname] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setJobname(createJobname(umgebung, datumVon, datumBis, messageType))
    setIsSaved(false)
  }, [umgebung, datumVon, datumBis, messageType])

  const handleChange = e => {
    const jobname = e.target.value
    setJobname(jobname)
    setIsSaved(false)
  }

  const callbackSaveJob = ({result}) => {
    if (result === 'ok') {
      notification({
        nachricht: `Job '${jobname}' erfolgreich gespeichert`
      })
      setIsSaved(true)
    } else {
      notification({
        nachricht: `Speichern von Job '${jobname}' fehlgeschlagen: ${result}`,
        autoClose: false
      })
    }
  }

  const handleClick = () => {
    withNotification({
      nachricht: `Job '${jobname}' wird gespeichert`,
      fn: () => saveJob(jobname, job, callbackSaveJob)
    })
  }

  const handleClickJob = () => {
    if (!isSaved) return
    log.trace('set Jobname', jobname)
    const ext = endsWith('.job.json', jobname) ? '' : '.job.json'
    props.setJobname(jobname + ext)
    document.getElementById('job').click()
  }

  return (
    <>
      <Form inline>
        <Tipp title="Jobname" content="Hier wird ein Name vorgeschlagen, unter dem der Job gespeichert werden kann. Sie können aber auch einen anderen Namen wählen.">
          Name:
        </Tipp>
        <Blank/>
        <FormGroup>
          <FormControl value={jobname}
                       type="text"
                       placeholder="Dateiname"
                       style={{width: '350px'}}
                       onChange={handleChange}
          />
          <Blank/>
          <Blank/>
          <ButtonWithTip
            title="Speichern"
            description="Der Job muss gespeicht werden, um dann damit arbeiten zu können."
            glyph="save"
            handleClick={handleClick}
            disabled={jobname === ''}
          />
          <Blank/>
          <Blank/>
          <ButtonWithTip
            title="Job"
            description="Gehe zum Job"
            glyph="jobs"
            handleClick={handleClickJob}
            disabled={jobname === '' || !isSaved}
          />
        </FormGroup>
      </Form>
      <Link id="job" to="/jobs"/>
      <hr />
      {props.children}
    </>
  )
}

export default connect(
  () => ({}),
  dispatch => ({
    setJobname: jobname => dispatch(setJobname(jobname)),
  }),
)(SaveJob)




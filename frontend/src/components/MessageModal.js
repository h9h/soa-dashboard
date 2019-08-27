import React from 'react'
import ModalDialog from './ModalDialog'
import { Red, Bold } from './styles'
import Log from '../log'
import { CopyMessageToClipboard } from './CopyToClipboard'

const log = Log('messagemodal')

const MessageModal = (props) => {
  log.trace('Mount MessageModal', props)
  const {show, onHide, row} = props

  const error = row.row.ERRORCODE || null
  const reason = row.row.REASON || null

  return (
    <ModalDialog show={show} onHide={onHide} title={'Message'}>
      <>
        {error && (
          <>
            <span>
              <Bold>Error: </Bold><Red>{error}</Red>
            </span>
            <hr />
          </>
        )}
        {reason && (
          <>
            <div>
              <Bold>Grund: </Bold>
              <Red>{reason}</Red>
            </div>
            <hr />
          </>
        )}
        <>
          <CopyMessageToClipboard textToBeCopied={row.row.MESSAGE} />
          <hr/>
        </>
        <pre>{row.row.MESSAGE}</pre>
      </>
    </ModalDialog>
  )
}

export default MessageModal

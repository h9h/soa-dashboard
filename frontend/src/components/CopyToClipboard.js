import React from 'react';
import copy from 'copy-to-clipboard';
import { notification } from '../logic/notification'
import { Grey, Smaller } from './styles'

const defaultOnCopy = () => notification({
  nachricht: 'Inhalt wurde in die Zwischenablage kopiert'
})

const CopyToClipboard = ({text, onCopy, notificationText, children}) => {
  const elem = React.Children.only(children);

  const onClick = event => {
    const result = copy(text);

    if (notificationText) {
      notification({
        nachricht: notificationText.indexOf(' ') < 0 ? <div>{`${notificationText} wurde in die Zwischenablage kopiert:`}<br />{text}</div> : notificationText
      })
    }

    if (onCopy) {
      onCopy(text, result)
    }

    if(!notificationText && !onCopy) {
      defaultOnCopy()
    }

    // Bypass onClick if it was present
    if (elem && elem.props && typeof elem.props.onClick === 'function') {
      elem.props.onClick(event)
    }
  }

  return React.cloneElement(elem, { onClick, style: { cursor: 'copy' } })
}

export const CopyMessageToClipboard = ({textToBeCopied, meldung = 'Nachricht in Zwischenablage kopiert', children}) => {
  const component = children ? children : <Grey>Hier klicken, um die Nachricht in die Zwischenablage zu kopieren</Grey>

  return (
    <CopyToClipboard text={textToBeCopied}
                     onCopy={() => notification({
                       nachricht: (
                         <div>
                           {meldung}
                           <br/>
                           <Smaller>{textToBeCopied.length < 80 ? textToBeCopied : textToBeCopied.substr(0, 80) + '...'}</Smaller>
                         </div>
                       )
                     })}>
      <span
        style={{cursor: 'pointer'}}>{component}</span>
    </CopyToClipboard>

  )
}
export default CopyToClipboard

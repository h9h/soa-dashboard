import React from 'react';
import copy from 'copy-to-clipboard';
import { notification } from '../logic/notification'
import { Grey, Smaller } from './styles'

const CopyToClipboard = ({text, onCopy, children}) => {
  const elem = React.Children.only(children);

  const onClick = event => {
    const result = copy(text);

    if (onCopy) {
      onCopy(text, result);
    }

    // Bypass onClick if it was present
    if (elem && elem.props && typeof elem.props.onClick === 'function') {
      elem.props.onClick(event);
    }
  }

  return React.cloneElement(elem, { onClick })
}

export const CopyMessageToClipboard = ({text}) => (
  <CopyToClipboard text={text}
                   onCopy={() => notification({nachricht: (
                     <div>
                      Nachricht in Zwischenablage kopiert
                      <br />
                      <Smaller>{text.length < 80 ? text : text.substr(0, 80) + '...'}</Smaller>
                     </div>
                   )})}>
    <span style={{cursor: 'pointer'}}><Grey>Hier klicken, um die Nachricht in die Zwischenablage zu kopieren</Grey></span>
  </CopyToClipboard>

)

export default CopyToClipboard

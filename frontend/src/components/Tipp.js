import React from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

const Tipp = ({ title, content, children, disabled = false, ...props }) => {
  const popover = (
    <Popover id={`popover-${title}`} title={title}>
      <Popover.Body>{content}</Popover.Body>
    </Popover>
  )

  if (disabled) return <span>{children}</span>

  // Note: <span> or <div> or some other regular html element is needed, otherwise the implicit props 'onClick' etc
  // are not passed to the custom react element in children
  // see https://github.com/react-bootstrap/react-bootstrap/issues/2208#issuecomment-301737531
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      key={title}
      placement={props.placement || "bottom"}
      overlay={popover}>
      <span  style={{ cursor: 'help' }}>{children}</span>
    </OverlayTrigger>
  )
}

export default Tipp

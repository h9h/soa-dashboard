import PropTypes from 'prop-types'
import React from 'react'
import { Button, ButtonToolbar, FormGroup } from 'react-bootstrap'
import Tipp from '../components/Tipp'
import { Icon } from './icons'
import Blank from './Blank'

/**
 * Button mit Tooltipp
 *
 */
const ButtonWithTip = ({
                         text,
                         title,
                         description,
                         glyph,
                         handleClick,
                         variant = 'light',
                         ...props
                       }) => {
  return (
    <FormGroup controlId={title}>
      <Tipp title={title} content={description} {...props}>
        <ButtonToolbar>
          <Button onClick={handleClick} {...props} variant={variant}>
            {glyph && <Icon glyph={glyph} />}
            {glyph && text && <Blank/>}
            {text && text}
          </Button>
        </ButtonToolbar>
      </Tipp>
    </FormGroup>
  )
}

export default ButtonWithTip

ButtonWithTip.propTypes = {
  /** Der Text des Tooltipps */
  description: PropTypes.string.isRequired,
  /** Das Glyph, welches im Button angezeigt werden soll*/
  glyph: PropTypes.string,
  /** Die Funktion, die bei Klick ausgelöst wird */
  handleClick: PropTypes.func,
  /** Eine optionale Beschriftung für den Button */
  text: PropTypes.node,
  /** Der Titel des Tooltipps */
  title: PropTypes.string.isRequired
}

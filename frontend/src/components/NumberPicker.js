import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { Icon } from './icons'
import { clamp } from 'ramda'
import Blank from './Blank'

const NumberPicker = props => {
  const {defaultValue, min, max, onChange, title = ''} = props
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleUpdate = e => {
    const val = clamp(min, max, parseInt('' + (e.target ? e.target.value : e)))
    setValue(val)
    onChange(val)
  }

  const minus = () => handleUpdate(value - 1)
  const plus = () => handleUpdate(value + 1)

  return (
    <Form  className="d-flex">
      <FormGroup>
        {title && (
          <>
            {title}
            <Blank/>
          </>
        )}
        <Button
          onClick={minus}
          disabled={value === min}
          variant="outline-secondary"
          style={{
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
            borderRightColor: '#fff',
            height: '38px'
          }}
        >
          <Icon glyph="minus"/>
        </Button>
        <FormControl value={value}
                     onChange={handleUpdate}
                     style={{
                       width: '150px',
                       borderRadius: '0px',
                       textAlign: 'right',
                       borderTopColor: '#6c757d',
                       borderBottomColor: '#6c757d'
                     }}
        />
        <Button onClick={plus}
                disabled={value === max}
                variant="outline-secondary"
                style={{
                  borderTopLeftRadius: '0px',
                  borderBottomLeftRadius: '0px',
                  borderLeftColor: '#fff',
                  height: '38px'
                }}
        >
          <Icon glyph="plus"/>
        </Button>
      </FormGroup>
    </Form>
  )
}

export default NumberPicker

NumberPicker.propTypes = {
  defaultValue: PropTypes.any.isRequired,
  max: PropTypes.any.isRequired,
  min: PropTypes.any.isRequired,
  onChange: PropTypes.any.isRequired
}

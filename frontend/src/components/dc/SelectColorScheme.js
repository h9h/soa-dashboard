import React from 'react'
import Select from '@atlaskit/select'
import { getSchemeOptions } from './utils'
import Log from '../../log'
import FormGroup from 'react-bootstrap/FormGroup'
import FormLabel from 'react-bootstrap/FormLabel'
import Blank from '../Blank'

const log = Log('selectcolorscheme')

const COLOR_SCHEME_OPTIONS = getSchemeOptions()

const SelectColorScheme = ({scheme, onChange, ohneTitel}) => {
  log.trace('Mount SelectColorScheme', scheme)
  if (!scheme) return null

  return (
    <FormGroup controlId="select.colorscheme">
      {!ohneTitel && (
        <>
          <FormLabel>
            Farb Schema:
          </FormLabel>
          <Blank/>
        </>
      )}
      <div style={{width: 170}}>
        <Select
          className="single-select"
          classNamePrefix="react-select"
          options={COLOR_SCHEME_OPTIONS}
          value={COLOR_SCHEME_OPTIONS.filter(c => c.value === scheme)}
          onChange={e => {
            log.trace('onChange', e)
            onChange(e.value)
          }}
        />
      </div>
    </FormGroup>
  )
}

export default SelectColorScheme

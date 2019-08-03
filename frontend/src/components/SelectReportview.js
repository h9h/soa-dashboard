import React from 'react'
import FormGroup from 'react-bootstrap/FormGroup'
import FormLabel from 'react-bootstrap/FormLabel'
import FormControl from 'react-bootstrap/FormControl'
import Blank from './Blank'

const ViewOptions = ({views}) => (
  <>
    {Object.keys(views)
      .map(k => <option key={k}>{views[k]}</option>)}
  </>
)

const SelectReportview = ({views, value, onChange, ohneTitel}) => {
  const handleChange = e => onChange(e.target.value)

  return <FormGroup controlId="select.view">
    {!ohneTitel && (
      <>
        <FormLabel>
          Report:
        </FormLabel>
        <Blank/>
      </>
    )}
    <FormControl as="select" value={value} onChange={handleChange}>
      <ViewOptions views={views} />
    </FormControl>
  </FormGroup>
}

export default SelectReportview

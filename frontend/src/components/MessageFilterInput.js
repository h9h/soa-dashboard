import React from 'react'
import TextInput from 'react-autocomplete-input'

const MessageFilterInput = ({ row, value, onChange }) => {
  const options = Object.keys(row)

  return (
    <TextInput
      options={options}
      value={value}
      onChange={onChange}
      trigger='row.'
      placeholder="Ein JavaScript-Ausdruck, der einen boolschen Wert ergibt. Zur Verfügung stehen 'row' und 'index'"
      spellCheck="false"
      rows={3}
      cols={100}
    />
  )
}

export default MessageFilterInput

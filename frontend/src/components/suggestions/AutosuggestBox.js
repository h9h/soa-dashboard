import React, { useState } from 'react'
import Autosuggest from 'react-autosuggest'
import { SuggestionProvider } from './provider'

const useSuggestions = provider => {
  const handler = useState([])
  provider.setSuggestionsStatehandler(handler)

  return {
    suggestions: provider.getSuggestions(),
    onSuggestionsFetchRequested: provider.onSuggestionsFetchRequested,
    onSuggestionsClearRequested: provider.onSuggestionsClearRequested,
    getSuggestionValue: provider.getSuggestionValue,
    renderSuggestion: provider.renderSuggestion
  }
}

const AutosuggestBox = props => {
  const { values, value, onChange, provider, placeholder, disabled = false, ...rest} = props
  const p = provider ? provider : new SuggestionProvider(values)
  const suggestionProvider = useSuggestions(p)

  const inputProps = {
    value,
    onChange: (event, { newValue }) => {
      if (newValue == null) return
      onChange(newValue)
    },
    placeholder,
    disabled
  }

  return (
    <Autosuggest
      {...suggestionProvider}
      inputProps={inputProps}
      {...rest}
    />
  )
}

export default AutosuggestBox

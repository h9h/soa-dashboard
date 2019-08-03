import React from 'react'
import { isNil } from 'ramda'

export class SuggestionProvider {
  constructor (values = []) {
    this.suggestions = []
    this.setSuggestions = () => {}
    this.values = values
  }

  /* Standard Methoden - i.d.R. nicht zu überschreiben */
  setSuggestionsStatehandler = ([suggestions, setSuggestions]) => {
    this.suggestions = suggestions
    this.setSuggestions = setSuggestions
  }
  setValues = values => this.values = values
  getSuggestions = () => this.suggestions
  renderSuggestion = suggestion => this.renderComponent(suggestion)
  onSuggestionsFetchRequested = ({value}) => {
    this.setSuggestions(this.filterSuggestions(value))
  }
  onSuggestionsClearRequested = () => this.setSuggestions([])

  /**
   * Filter die vorhandenen Werte mit dem übergebenen Wert, um eine Selektion von Vorschlägen zu erhalten
   * @param value der Wert mit dem gefiltert wird
   * @return {Array|*} Array von Vorschlägen
   */
  filterSuggestions = value => {
    if (isNil(value) || typeof value !== 'string') return []
    const inputValue = value.trim().toLowerCase()
    if (inputValue === '') return []

    return this.values.filter(item => {
      try {
        return this.getSuggestionValue(item).toLowerCase().indexOf(inputValue) > -1
      } catch (_) {
        return false
      }
    })
  }

  /**
   * Ein Vorschlag kann eine beliebige Struktur haben. Hier ist der tatsächliche Wert, den der input annehmen soll
   * zu ermitteln.
   *
   * Beispiel:
   *   { value: 1, name: 'Wert 1'}
   * getSuggestionsValue = suggestion => suggestion.value
   *
   * @param suggestion ein konkreter Vorschlag
   * @return {*} der Wert dieses Vorschlags
   */
  getSuggestionValue = suggestion => suggestion

  /**
   * Stellt einen einzelnen Vorschlag dar
   *
   * Beispiel:
   *   { value: 1, name: 'Wert 1'}
   * renderComponent = suggestion => <div>{suggestion.name}</div>
   *
   * @param suggestion der Vorschlag
   * @return {*} eine Komponente, die den Vorschlag darstellt
   */
  renderComponent = suggestion => (
    <div>{suggestion}</div>
  )
}

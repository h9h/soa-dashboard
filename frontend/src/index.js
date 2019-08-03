import 'react-app-polyfill/ie11'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import entries from 'object.entries'

import { getConfiguration } from './configuration'

import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/css/bootstrap-reboot.css'
import 'react-table/react-table.css'
import 'vis-timeline/dist/vis-timeline-graph2d.min.css'
import '@atlaskit/reduced-ui-pack/dist/bundle.css'
import './MyReactToastify.css' // width (und dazugehörige hälftige margin-left)
import 'flatpickr/dist/themes/light.css'
import 'dc/dc.css'
import './index.css'

import App from './App';
import * as serviceWorker from './serviceWorker';
import { ReactTableDefaults } from 'react-table'
import dc from 'dc'
import * as d3 from 'd3'

import Log from './log'
import de_locale from 'moment/locale/de'
import moment from 'moment'

console.log('Log Level', getConfiguration().debug.level)
const log = Log('index')
log.info('Umgebungsvariablen: ', process.env)

// Konfiguriere deutsche Zeit/Datumsformate für d3
const locale = {
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["€", ""],
  "dateTime": "%A, der %e. %B %Y, %X",
  "date": "%d.%m.%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  "shortMonths": ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
}
d3.timeFormatDefaultLocale(locale)
log.trace('Starting app', d3.timeFormat("%c")(new Date()))

// Konfiguriere deutsche Zeit/Datumsformate für moment
moment.locale('de', de_locale)
log.trace('Starting app', moment().format('dddd, DD.MM.YYYY'))

// Konfiguriere Standard-Farbschema für dc
dc.config.defaultColors(d3.schemeCategory10)

if (process
  && process.env
  && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
  && false
) {
  log.warn(`

    ================================================================
    React is instrumented with @welldone-software/why-did-you-render
    
    You should not see this in productions-deployments
    ================================================================

    `)
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

if (!Object.entries) {
  log.warn('shimming "Object.entries"')
  entries.shim()
}

// Defaults für React-Table
Object.assign(ReactTableDefaults, {
  noDataText: "Keine Daten selektiert",
  previousText:"Vorige Seite",
  nextText:"Nächste Seite",
  pageText:"Seite",
  ofText:"von",
  rowsText:"Zeilen",
  pageJumpText:"Gehe zu Seite",
  rowsSelectorText:"Zeilen pro Seite",
  className:"-striped -highlight",
  filterable: true,
})

log.trace('ReactDom render App')
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

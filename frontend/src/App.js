/**
    Copyright 2019 Michael Heinke

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */
import React, { Suspense, lazy } from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import WartenAnzeiger from './components/WartenAnzeiger'
import reducer from './logic/reducer'
import { initialState } from './logic/store'

import Log from './log'
import { getConfigurationValue } from './logic/configuration'
const log = Log('app')

// Lazy Load die einzelnen Seiten
const RouteUnauthenticated = lazy(() => import('./RouteUnauthenticated'))
const RouteAuthenticated = lazy(() => import('./RouteAuthenticated'))
const PageLogin = lazy(() => import('./PageLogin'))
const PageDashboard = lazy(() => import('./PageDashboard'))
const PageQueues = lazy(() => import('./PageQueues'))
const PageMessages = lazy(() => import('./PageMessages'))
const PageJobs = lazy(() => import('./PageJobs'))
const PageStatistics = lazy(() => import('./PageStatistics'))
const PageCheckalive = lazy(() => import('./PageCheckalive'))
const PageQueuetables = lazy(() => import('./PageQueuedMessages'))
const PageProfile = lazy(() => import('./PageProfile'))
const PageHelp = lazy(() => import('./PageHelp'))
const PageServicecall = lazy(() => import('./PageServicecall'))
const Statusleiste = lazy(() => import('./Statusleiste'))

const App = () => {
  log.info('Render ESB-Dashboard')
  const store = createStore(
    reducer,
    initialState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
      trace: getConfigurationValue('mock.doMock') === 'true'
    })
  )

  return (
    <Provider store={store}>
      <Helmet>
        <title>Lade...</title>
      </Helmet>
      <Suspense fallback={<WartenAnzeiger nachricht="Seite wird geladen" withHeader={true}/>}>
        <Router>
          <Switch>
            {/* Öffentlich zugänglich */}
            <Route exact path="/statistics/:umgebung/aktuell" component={PageStatistics}/>
            <Route path="/help" component={PageHelp}/>
            <Route path="/profile" component={PageProfile}/>
            <Route exact path="/checkalive" component={PageCheckalive}/>
            <Route path="/checkalive/:umgebung" component={PageCheckalive}/>

            {/* Ziel falls nicht eingeloggt und Zugriff auf geschützte Seite gewollt */}
            <RouteUnauthenticated path="/login" component={PageLogin} />

            {/* Geschützte Seiten */}
            <RouteAuthenticated exact path="/dashboard" component={PageDashboard}/>
            <RouteAuthenticated path="/dashboard/:umgebung/:datum/:von/:bis/:searchType/:searchValue" component={PageDashboard}/>
            <RouteAuthenticated path="/dashboard/:umgebung/:datum/:von/:bis" component={PageDashboard}/>
            <RouteAuthenticated exact path="/queues/:umgebung/:database/:queuetable" component={PageQueuetables}/>
            <RouteAuthenticated path="/queues" component={PageQueues}/>
            <RouteAuthenticated path="/messages" component={PageMessages}/>
            <RouteAuthenticated path="/jobs" component={PageJobs}/>
            <RouteAuthenticated path="/message/:umgebung/:datum/:von/:bis/:messageId" component={PageServicecall}/>
            <RouteAuthenticated exact path="/statistics/:umgebung/:datumVon/:datumBis" component={PageStatistics}/>
            <RouteAuthenticated path="/statistics" component={PageStatistics}/>
            <RouteAuthenticated path="/" component={PageDashboard}/>
          </Switch>

          {/* Unabhängig von Route (aber brauchen Router-Context wegen Navigation) */}
          <Statusleiste />
        </Router>
      </Suspense>
    </Provider>
  )
}

export default App

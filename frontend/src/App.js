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
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import WartenAnzeiger from './components/WartenAnzeiger'
import reducer from './logic/reducer'
import { initialState } from './logic/store'

import Log from './log'
import { getConfigurationValue } from './logic/configuration'
import { sendStatusInfo } from './logic/actions'
import { MyToastContainer } from './logic/notification'
import ProtectedRoute from './ProtectedRoute'
const log = Log('app')

// Lazy Load die einzelnen Seiten
const PageLogin = lazy(() => import('./PageLogin'))
const PageDashboard = lazy(() => import('./PageDashboard'))
const PageDashboard2 = lazy(() => import('./PageDashboard2'))
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

const store = createStore(
  reducer,
  initialState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
    trace: getConfigurationValue('mock.doMock') === 'true'
  })
)

export let sendInfo = info => store.dispatch(sendStatusInfo(info))

const getStartpage = () => {
  const startpage = getConfigurationValue('startpage')
  switch (startpage) {
    case 'dashboard':
      return <PageDashboard />
    case 'statistics':
      return <PageStatistics />
    default:
      return <PageDashboard />
  }
}

const App = () => {
  log.info('Render ESB-Dashboard')

  const component = getStartpage()

  return (
    <Provider store={store}>
      <Helmet>
        <title>Lade...</title>
      </Helmet>
      <MyToastContainer />
      <Suspense fallback={<WartenAnzeiger nachricht="Seite wird geladen" withHeader={true}/>}>
        <Router>
          <Routes>
            {/* Öffentlich zugänglich */}
            <Route path="/login" element={<PageLogin />} />
            <Route path="/statistics/:umgebung/aktuell" element={<PageStatistics />}/>
            <Route path="/statistics/:umgebung/:datumVon" element={<PageStatistics />}/>
            <Route path="/help" element={<PageHelp />}/>
            <Route path="/profile" element={<PageProfile />}/>
            <Route path="/checkalive/:umgebung" element={<PageCheckalive />}/>
            <Route path="/checkalive" element={<PageCheckalive />}/>

            {/* Geschützt */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/dashboard/:umgebung/:datum/:von/:bis/:searchType/:searchValue" element={<PageDashboard />}/>
              <Route path="/dashboard/:umgebung/:datum/:von/:bis" element={<PageDashboard />}/>
              <Route path="/dashboard" element={<PageDashboard/>}/>

              <Route path="/dashboard2/:umgebung/:datum/:von/:bis/:searchType/:searchValue" element={<PageDashboard2 />}/>
              <Route path="/dashboard2/:umgebung/:datum/:von/:bis" element={<PageDashboard2 />}/>
              <Route path="/dashboard2" element={<PageDashboard2 />}/>

              <Route path="/queues/:umgebung/:database/:queuetable" element={<PageQueuetables />}/>
              <Route path="/queues" element={<PageQueues />}/>
              <Route path="/messages" element={<PageMessages />}/>
              <Route path="/jobs" element={<PageJobs/>}/>

              <Route path="/message/:umgebung/:datum/:von/:bis/:messageId" element={<PageServicecall />}/>
              <Route path="/statistics/:umgebung/:datumVon/:datumBis" element={<PageStatistics />}/>
              <Route path="/statistics" element={<PageStatistics />}/>
              <Route path="/" element={component}/>
            </Route>
          </Routes>

          {/* Unabhängig von Route (aber brauchen Router-Context wegen Navigation) */}
          <Statusleiste />
        </Router>
      </Suspense>
    </Provider>
  )
}

//{/* Ziel falls nicht eingeloggt und Zugriff auf geschützte Seite gewollt */}
//{/* Geschützte Seiten */}
/**
<RouteUnauthenticated path="/login" component={PageLogin} />

<RouteAuthenticated path="/dashboard/:umgebung/:datum/:von/:bis/:searchType/:searchValue" component={PageDashboard}/>
<RouteAuthenticated path="/dashboard/:umgebung/:datum/:von/:bis" component={PageDashboard}/>

<RouteAuthenticated exact path="/dashboard2" component={PageDashboard2}/>
<RouteAuthenticated path="/dashboard2/:umgebung/:datum/:von/:bis/:searchType/:searchValue" component={PageDashboard2}/>
<RouteAuthenticated path="/dashboard2/:umgebung/:datum/:von/:bis" component={PageDashboard2}/>

<RouteAuthenticated exact path="/queues/:umgebung/:database/:queuetable" component={PageQueuetables}/>
<RouteAuthenticated path="/queues" component={PageQueues}/>
<RouteAuthenticated path="/messages" component={PageMessages}/>
<RouteAuthenticated path="/jobs" component={PageJobs}/>

<RouteAuthenticated path="/message/:umgebung/:datum/:von/:bis/:messageId" component={PageServicecall}/>
<RouteAuthenticated exact path="/statistics/:umgebung/:datumVon/:datumBis" component={PageStatistics}/>
<RouteAuthenticated path="/statistics" component={PageStatistics}/>

<RouteAuthenticated path="/" component={component}/>
 */

export default App

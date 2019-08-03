export const migrate = configuration => {
  const version = configuration.version || 0

  switch (version) {
    case 0:
      //
      // VERSION 0 nach 1
      //
      // widenFilter von time nach filter verlagert
      const wt = configuration.time && configuration.time.widenFilter ? configuration.time.widenFilter : null
      if (wt) {
        console.log('MOVE from time to filter', wt)
        if (!configuration.filter) configuration.filter = {}
        configuration.filter.widenFilter = wt
        delete configuration.time.widenFilter
      }
      break

    case 1:
      //
      // VERSION 1 nach 2
      //
      // widenFilter anzahl aufgesplittet in anzahlVor/anzahlZurueck
      const wf = configuration.filter && configuration.filter.widenFilter ? configuration.filter.widenFilter : null
      if (wf) {
        console.log('CHANGE anzahl to anzahlVor/Zurueck', wf)
        wf.anzahlVor = wf.anzahl
        wf.anzahlZurueck = wf.anzahl
        delete wf.anzahl
      }
      break

    case 2:
      //
      // VERSION 2 nach 3
      //
      const op = configuration.presentation.showServicecallInNewTab
      if (op) {
        delete op.presentation.showServicecallInNewTab
      }
      break

    case 3:
      //
      // VERSION 3 nach 4
      //
      [
        'showQueuesInNewTab',
        'showQueuedMessagesInNewTab',
        'showStatisticsInNewTab',
        'showHelpInNewTab'
      ].forEach(key => {
        const p = configuration.presentation[key]
        if (p) {
          delete p.presentation[key]
        }
      })
      break
    default:
      // ----- Implementioerung vergessen -----
      console.log('>>>>> Migrationsregeln für Version ' + version + ' fehlen! <<<<<')
  }

  configuration.version = version + 1
}

export const loggedIn = (user) => ({
  type: 'loggedIn',
  user,
})

export const logout = {
  type: 'logout'
}

export const actualise = {
  type: 'actualise'
}

export const setFilter = (umgebung, datum, duration, bis, logSearchType, logSearchValue, onlyFaults) => ({
  type: 'setFilter',
  umgebung,
  datum,
  duration,
  bis,
  logSearchType,
  logSearchValue,
  onlyFaults
})

export const setJobname = (jobname) => ({
  type: 'setJobname',
  jobname
})

export const setUmgebung = umgebung => ({
  type: 'setUmgebung',
  umgebung
})

export const setFilterQueues = (umgebung, database) => ({
  type: 'setFilterQueues',
  umgebung,
  database,
})

export const setFilterCheckalive = (umgebung) => ({
  type: 'setFilterCheckalive',
  umgebung,
})

export const setFilterStatistics = (umgebung, datumStatVon, datumStatBis, statisticFlags) => ({
  type: 'setFilterStatistics',
  umgebung,
  datumStatVon,
  datumStatBis,
  statisticFlags,
})

export const setView = (view) => ({
  type: 'setView',
  view,
})

export const setColorScheme = (colorScheme) => ({
  type: 'setColorScheme',
  colorScheme,
})

export const setFilterMessages = (umgebung, messageType, datumVon, datumBis, messageSearchType, messageSearchValue) => ({
  type: 'setFilterMessages',
  umgebung,
  messageType,
  datumVon,
  datumBis,
  messageSearchType,
  messageSearchValue
})

export const setBis = bis => ({
  type: 'setBis',
  bis
})

export const setLogSearchParameters = (logSearchType, logSearchValue) => ({
  type: 'setLogSearchParameters',
  logSearchType,
  logSearchValue
})

export const setRidgelineDimension = (dimension) => ({
  type: 'setRidgelineDimension',
  dimension
})

export const setRidgelineWert = (wert) => ({
  type: 'setRidgelineWert',
  wert
})

export const updateConfiguration = (values) => ({
  type: 'updateConfiguration',
  values
})

export const resetConfiguration = () => ({
  type: 'resetConfiguration',
})

export const sendStatusInfo = info => ({
  type: 'sendStatusInfo',
  info
})

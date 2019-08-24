import { widenTime } from './time'
import { getConfigurationValue } from './configuration'

export const getMessageRoute = (umgebung, datum, von, bis, messageId) => {
  const {von: vonNeu, bis: bisNeu} = widenTime(getConfigurationValue('filter.widenFilter'))(von, bis)

  return `/message/${umgebung}/${datum}/${vonNeu}/${bisNeu}/${messageId}`
}

export const getDashboardRoute = (umgebung, datum, von, bis, searchType, searchValue) => {
  if (searchValue) {
    return `/dashboard/${umgebung}/${datum}/${von}/${bis}/${searchType}/${searchValue}`
  }
  return `/dashboard/${umgebung}/${datum}/${von}/${bis}`
}

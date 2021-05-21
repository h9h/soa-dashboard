import React, { useEffect } from 'react'
import WartenAnzeiger from './WartenAnzeiger'
import { AllgemeineStatistik } from './dc/AllgemeineStatistik'
import { VIEWS } from '../logic/statistics'
import { ServicecallStatistik } from './dc/ServicecallStatistik'
import { AufrufStatistik } from './dc/AufrufStatistik'
import {filterAll, renderAll} from 'dc'
import { RidgelineStatistik } from './dc/RidgelineStatistik'
import StatistikData from './dc/StatistikData'

const InteractiveStatistics = props => {
  const { data, datumVon, datumBis, view, colorScheme } = props

  useEffect(() => {
    filterAll()
    renderAll()
  }, [view])

  if (!datumVon || !datumBis) return null

  if (data.status === 'loading') return <WartenAnzeiger/>

  if (data.status === 'ready') {
    if (!data.dims.zeit.bottom(1)[0]) return <h2>Keine Daten</h2>

    switch(view) {
      case VIEWS.AUFRUF:
        return <AufrufStatistik data={data} colorscheme={colorScheme} width={props.width}/>
      case VIEWS.SERVICECALLS:
        return <ServicecallStatistik data={data} colorscheme={colorScheme} width={props.width}/>
      case VIEWS.RIDGELINE:
        return <RidgelineStatistik data={data} colorscheme={colorScheme} width={props.width}/>
      case VIEWS.DATA:
        return <StatistikData data={data} />
      default:
        return <AllgemeineStatistik data={data} colorscheme={colorScheme} width={props.width}/>
    }
  }

  return null
}

export default InteractiveStatistics

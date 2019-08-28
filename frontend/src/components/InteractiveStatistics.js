import React, { useEffect, useState } from 'react'
import WartenAnzeiger from './WartenAnzeiger'
import { connect } from 'react-redux'
import { getStatisticsData } from '../logic/api/rest-api-statistics'
import Log from '../log'
import { AllgemeineStatistik } from './dc/AllgemeineStatistik'
import { VIEWS } from '../logic/statistics'
import { ServicecallStatistik } from './dc/ServicecallStatistik'
import { AufrufStatistik } from './dc/AufrufStatistik'
import dc from 'dc'
import { RidgelineStatistik } from './dc/RidgelineStatistik'
import { StatistikData } from './dc/StatistikData'

const log = Log('statistics')

const InteractiveStatistics = props => {
  const {umgebung, datumVon, datumBis, view, colorScheme} = props
  log.trace('Interactive Statistics for', umgebung, datumVon, datumBis, view)

  const [data, setData] = useState({status: 'loading'})

  useEffect(() => {
    setData({status: 'loading'})
    // hole daten
    const getData = async () => {
      const { cf, dims } = await getStatisticsData(umgebung, datumVon, datumBis)
      setData({ status: 'ready', cf, dims, datumVon, datumBis })
    }
    getData()
  }, [umgebung, datumVon, datumBis])

  useEffect(() => {
    dc.filterAll()
    dc.renderAll()
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

export default connect(
  state => ({
    umgebung: state.umgebung,
    datumVon: state.datumStatVon,
    datumBis: state.datumStatBis,
    view: state.view,
    colorScheme: state.colorScheme,
  })
)(InteractiveStatistics)

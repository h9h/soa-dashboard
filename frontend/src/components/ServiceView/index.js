import React from 'react'
import Inspector from 'react-inspector'
import { path } from 'ramda'
import NodeRenderer from './NodeRenderer'
import { parse } from '../../logic/xml'
import { THEME } from './theme'
import { CopyMessageToClipboard } from '../CopyToClipboard'

const toDisplayJson = json => {
  if (!json) return {}

  const {CONTENT, ...meta} = json
  const xmlAsJson = CONTENT ? parse(CONTENT) : ''

  const param_out = path(['OutputParameters', 'P_PARAM_OUT', '__cdata'], xmlAsJson)
  if (param_out) xmlAsJson.parsedMessage = parse(param_out)

  const param_in = path(['InputParameters', 'P_PARAM_IN', '__cdata'], xmlAsJson)
  if (param_in) xmlAsJson.parsedMessage = parse(param_in)

  return {Message: xmlAsJson, Roh: {Meta: meta, 'Message-XML': CONTENT}}
}

const handleService = response => {
  if (!response) return ['Keine Daten', null]

  const {data} = response
  const messageType = d => d && d.MESSAGETYPE ? d.MESSAGETYPE : 'Message'

  if (Array.isArray(data)) {
    if (data.length > 1) {
      return ['Messages', data.map(toDisplayJson)]
    } else if (data.length === 1) {
      return [messageType(data[0]), toDisplayJson(data[0])]
    } else {
      return ['Keine Daten', null]
    }
  } else {
    return [data[data], data]
  }
}

const ServiceView = ({data}) => {
  const [messageType, jsonData] = handleService(data)
  return (
    <>
      {jsonData && jsonData.Roh && (
        <>
          <CopyMessageToClipboard textToBeCopied={jsonData.Roh['Message-XML']} />
          <hr/>
        </>
      )}
      <Inspector
        theme={THEME}
        data={jsonData}
        nodeRenderer={props => <NodeRenderer {...props} root={messageType}/>}
        expandPaths={[
          '$',
          '$.Message',
          '$.Message.*',
          '$.Message.Fault.*',
          '$.Message.Fault.*.*',
          '$.Message.Fault.*.*.*',
          '$.Message.Fault.*.*.*.*',
          '$.Message.parsedMessage',
          '$.Message.parsedMessage.*',
          '$.Message.parsedMessage.*.*',
          '$.Message.parsedMessage.*.*.*',
          '$.Message.parsedMessage.*.*.*.*',
          '$.Message.*.messageHeader',
          '$.Message.*.payload',
          '$.Message.*.payload.*',
          '$.Message.*.payload.*.*',
          '$.Message.*.payload.*.*.*',
          '$.Message.*.payload.*.*.*.*',
          '$.Message.*.payload.*.*.*.*.*',
          '$.Message.*.payload.*.*.*.*.*.*',
          '$.Message.*.payload.*.*.*.*.*.*.*',
          '$.Message.*.payload.*.*.*.*.*.*.*.*',
          '$.Message.Response.*',
          '$.Message.Response.*.*',
          '$.Message.Response.*.*.*',
          '$.Message.*.return',
          '$.Message.*.return.*',
          '$.Message.*.return.*.*',
          '$.Message.*.return.*.*.*',
          '$.Message.*.Request',
          '$.Message.*.Request.*',
          '$.Message.*.Request.*.*',
          '$.Message.*.Request.*.*.*',
          '$.Message.*.Request.*.*.*.*',
          '$.Message.*.Request.*.*.*.*.*',
          '$.Message.Envelope',
          '$.Message.Envelope.*',
          '$.Message.Envelope.*.*',
          '$.Message.Envelope.*.*.*',
          '$.Message.Envelope.*.*.*.*',
          '$.Message.Envelope.*.*.*.*.*',
          '$.Message.Envelope.*.*.*.*.*.*',
        ]}
      />
    </>
  )
}

export default ServiceView

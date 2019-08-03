import React from 'react'
import { Centered } from '../styles'
import Tipp from '../Tipp'
import { getContentMep, MEPS } from '../../logic/mep'
import { Icon } from '../icons'

const getTitle = mep => MEPS.reduce((acc, [value, title]) => value === mep ? title : acc, null)

const MessageExchangePattern = ({row}) => {
  const mep = row.value
  const title = getTitle(mep)
  return (
    <Centered>
      <Tipp title={title} content={getContentMep(mep)}>
        <Icon glyph={mep}/>
      </Tipp>
    </Centered>
  )
}

export default MessageExchangePattern

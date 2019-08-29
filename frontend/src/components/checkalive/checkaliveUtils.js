import moment from 'moment'

//
// RUN, SENDERCURRENTTIMESTAMP, ENVIRONMENT, USINGPORTFQN, PROVIDINGPORTFQN, MESSAGEID, ISALIVE, RESPONSE
//
export const makeCheckaliveGraph = rows => {
  const nodes = new Set()
  const links = []

  rows.forEach(row => {
    // eslint-disable-next-line no-unused-vars
    const [RUN, SENDERCURRENTTIMESTAMP, ENVIRONMENT, source, target, MESSAGEID, ISALIVE, response] = row

    nodes.add({ name: source })
    nodes.add({ name: target })

    links.push({ source, target, isAlive: ISALIVE === 1, response, timestamp: moment(SENDERCURRENTTIMESTAMP, 'YYYY-MM-DDTHH:mm:ss.SSSZ')})
  })
  return { nodes: [...nodes], links }
}

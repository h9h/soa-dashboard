import { connect } from 'react-redux'
import { updateConfiguration } from '../../logic/actions'
import { getColumns } from '../../logic/tableConfCheckalive'
import { sort } from 'ramda'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ReactTable from 'react-table'
import React from 'react'
import useWindowSize from '../useWindowSize'

const UnconnectedCheckaliveTable = ({data, ...props}) => {
  const { height } = useWindowSize()
  const columns = getColumns()
  const sizeOptions = sort((a, b) => a - b, props.pageSizes.filter(s => !!s).map(s => parseInt(s, 10)))

  return (
    <>
      <Row>
        <Col>
          <ReactTable
            columns={columns}
            data={data}
            defaultSorted={[
              {id: 'PROVIDINGPORTFQN'},
              {id: 'USINGPORTFQN'},
            ]}
            pageSizeOptions={sizeOptions}
            onPageSizeChange={props.setPageSize}
            defaultPageSize={props.defaultPageSize}
            style={{ height: (height - 250) + 'px'}}
          />
        </Col>
      </Row>
    </>
  )
}

export default connect(
  state => ({
    pageSizes: state.configuration.checkalivetable.pageSizes,
    defaultPageSize: parseInt(state.configuration.checkalivetable.defaultSize, 10)
  }),
  dispatch => ({
    setPageSize: size => dispatch(updateConfiguration({checkalivetable: {defaultSize: '' + size}}))
  })
)(UnconnectedCheckaliveTable)

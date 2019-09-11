import React from 'react'
import ReactTable from 'react-table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getColumns } from '../../logic/tableConfStatistik'
import useWindowSize from '../useWindowSize'
import { connect } from 'react-redux'
import { updateConfiguration } from '../../logic/actions'
import { sort } from 'ramda'

function StatistikData ({data, ...props}) {
  const columns = getColumns()
  const { height } = useWindowSize()

  const handlePageSizeChange = e => {
    props.setPageSize(e)
  }

  const sizeOptions = sort((a,b) => a-b, props.pageSizes.filter(s => !!s).map(s => parseInt(s,10)))

  return (
    <Row>
      <Col>
        <ReactTable
          columns={columns}
          data={data.dims.zeit.top(Infinity)}
          pageSizeOptions={sizeOptions}
          onPageSizeChange={handlePageSizeChange}
          defaultPageSize={props.defaultPageSize}
          style={{height: (height - 120) + 'px'}}
        />
      </Col>
    </Row>
  )
}

export default connect(
  state => ({
    pageSizes: state.configuration.statistikdata.pageSizes,
    defaultPageSize: parseInt(state.configuration.statistikdata.defaultSize, 10)
  }),
  dispatch => ({
    setPageSize: size => dispatch(updateConfiguration({ statistikdata: { defaultSize: '' + size }}))
  })
)(StatistikData)

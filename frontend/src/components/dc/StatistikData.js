import React from 'react'
import ReactTable from 'react-table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getColumns } from '../../logic/tableConfStatistik'

export function StatistikData ({data}) {
  const columns = getColumns()

  return (
    <Row>
      <Col>
        <ReactTable
          columns={columns}
          data={data.dims.zeit.top(Infinity)}
          pageSizeOptions={[18, 100, 500]}
          defaultPageSize={18}
        />
      </Col>
    </Row>
  )
}

/*
          defaultSorted={[
            {id: 'ServiceOperation'},
            {id: 'Zeit'},
          ]}

 */

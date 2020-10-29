import React from 'react'
import styled from 'styled-components'
import { FixedSizeList } from 'react-window'
import useWindowSize from '../useWindowSize'
import { getConfigurationValue } from '../../logic/configuration'

const Styles = styled.div`
  padding: 1rem;

  .table {
    display: inline-block;
    border-spacing: 0;
    border: 1px solid black;

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

function Table ({ tableProps, children }) {
  return <div {...tableProps} className='table'>
    {children}
  </div>
}

function TableBody ({ tableBodyProps, height, totalColumnWidth,itemCount, children }) {
  return <div {...tableBodyProps} style={{height: height}} className='tbody'>
        <FixedSizeList
          height={height}
          itemCount={itemCount}
          itemSize={80}
          width={totalColumnWidth}
        >
          {children}
        </FixedSizeList>
  </div>
}

function TableHeader ({ headerGroups }) {
  return <div className='thead'>
    {headerGroups.map((headerGroup, idx) => (
      <div key={idx} {...headerGroup.getHeaderGroupProps()} className='tr'>
        {headerGroup.headers.map((column, cidx) => (
          <ColumnHeader key={cidx} column={column}/>
        ))}
      </div>
    ))}
  </div>

}

function ColumnHeader ({column}) {
  return <div {...column.getHeaderProps()} className='th'>
    {column.render('Header')}
  </div>
}

const BaseTable = props => {
  const { height } = useWindowSize()
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    state: { groupBy, expanded }
  } = props.table

  let barchartHeight = parseInt(getConfigurationValue('presentation.distribution.heightInPx'), 10)
  if (barchartHeight < 20) barchartHeight = 0

  const RenderRow = React.useCallback(
    ({index, style}) => {
      const row = rows[index]
      prepareRow(row)

      return (
        <div {...row.getRowProps({ style })} className='tr'>
          {row.cells.filter(cell => cell.column.Header !== 'filter').map(cell => {
            return (
              <div {...cell.getCellProps()} className='td'>
                {cell.render('Cell')}
              </div>
            )
          })}
        </div>
      )
    },
    [prepareRow, rows]
  )

  // Render the UI for your table
  return (
    <Styles>
      <Table tableProps={getTableProps()}>
        <TableHeader headerGroups={headerGroups} />

        <TableBody
          tableBodyProps={getTableBodyProps()}
          height={height - 220 - barchartHeight}
          totalColumnWidth={totalColumnsWidth}
          itemCount={rows.length}
        >
          {RenderRow}
        </TableBody>
      </Table>
    </Styles>
  )
}

export default BaseTable

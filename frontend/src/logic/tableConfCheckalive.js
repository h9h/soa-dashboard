import { cellFactory } from '../components/cells'
import { columnFactory, TABLE_COLUMNS } from './tableConfBase'

export const getColumns = (onClick) => {
  return columnFactory(cellFactory(onClick), c => c, TABLE_COLUMNS.Checkalive)
}

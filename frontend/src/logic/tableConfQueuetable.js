import { columnFactory, TABLE_COLUMNS } from './tableConfBase'
import { cellFactory } from '../components/cells'

export const getColumns = (onClick) => {
  return columnFactory(cellFactory(onClick), c => c, TABLE_COLUMNS.Queuetable)
}

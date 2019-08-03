import { cellFactory } from '../components/cells'
import { columnFactory, TABLE_COLUMNS } from './tableConfBase'

export const getColumns = (messageType, onClick) => {
  return columnFactory(cellFactory(onClick), c => c, TABLE_COLUMNS.Queues)
}

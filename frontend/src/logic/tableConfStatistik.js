import { columnFactory, TABLE_COLUMNS } from './tableConfBase'
import { cellFactory } from '../components/cells'

export const getColumns = () => {
  return columnFactory(cellFactory(), c => c, TABLE_COLUMNS.Statistic)
}

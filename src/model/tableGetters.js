import { Map, List } from 'immutable'

const emptyMap = Map({})
// (number, number) -> ImmutableTable -> CellMap U {Map({})}
const getCellFromRowAndCol = (row, col) => (table) => {
  const rowN = table.get('table').size
  const colN = table.get('col')
  if (row < 0 || row >= rowN || col < 0 || col >= colN) {
    return emptyMap
  }
  return table.getIn([
    'cells',
    table.getIn([
      'rows',
      table.getIn(['table', row]),
      'cells',
      col,
    ]),
  ])
}

// ImmutableTable -> List [int, int]
const getSize = (table) => {
  const nRow = table.get('table').size
  const nCol = table.get('col')
  return List([nRow, nCol])
}

// ImmutableTable -> CellMap U {Map({})}
const getFirstCell = getCellFromRowAndCol(0, 0)
const getLastCell = table => getCellFromRowAndCol(
  table.get('table').size - 1,
  table.get('col') - 1,
)(table)

// string -> ImmutableTable ->
const getRowAndColFromCellKey = cellKey => table =>
  table.getIn(['cells', cellKey], emptyMap)
    .filter((_, key) => ['key', 'data'].indexOf(key) < 0)

const getLastCellKey = table => getLastCell(table).get('key')
const getFirstCellKey = table => getFirstCell(table).get('key')

// string -> ImmutableTable -> string U {undefined}
const getRightCellKey = cellKey => (table) => {
  const partialCell = getRowAndColFromCellKey(cellKey)(table)
  if (partialCell.size === 0) { return undefined }
  const { row, col, colspan } = partialCell.toObject()
  const newCol = (col + colspan) % table.get('col')
  const newRow = newCol === 0 ? row + 1 : row
  return getCellFromRowAndCol(newRow, newCol)(table).get('key')
}

// string -> ImmutableTable -> string U {undefined}
const getLeftCellKey = cellKey => (table) => {
  const partialCell = getRowAndColFromCellKey(cellKey)(table)
  if (partialCell.size === 0) { return undefined }
  const { row, col } = partialCell.toObject()
  const newCol = col > 0 ? col - 1 : table.get('col') - 1
  const newRow = col === 0 ? row - 1 : row
  return getCellFromRowAndCol(newRow, newCol)(table).get('key')
}

// string -> ImmutableTable -> string U {undefined}
const getUpCellKey = cellKey => (table) => {
  const partialCell = getRowAndColFromCellKey(cellKey)(table)
  if (partialCell.size === 0) { return undefined }
  const { row, col } = partialCell.toObject()
  // const newRow = row > 0 ? row - 1 : row
  const newRow = row - 1
  return getCellFromRowAndCol(newRow, col)(table).get('key')
}

// string -> ImmutableTable -> string U {undefined}
const getDownCellKey = cellKey => (table) => {
  const partialCell = getRowAndColFromCellKey(cellKey)(table)
  if (partialCell.size === 0) { return undefined }
  const { row, rowspan, col } = partialCell.toObject()
  // const newRow = (row + rowspan) < table.get('table').size ?
  //   row + rowspan : row
  const newRow = row + rowspan
  return getCellFromRowAndCol(newRow, col)(table).get('key')
}

const directionMap = {
  l: getLeftCellKey,
  r: getRightCellKey,
  u: getUpCellKey,
  d: getDownCellKey,
}

const getNextCellKey = (cellKey, table) => (dir = 'r') =>
  directionMap[dir](cellKey)(table)

const Get = {
  size: getSize,
  nextCellKey: getNextCellKey,
  firstCellKey: getFirstCellKey,
  lastCellKey: getLastCellKey,
  rightCellKey: getRightCellKey,
  leftCellKey: getLeftCellKey,
  upCellKey: getUpCellKey,
  downCellKey: getDownCellKey,
}

export default Get

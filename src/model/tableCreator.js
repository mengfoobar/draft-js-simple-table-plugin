import { ContentState } from 'draft-js'
import { fromJS } from 'immutable'

// initialContentStateProd: ()
const initialContentStateProd = () => ContentState.createFromText('')
// const simpleTableObj = {
//   nextRowKey: 1,
//   nextCellKey: 1,
//   col: 1,
//   cells: {
//     '0': {
//       key: '0',
//       row: 0,
//       col: 0,
//       rowspan: 1,
//       colspan: 1,
//       data: undefined,
//     },
//   },
//   rows: {
//     '0': {
//       key: '0',
//       cells: ['0']
//     },
//   },
//   table: ['0'],
// }
const _repeat = (n, v = 0) => {
  let ret = []
  for (let i = 0; i < n; i++) { ret.push(i) }
  return ret
}
// genKey: int -> string
const genKey = i => i.toString()
// _genCell: ((int, int) -> a) -> int -> int -> Cell a
const _genCell = prod => key => row => col => ({
  key, row, col, rowspan: 1, colspan: 1, data: prod(row, col),
})
// tableCreator = int -> int -> ( ... -> a) -> Table a
const tableCreator = row => col => (prod = () => undefined) => {
  const base = { nextRowKey: row, nextCellKey: row * col, col }
  const genCell = _genCell(prod)
  const table = _repeat(row).map((_, i) => genKey(i))
  const rows = _repeat(row).reduce((red, _, i) => ({
    ...red,
    [i]: {
      key: i,
      cells: _repeat(col),
    },
  }), {})
  const cells = {}
  _repeat(row * col).forEach((_, i) => {
    const cellKey = genKey(i)
    cells[cellKey] = genCell(cellKey)(i % row)(i % col)
    const rowKey = genKey(i % row)
    rows[rowKey].cells[i % col] = cellKey
  })

  return {
    ...base,
    table,
    rows,
    cells,
  }
}

// initialTable: (int, int) -> ImmutableTable DCS
const initialTable = (row = 1, col = 1) =>
  fromJS(tableCreator(row)(col)(initialContentStateProd))

export default initialTable

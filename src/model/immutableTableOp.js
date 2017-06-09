import { fromJS } from 'immutable'
import { ContentState } from 'draft-js'
import * as Op from './tableOp'
import { tableOp } from '../constants'

// defaultData: _ -> DraftContentState (alias DCS)
const defaultData = () => ContentState.createFromText('')

// to: ImmutableTable a -> Table a
const to = (imTable) => {
  // don't touch the cell data
  const newCells = imTable.get('cells').map(cell => cell.toObject()).toObject()
  return {
    ...imTable.delete('cells').toJS(),
    cells: newCells,
  }
}

// _convert:
// (_ -> a) -> (Table a -> X a) -> (X a -> Table a)
//   b -> (_ -> a) -> Table a -> Table a) ->
//     b -> X a -> X a
const _convert = prod => from => to =>
  op =>
    (...args) => x =>
        from(
          op(...args)(prod)(to(x)),
        )

// convert (X->ImmutableTable, a->DCS):
// (b -> (_ -> a) -> Table a -> Table a) ->
//    b -> ImmutableTable DCS -> ImmutableTable DCS
const convert = _convert(defaultData)(fromJS)(to)

// *: a -> ImmutableTable DCS -> ImmutableTable DCS
const addRow = convert(Op.addRow)
const removeRow = convert(Op.removeRow)
const addCol = convert(Op.addCol)
const removeCol = convert(Op.removeCol)
// const merge = convert(Op.merge)
// const split = convert(Op.split)

// Alias:: OpName: string
// opMap: {opName: ...}
const opMap = {
  // Alias:: CellKey: string
  // (CellKey, ImmutableTable DCS) -> ImmutableTable DCS
  addRowAfter: (ck, data) => addRow(ck, true)(data),
  addRowBefore: (ck, data) => addRow(ck, false)(data),
  addColAfter: (ck, data) => addCol(ck, true)(data),
  addColBefore: (ck, data) => addCol(ck, false)(data),
  removeRow: (ck, data) => removeRow(ck)(data),
  removeCol: (ck, data) => removeCol(ck)(data),
}

// getActiveCellKeyAfterOp:
// (CellKey, ImmutableTable DCS, OpName) -> CellKey
export const getActiveCellKeyAfterOp = (ck, imTable, what) => {
  // if add or remove that is a noOp, keep the cell
  if (
    what.startsWith('add') ||
    (what === 'removeRow' && imTable.get('table').size === 1) ||
    (what === 'removeCol' && imTable.get('col') === 1)
  ) { return ck }
  // else choose the "previous" cell or the "next" in last case
  const isRow = what === 'removeRow'
  const { row, col } = imTable.getIn(['cells', ck]).toObject()
  let newRowOrCol
  if (isRow) {
    newRowOrCol = row !== 0 ? row - 1 : row + 1
  } else {
    newRowOrCol = col !== 0 ? col - 1 : col + 1
  }
  return imTable.getIn([
    'rows',
    imTable.getIn(['table', isRow ? newRowOrCol : row]),
    'cells',
    isRow ? col : newRowOrCol,
  ])
}

const operations = Object.keys(tableOp).reduce((red, opName) => ({
  ...red,
  [opName]: {
    // fn: (CellKey, ImmutableTable DCS) ->
    //       {content: ImmutableTable DCS, cell: CellKey}
    fn: (ck, content) => ({
      content: opMap[opName](ck, content),
      cell: getActiveCellKeyAfterOp(ck, content, opName),
    }),
    icon: tableOp[opName].icon,
  },
}), {})

export default operations

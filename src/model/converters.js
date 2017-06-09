import * as _ from 'draft-js'
import { fromJS } from 'immutable'
import { tableBlock } from '../constants'

// ImmutableTable CS -> ImmutableTable rawCS
const toRaw = it => it.update('cells', cells =>
  cells.map(cell => cell.update('data', data =>
    _.convertToRaw(data),
  )),
)

// CS -> rawCS
export const convertToRaw = (cs) => {
  const csWithRawTableData = cs.update('blockMap', blockMap =>
    blockMap.map((block) => {
      if (block.getType() !== tableBlock) { return block }
      return block.updateIn(
        ['data', 'table'],
        table => toRaw(table).toJS(),
      )
    }),
  )
  return _.convertToRaw(csWithRawTableData)
}

// Table rawCS -> Table CS
const fromRaw = t => ({
  ...t,
  cells: Object.keys(t.cells).reduce((red, ck) => ({
    ...red,
    [ck]: {
      ...t.cells[ck],
      data: _.convertFromRaw(t.cells[ck].data),
    },
  }), {}),
})

// ImmutableTable rawCS -> ImmutableTable CS
// const fromRaw = it => fromJS(_fromRaw(it))


// rawCS -> CS
export const convertFromRaw = (rcs) => {
  const tmpCs = _.convertFromRaw(rcs)
  return tmpCs.update('blockMap', blockMap =>
    blockMap.map((block) => {
      if (block.getType() !== tableBlock) { return block }
      return block.updateIn(
        ['data', 'table'],
        table => fromJS(fromRaw(table)),
      )
    }),
  )
}

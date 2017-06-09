import moveToNextBlock from '../modifiers/moveToNextBlock'
import { H, NH, mapExitKeysToTableDirections } from '../constants'

const exitTable = (key, table, { unlock, getEditorState, setEditorState }) => {
  const after = ['Tab', 'ArrowDown', 'ArrowRight'].indexOf(key) >= 0
  const blockKey = table.getBlock().getKey()
  const move = moveToNextBlock(after, blockKey)
  const editorState = move(getEditorState())
  if (!editorState) { return NH }
  unlock()
  setEditorState(editorState)
  return H
}

// Payload -> store -> H U NH
export default ({ key, shift }) => ({ getStore, getLocker }) => {
  const locker = getLocker()
  const table = locker.getLockedBy().component
  if (!table) { return NH }
  const mKey = shift && key === 'Tab' ? 'ArrowLeft' : key
  const nextCell = table.getNextCellKey(
    mapExitKeysToTableDirections[mKey],
  )
  if (nextCell) {
    table.changeCell(nextCell)
    return H
  }
  return exitTable(mKey, table, {
    unlock: locker.unlock,
    ...getStore(),
  })
}


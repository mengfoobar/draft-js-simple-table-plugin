import { changeCellOrExit, tab, H } from '../constants'
import { zipToFn } from '../higherOrderFns'

// Key -> [ Key -> a] -> a
const exitKeysTo = zipToFn(changeCellOrExit.keys)
// CS -> BlockKey -> bool
const isCursorInFirstBlock = cs => bk =>
  cs.getFirstBlock().getKey() === bk
// CS -> BlockKey -> bool
const isCursorInLastBlock = cs => bk =>
  cs.getLastBlock().getKey() === bk

const isCursorInSuitableBlock = exitKeysTo([
  isCursorInFirstBlock, // up
  isCursorInLastBlock, // right
  isCursorInLastBlock, // down
  isCursorInFirstBlock, // left
  () => () => true, // tab
])

// CB -> int -> bool
const isCursorAtEnd = cb => offset =>
  offset === cb.getLength()
// CB -> int -> bool
const isCursorAtBegin = () => offset =>
  offset === 0

const isCursorWellPositionned = exitKeysTo([
  isCursorAtBegin,
  isCursorAtEnd,
  isCursorAtEnd,
  isCursorAtBegin,
  () => () => true,
])

// key -> ES -> bool
const isExitMotion = (key) => {
  if (key === tab) { return () => true }
  const iCISB = isCursorInSuitableBlock(key)
  const iCWP = isCursorWellPositionned(key)
  return (es) => {
    const s = es.getSelection()
    if (!s.isCollapsed()) { return false }
    const cs = es.getCurrentContent()
    const bk = s.getStartKey()
    if (!iCISB(cs)(bk)) { return false }
    const cb = cs.getBlockForKey(bk)
    const offset = s.getStartOffset()
    return iCWP(cb)(offset)
  }
}

// Event -> ES -> string U {undefined}
export default (e) => {
  const key = e.key
  if (changeCellOrExit.keys.indexOf(key) < 0) {
    return () => undefined
  }
  const iEM = isExitMotion(key)
  return (es) => {
    if (!iEM(es)) { return undefined }
    return JSON.stringify(
      changeCellOrExit.getAction({
        key,
        shift: e.shiftKey,
      }),
    )
  }
}

// (ES, string -> H U NH ) -> Event -> bool
export const onArrow = (es, handler) => (e) => {
  const key = e.key
  if (
    isExitMotion(key)(es) &&
    handler(JSON.stringify(
      changeCellOrExit.getAction({
        key,
        shift: e.shiftKey,
      }),
    )) === H
  ) {
    e.preventDefault()
    return true
  }
  return false
}

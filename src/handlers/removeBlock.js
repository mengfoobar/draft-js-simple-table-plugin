import removeBlock from '../modifiers/removeBlock'
import { tableBlock, H, NH } from '../constants'

// Payload -> store -> H U NH
export default ({ blockType, blockKey }) => ({ getStore }) => {
  if (blockType === tableBlock) {
    const { getEditorState, setEditorState } = getStore()
    setEditorState(
      removeBlock(blockType)(getEditorState())(blockKey),
    )
    return H
  }
  return NH
}

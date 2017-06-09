import { EditorState, SelectionState } from 'draft-js'

const removeBlock = blockType => editorState => (blockKey) => {
  const content = editorState.getCurrentContent()
  const blockBefore = content.getBlockBefore(blockKey)
  const newContent = content.update('blockMap', blockMap =>
    blockMap.delete(blockKey),
  )
  let newSelection
  if (!blockBefore) {
    newSelection = editorState.getSelection()
  } else {
    const bbk = blockBefore.getKey()
    const offset = blockBefore.getLength()
    newSelection = SelectionState.createEmpty(bbk).merge({
      anchorOffset: offset,
      focusOffset: offset,
      hasFocus: true,
    })
  }
  return EditorState.forceSelection(
    EditorState.push(editorState, newContent, `remove-${blockType}`),
    newSelection,
  )
}

export default removeBlock

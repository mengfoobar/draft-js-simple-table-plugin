import { EditorState, SelectionState } from 'draft-js'

export default (after, currentBlockKey) => (editorState) => {
  const targetBlock = editorState
    .getCurrentContent()[
      `getBlock${after ? 'After' : 'Before'}`
    ](currentBlockKey)
  if (!targetBlock) { return undefined }
  let newSelection = SelectionState
    .createEmpty(targetBlock.getKey())
    .set('hasFocus', true)
  if (!after) {
    const L = targetBlock.getLength()
    newSelection = newSelection.merge({
      anchorOffset: L,
      focusOffset: L,
    })
  }
  return EditorState.forceSelection(editorState, newSelection)
}

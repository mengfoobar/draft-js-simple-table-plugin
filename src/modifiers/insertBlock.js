import {
  Modifier,
  genKey,
  EditorState,
  ContentBlock,
  BlockMapBuilder,
} from 'draft-js'
import { Map } from 'immutable'
import {
  isAtEndOfBlock,
  isAtEndOfContent,
  isCurrentBlockEmpty,
} from './utils'

export default blockType => editorState => (data) => {
  const contentState = editorState.getCurrentContent()
  const selectionState = editorState.getSelection()

  const afterRemoval = Modifier.removeRange(
    contentState,
    selectionState,
    'backward',
  )

  const targetSelection = afterRemoval.getSelectionAfter()

  const currentBlockEmpty = isCurrentBlockEmpty(afterRemoval, targetSelection)
  const atEndOfBlock = isAtEndOfBlock(afterRemoval, targetSelection)
  const atEndOfContent = isAtEndOfContent(afterRemoval, targetSelection)

  // Ne pas diviser un bloc vide, sauf s'il est à la fin du contenu
  const afterSplit = !currentBlockEmpty || atEndOfContent ?
    Modifier.splitBlock(afterRemoval, targetSelection) :
    afterRemoval
  const insertionTarget = afterSplit.getSelectionAfter()

  const asTableBlock = Modifier.setBlockType(
    afterSplit,
    insertionTarget,
    blockType,
  )

  const fragmentArray = [
    new ContentBlock({
      key: genKey(),
      type: blockType,
      data: Map({table: data}),
    }),
  ]

  if (!atEndOfBlock || atEndOfContent) {
    // Pour éviter l'insertion d'un bloc vide inutile dans
    // le cas où le curseur est la fin d'un bloc
    fragmentArray.push(new ContentBlock({
      key: genKey(),
      type: 'unstyled',
    }))
  }

  const fragment = BlockMapBuilder.createFromArray(fragmentArray)

  const withTableBlock = Modifier.replaceWithFragment(
    asTableBlock,
    insertionTarget,
    fragment,
  )

  const newContent = withTableBlock.merge({
    selectionBefore: selectionState,
    // really important to set hasFocus to false !!! why???
    selectionAfter: withTableBlock.getSelectionAfter().set('hasFocus', false),
  })

  return EditorState.push(editorState, newContent, 'insert-fragment')
}

import build from './buildKeyCommandHandler'
import { changeCellOrExit, enterBlock, removeBlock } from '../constants'
import changeCellOrExitH from './changeCellOrExit'
import enterBlockH from './enterBlock'
import removeBlockH from './removeBlock'

export const nestedHandleKeyCommands =
  build([
    [changeCellOrExit, changeCellOrExitH],
  ])

export const rootHandleKeyCommands =
  build([
    [enterBlock, enterBlockH],
    [removeBlock, removeBlockH],
  ])

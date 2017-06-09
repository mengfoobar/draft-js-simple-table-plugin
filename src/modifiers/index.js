import insertBlock from './insertBlock'
import removeBlock from './removeBlock'
import { tableBlock } from '../constants'

export const insertTable = insertBlock(tableBlock)
export const removeTable = removeBlock(tableBlock)

import build from './buildKeyBinding'
import changeCellOrExitCmd, { onArrow } from './changeCellOrExit'

export default build([changeCellOrExitCmd])
export { onArrow }

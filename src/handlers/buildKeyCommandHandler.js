import { until, iterApply, pipeline, flip } from '../higherOrderFns'
import { H, NH } from '../constants'

// [Action, Handler] -> Cmd -> Store -> H U NH
const bind = ([action, handler]) => ({ type, payload }) => {
  if (type !== action.type || !payload) { return () => NH }
  return handler(payload)
}

// a -> bool
const handled = x => x === H

// String -> Cmd
const JSONParseOrId = (x) => {
  try {
    return JSON.parse(x)
  } catch(_) {
    return x
  }
}

// [[Actions, Handler]] -> Store -> string -> H U NH
export default actions => flip(
  // string -> Store -> H U NH
  pipeline(
    // string -> Cmd
    JSONParseOrId,
    // Cmd -> [Store -> H U NH]
    iterApply(
      actions.map(bind), // [Cmd -> Store -> H U NH]
    ),
    // [Store -> H U NH] -> Store -> H U NH
    until(handled),
  ),
)

import { uncurry, until, iterApply, pipeline } from '../higherOrderFns'

const notVoid = x => (x !== null && x !== undefined)

// (Event, ES) -> String U {undefined}
export default bindings => uncurry(
  // Event -> ES -> String U {undefined}
  pipeline(
    // Event -> [ES -> String U {undefined}]
    iterApply(bindings),
    // [a -> b] -> a -> b
    until(notVoid),
  ),
)

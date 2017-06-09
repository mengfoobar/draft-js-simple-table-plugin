import { tableBlock, H, NH } from '../constants'

// Handler:: Payload -> Store -> H U NH
export default ({ blockType, blockKey, key }) =>
  ({ getLocker }) => {
    const locker = getLocker()
    if (blockType === tableBlock) {
      const tableCompo = locker.getComponents().get(blockKey)
      locker.lock(tableCompo, { key })
      return H
    }
    return NH
  }

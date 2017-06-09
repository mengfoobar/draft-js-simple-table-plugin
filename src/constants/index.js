export const arrows =
  ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']
export const arrowUp = arrows[0]
export const arrowRight = arrows[1]
export const arrowDown = arrows[2]
export const arrowLeft = arrows[3]
export const tab = 'Tab'
export const backspace = 'Backspace'

export const tableBlock = 'tableBlock'
export const mapExitKeysToTableDirections = {
  [arrowUp]: 'u',
  [arrowRight]: 'r',
  [arrowDown]: 'd',
  [arrowLeft]: 'l',
  [tab]: 'r',
}

export const H = 'handled'
export const NH = 'not-handled'

export const enterBlock = {
  keys: arrows,
  type: 'enterBlock',
  getAction: ({ key, blockKey, blockType }) => ({
    type: enterBlock.type,
    payload: {
      key,
      blockKey,
      blockType,
    },
  }),
}

export const removeBlock = {
  keys: [backspace],
  type: 'removeBlock',
  getAction: ({ key, blockKey, blockType }) => ({
    type: removeBlock.type,
    payload: {
      key,
      blockKey,
      blockType,
    },
  }),
}

export const changeCellOrExit = {
  keys: arrows.concat(tab),
  type: 'changeCellOrExit',
  getAction: ({ key, shift }) => ({
    type: changeCellOrExit.type,
    payload: {
      key,
      shift,
    },
  }),
}

const addRowOrColSVGPathD = 'm 45.5,5.75 0,24.75 -24.75,0 0,9 24.75,0 0,24.75 9,0 0,-24.75 24.75,0 0,-9 -24.75,0 0,-24.75 -9,0 z M 0,70 l 0,1 0,28 0,1 1,0 98,0 1,0 0,-1 0,-28 0,-1 -1,0 -98,0 -1,0 z m 2,2 96,0 0,26 -96,0 0,-26 z m 4,4 0,18 26,0 0,-18 -26,0 z m 31,0 0,18 26,0 0,-18 -26,0 z m 31,0 0,18 26,0 0,-18 -26,0 z'

const removeRowOrColSVGPathD = 'm 30.75,29.3125 -7,7 4.25,4.25 -27,0 -1,0 0,1 0,28 0,1 1,0 27,0 -4.25,4.25 7,7 11.25,-11.25 16,0 11.25,11.25 7,-7 -4.25,-4.25 27,0 1,0 0,-1 0,-28 0,-1 -1,0 -27,0 4.25,-4.25 -7,-7 -11.25,11.25 -16,0 -11.25,-11.25 z M 2,42.5625 l 28,0 7,7 0,12 -7,7 -28,0 0,-26 z m 42,0 12,0 -4,4 -4,0 -4,-4 z m 26,0 28,0 0,26 -28,0 -7,-7 0,-12 7,-7 z m -64,4 0,18 26,0 0,-18 -26,0 z m 62,0 0,18 26,0 0,-18 -26,0 z m -20,18 4,0 4,4 -12,0 4,-4 z'

export const addTablePathD = 'M 12,0 C 5.352,0 0,5.352 0,12 l 0,76 c 0,6.648 5.352,12 12,12 l 76,0 c 6.648,0 12,-5.352 12,-12 l 0,-76 C 100,5.352 94.648,0 88,0 L 12,0 z m 2,8 26,0 c 3.324,0 6,2.676 6,6 l 0,26 c 0,3.324 -2.676,6 -6,6 L 14,46 C 10.676,46 8,43.324 8,40 L 8,14 c 0,-3.324 2.676,-6 6,-6 z m 46,0 26,0 c 3.324,0 6,2.676 6,6 l 0,26 c 0,3.324 -2.676,6 -6,6 l -26,0 c -3.324,0 -6,-2.676 -6,-6 l 0,-26 c 0,-3.324 2.676,-6 6,-6 z m -46,46 26,0 c 3.324,0 6,2.676 6,6 l 0,26 c 0,3.324 -2.676,6 -6,6 L 14,92 C 10.676,92 8,89.324 8,86 L 8,60 c 0,-3.324 2.676,-6 6,-6 z m 46,0 26,0 c 3.324,0 6,2.676 6,6 l 0,26 c 0,3.324 -2.676,6 -6,6 l -26,0 c -3.324,0 -6,-2.676 -6,-6 l 0,-26 c 0,-3.324 2.676,-6 6,-6 z'

export const tableOp = {
  addRowAfter: {
    icon: {
      d: addRowOrColSVGPathD,
      angle: '0',
    },
  },
  addColAfter: {
    icon: {
      d: addRowOrColSVGPathD,
      angle: '-90',
    },
  },
  addRowBefore: {
    icon: {
      d: addRowOrColSVGPathD,
      angle: '180',
    },
  },
  addColBefore: {
    icon: {
      d: addRowOrColSVGPathD,
      angle: '90',
    },
  },
  removeRow: {
    icon: {
      d: removeRowOrColSVGPathD,
      angle: '0',
    },
  },
  removeCol: {
    icon: {
      d: removeRowOrColSVGPathD,
      angle: '90',
    },
  },
}

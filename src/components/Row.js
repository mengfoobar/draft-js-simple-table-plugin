import React from 'react'
import Cell from './Cell'

export default ({
  row,
  onMouseDown,
  activeCell,
  NestedEditor,
  ...other
}) => {
  const theRow = row.map((cell) => {
    const {
      key,
      rowspan,
      colspan,
      data,
    } = cell.toObject()
    return (
      <Cell
        key={key}
        colSpan={colspan}
        rowSpan={rowspan}
        onMouseDown={onMouseDown(key)}
        {...other}
      >
        <NestedEditor
          cellKey={key}
          contentState={data}
          readOnly={key !== activeCell}
        />
      </Cell>
    )
  })

  return (
    <tr>
      { theRow }
    </tr>
  )
}

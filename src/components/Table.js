import React from 'react'
import Row from './Row'
import styles from '../table.css'

export default (props) => {
  const { content, tmp, ...rowProps } = props
  const { table, rows, cells } = content.toObject()
  const dejaVu = {}
  const tableRows = table.map((rk) => {
    const row = rows.getIn([rk, 'cells'])
      .filter(ck => dejaVu[ck] ? false : dejaVu[ck] = true)
      .map(ck => cells.get(ck))
    return (
      <Row
        key={rk}
        row={row}
        {...rowProps}
      />
    )
  })

  return (
    <table
      className={styles.table}
      cellSpacing="0"
      ref={props.tmp}
    >
      <tbody>{tableRows}</tbody>
    </table>
  )
}

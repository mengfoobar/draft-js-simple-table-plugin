// Alias:: CellKey: string
// Alias:: RowKey: string
// Alias:: Table a: {
//  nextRowKey: number,
//  nextCellKey: number,
//  col: number,
//  table: [RowKey],
//  rows: {[RowKey]: {key: RowKey, cells: [CellKey]}},
//  cells: {[CellKey]: {
//    key: CellKey,
//    row: number,
//    col: number,
//    rowspan: number,
//    colspan: number,
//    data: a,
// }

// insert: (number, a) -> [a] -> [a]
const insert = (i, what) => (xs) => {
  const ret = xs.slice()
  ret.splice(i, 0, what)
  return ret
}

// remove: number -> [a] -> [a]
const remove = i => (xs) => {
  const ret = xs.slice()
  ret.splice(i, 1)
  return ret
}

// addRow: (CellKey, bool) -> (_ -> a) -> Table a -> Table a
export const addRow = (cellKey = null, after = true) =>
  (data = () => '') =>
    (Table) => {
      const { table, rows, cells, col, ...other } = Table
      let { nextRowKey, nextCellKey } = other
      if (cellKey === null) {
        cellKey = rows[table[table.length - 1]].cells[0]
      }
      const { row, rowspan } = cells[cellKey]
      // 1 <= rI <= col (after=true),
      // -1 <= rI <= col-2 (after=false))
      let rI = row + (after ? rowspan : -1)
      const lim = after ? table.length : -1

      let newRow
      if (rI === lim) {
        newRow = rows[table[0]].cells.map(() =>
          (nextCellKey++).toString(),
        )
      } else {
        newRow = rows[table[rI]].cells.map((ck) => {
          const { row: r, rowspan } = cells[ck]
          if (after ? r < rI : r + rowspan - 1 > rI) { return ck }
          return (nextCellKey++).toString()
        })
      }
      const newRowKey = (nextRowKey++).toString()

      rI = after ? rI : rI + 1
      const cellsToMove = Object.keys(cells).filter(ck => cells[ck].row >= rI)

      const newTable = insert(rI, newRowKey)(table)

      const newRows = {
        ...rows,
        [newRowKey]: {
          key: newRowKey,
          cells: newRow,
        },
      }

      const cellsToUpdate = []
      const newCells = newRow.reduce((red, ck, col) => {
        if (cells[ck] !== undefined) {
          cellsToUpdate.push(ck)
          return red
        }
        return {
          ...red,
          [ck]: {
            key: ck,
            row: rI,
            col,
            rowspan: 1,
            colspan: 1,
            data: data(),
          },
        }
      }, { ...cells })

      cellsToUpdate.forEach((ck) => {
        newCells[ck].rowspan += 1
      })

      cellsToMove.forEach((ck) => {
        newCells[ck].row += 1
      })

      return {
        nextRowKey,
        nextCellKey,
        col,
        cells: newCells,
        rows: newRows,
        table: newTable,
      }
    }

// removeRow: CellKey -> _ -> Table a -> Table a
export const removeRow = cellKey =>
  () =>
    (Table) => {
      const { table, rows, cells, ...other } = Table
      if (table.length === 1) { return Table }
      const { row } = cells[cellKey]
      const rowKey = table[row]
      const cellsToDelete = {}
      const cellsToUpdate = {}
      const newTable = remove(row)(table)

      rows[rowKey].cells.forEach((ck) => {
        const { rowspan } = cells[ck]
        if (rowspan === 1 && cellsToDelete[ck] === undefined) {
          cellsToDelete[ck] = true
        } else if (rowspan > 1 && cellsToUpdate[ck] === undefined) {
          cellsToUpdate[ck] = true
        }
      })
      const cellsToMoveUp = table.slice(row + 1).reduce((red, rk) => {
        const toAdd = rows[rk].cells.reduce((red, ck) => {
          if (red[ck] === undefined && cellsToUpdate[ck] === undefined) {
            return {
              ...red,
              [ck]: true,
            }
          }
          return red
        }, {})
        return {
          ...red,
          ...toAdd,
        }
      }, {})

      const newRows = { ...rows }
      delete newRows[rowKey]

      const newCells = { ...cells }
      Object.keys(cellsToDelete).forEach((ck) => {
        delete newCells[ck]
      })
      Object.keys(cellsToUpdate).forEach((ck) => {
        newCells[ck].rowspan -= 1
      })
      Object.keys(cellsToMoveUp).forEach((ck) => {
        newCells[ck].row -= 1
      })

      return {
        table: newTable,
        rows: newRows,
        cells: newCells,
        ...other,
      }
    }

// addCol: (CellKey, bool) -> (_ -> a) -> Table a -> Table a
export const addCol = (cellKey, after = true) =>
  (data = () => '') =>
    (Table) => {
      const { table, rows, cells, col, ...other } = Table
      let { nextCellKey, nextRowKey } = other
      if (cellKey === null) {
        cellKey = rows[table[0]].cells[col - 1]
      }
      const { col: c, colspan } = cells[cellKey]
      let cI = c + (after ? colspan : -1)
      const lim = after ? col : -1

      let newCol
      if (cI === lim) {
        newCol = table.map(() => (nextCellKey++).toString())
      } else {
        newCol = table.map((rk) => {
          const { key: ck, col: c, colspan } = cells[(rows[rk].cells)[cI]]
          if (after ? c < cI : c + colspan - 1 > cI) { return ck }
          else { return (nextCellKey++).toString() }
        })
      }

      cI = after ? cI : cI + 1
      const cellsToMove = Object.keys(cells).filter(ck => cells[ck].col >= cI)

      const newRows = table.reduce((red, rk, r) => ({
        ...red,
        [rk]: {
          key: rk,
          cells: insert(cI, newCol[r])(rows[rk].cells),
        },
      }), { ...rows })

      const cellsToUpdate = []
      const newCells = newCol.reduce((red, ck, row) => {
        if (cells[ck] !== undefined) {
          cellsToUpdate.push(ck)
          return red
        }
        return {
          ...red,
          [ck]: {
            key: ck,
            row,
            col: cI,
            rowspan: 1,
            colspan: 1,
            data: data(),
          },
        }
      }, { ...cells })

      cellsToUpdate.forEach((ck) => {
        newCells[ck].colspan += 1
      })

      cellsToMove.forEach((ck) => {
        newCells[ck].col += 1
      })

      return {
        nextRowKey,
        nextCellKey,
        col: col + 1,
        cells: newCells,
        rows: newRows,
        table,
      }
    }

// removeCol: CellKey -> _ -> Table a -> Table a
export const removeCol = cellKey =>
  _ =>
    Table => {
      const { table, rows, cells, col, ...other } = Table
      if (col === 1) { return Table }

      const { col: cI } = cells[cellKey]
      const cellsToDelete = {}
      const cellsToUpdate = {}

      table.reduce((red, rk) => [...red, (rows[rk].cells[cI])], [])
        .forEach(ck => {
          const { colspan } = cells[ck]
          if (colspan === 1 && cellsToDelete[ck] === undefined) {
            cellsToDelete[ck] = true
          }
          else if (colspan > 1 && cellsToUpdate[ck] === undefined) {
            cellsToUpdate[ck] = true
          }
        })

      const cellsToMoveLeft = table.reduce((red, rk) => {
        const toAdd = rows[rk].cells.slice(cI + 1).reduce((red, ck) => {
          if (red[ck] === undefined && cellsToUpdate[ck] === undefined) {
            return {
              ...red,
              [ck]: true,
            }
          }
          return red
        }, {})
        return {
          ...red,
          ...toAdd,
        }
      }, {})

      let newRows = table.reduce((red, rk) => {
        return {
          ...red,
          [rk]: {
            ...red[rk],
            cells: remove(cI)(red[rk].cells)
          }
        }
      }, {...rows})

      let newCells = { ...cells }
      Object.keys(cellsToDelete).forEach(ck => {
        delete newCells[ck]
      })
      Object.keys(cellsToUpdate).forEach(ck => {
        newCells[ck].colspan -= 1
      })
      Object.keys(cellsToMoveLeft).forEach(ck => {
        newCells[ck].col -= 1
      })

      return {
        table,
        rows: newRows,
        cells: newCells,
        col: col - 1,
        ...other,
      }
    }

// merge: (CellKey, number, number) -> _ -> Table a -> Table a
export const merge = (cellKey, rowspan=1, colspan=1) =>
  _ =>
    Table => {
      if (
        Table.cells[cellKey] === undefined ||
        (rowspan === 1 && colspan === 1)
      ) { return Table }

      const { table, cells, rows } = Table
      const { row, col, rowspan: rs, colspan: cs } = cells[cellKey]
      const newRowspan = rowspan > rs ? rowspan : rs
      const newColspan = colspan > cs ? colspan: cs
      if (newRowspan === rs && newColspan === cs) { return Table }

      const newCells = {
        ...cells,
        [cellKey]: {
          ...cells[cellKey],
          rowspan: newRowspan,
          colspan: newColspan,
        }
      }
      const cellsToDel = []
      const newRows = table.reduce((red, rk, i) => {
        if (i < row || i >= row + newRowspan) { return red }
        else {
          let cells = red[rk].cells.map((ck, j) => {
            if (j < col || j >= col + newColspan) { return ck }
            else {
              if (ck !== cellKey) {
                cellsToDel.push(ck)
              }
              return cellKey
            }
          })
          return {
            ...red,
            [rk]: {
              ...red[rk],
              cells,
            }
          }
        }
      }, {...rows})

      cellsToDel.forEach(ck => {
        delete newCells[ck]
      })

      return {
        ...Table,
        rows: newRows,
        cells: newCells,
      }
    }

// split: CellKey -> _ -> Table a -> Table a
export const split = cellKey =>
  _ =>
    Table => {
      const { table, rows, cells } = Table
      if (
        cells[cellKey] === undefined || (
          cells[cellKey].rowspan === 1 &&
          cells[cellKey].colspan === 1
        )
      ) { return Table }

      let nextCellKey = Table.nextCellKey
      const newCells = {
        ...cells,
        [cellKey]: {
          ...cells[cellKey],
          rowspan: 1,
          colspan: 1,
        }
      }

      const cellsToCreate = []
      const { row, col, rowspan, colspan } = cells[cellKey]
      const newRows = table.reduce( (red, rk, i) => {
        if (i < row || i >= row + rowspan) { return red }
        else {
          const cells = rows[rk].cells.map((ck, j) => {
            if (j < col || j >= col + colspan) { return ck }
            else {
              if (j === col && i === row) { return ck }
              else {
                const newCellKey = (nextCellKey++).toString()
                cellsToCreate.push(newCellKey)
                return newCellKey
              }
            }
          })
          return {
            ...red,
            [rk]: {
              ...red[rk],
              cells,
            }
          }
        }
      }, {...rows})

      cellsToCreate.forEach(ck => {
        newCells[ck] = {
          ...newCells[cellKey],
          key: ck,
          data: newCells[cellKey].data,
        }
      })

      return {
        ...Table,
        nextCellKey,
        cells: newCells,
        rows: newRows,
      }
    }

// const compose = (f, ...fs) => x => {
//   if (fs.length === 0) { return f(x) }
//   return compose(...fs)(f(x))
// }

// const perf = f => x => {
//   const t1 = Date.now()
//   const res = f(x)
//   const t2 = Date.now()
//   console.log('js', t2-t1)
//   return res
// }

// perf(
//   compose(
//     addRow()(),
//     addRow('0', false)(),
//     addRow('1')(),
//     addRow()(),
//     addRow(3, false)(),
//   )
// )(simpleTable.toObject())
// const getRow = ({ table, rows, cells }) => rowI => {
//   // [cells]
//   if (table.indexOf(rowI) === -1) return
//   return rows[table[rowI]].map(cId => cells[cId])
// }

// const getCellKey = ({ table, rows, cells  }) => (rowI, colI) => {
//   return rows[table[rowI]].cells[colI]
// }

// const getCoordsOfCell = ({ table, rows, cells  }) => (cellKey) => {
//   //[[rowI, colI], rowspan, colspan]
//   if (cells[cellKey] === undefined) return
//   const coord = [0, 0]
//   let lookCoord = true
//   let stop = false
//   let rowspan = 1
//   let colspan = 1
//   for (let i = 0, R = table.length; i < R; i++) {
//     if (stop) { break }
//     const row = rows[table[i]].cells
//     for (let j = 0, C = row.length; j < C; j++) {
//       const ck = row[j]
//       const match = ck === cellKey
//       if (lookCoord) {
//         if (match) {
//           coord[0] = i
//           coord[1] = j
//           lookCoord = false
//         }
//       } else if ( i === coord[0]) {
//         if (match) { colspan += 1 }
//         else { break }
//       } else if ( i > coord[0]) {
//         if (match) {
//           rowspan += 1
//           break
//         } else if ( j === C-1 ) {
//           stop = true
//         }
//       }
//     }
//   }
//   const { rowspan: rs, colspan: cs } = cells[cellKey]
//   // assert(!lookCoord && rs === rowspan && cs === colspan)
//   return {
//     row: coord[0],
//     col: coord[1],
//     rowspan,
//     colspan,
//   }
// }

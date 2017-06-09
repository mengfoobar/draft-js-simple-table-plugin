import React from 'react'

export default ({
  children,
  ...other
}) => (
  <td
    {...other}
  >
    { children }
  </td>
)

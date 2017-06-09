import React from 'react'

export default ({ d, angle = 0 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 100 100"
  >
    <path
      d={d}
      transform={angle === 0 ? undefined : `rotate(${angle},50,50)`}
    />
  </svg>
)

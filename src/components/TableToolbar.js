import React from 'react'
import Icon from './Icon'
import Op from '../model/immutableTableOp'
import styles from '../toolBar.css'

export default class TableToolBar extends React.Component {
  constructor(props) {
    super(props)
    props.register(this)
    this.state = { left: undefined }
    this.table = null
    this.wrapper = null
  }

  update = () => {
    const { left, width } = this.table.getBoundingClientRect()
    const { left: leftW } = this.wrapper.getBoundingClientRect()
    this.setState({
      left: (left - leftW) + (width / 2),
    })
  }

  render() {
    const { visible, onMouseDown } = this.props
    const style = {
      ...this.state,
      transform: `translate(-50%, 0) scale(${visible ? 1 : 0})`,
      transition: `transform 0.3s ease-${visible ? 'out' : 'in'}`,
    }
    return (
      <div
        className={styles.tableToolbar}
        style={style}
      >
        { Object.keys(Op).map(opName => (
          <button
            key={opName}
            onMouseDown={onMouseDown(opName)}
            disabled={!visible}
          >
            <Icon
              {...Op[opName].icon}
            />
          </button>
        )) }
      </div>
    )
  }
}

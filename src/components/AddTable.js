import React, { Component } from 'react'
import { insertTable } from '../modifiers'
import defaultTableProducer from '../model/tableCreator'
import { addTablePathD } from '../constants'
import Icon from './Icon'

export default ({ getStore, getLocker }) => {
  let locker
  return class AddTable extends Component {
    constructor(props) {
      super(props)

      this.disabled = false
      setTimeout(() => {
        locker = getLocker()
        locker.register(this.onLockedByChange)
      }, 0)
    }

    componentWillUnmount() {
      locker.unregister(this.onLockedByChange)
    }

    onLockedByChange = ({ component, isRootEditorReadOnly }) => {
      if (isRootEditorReadOnly) {
        this.disabled = true
        this.forceUpdate()
        return
      }
      this.disabled = !!component
      this.forceUpdate()
    }

    onClick = () => {
      const store = getStore()
      const {
        setEditorState,
        getEditorState,
      } = store
      store.addTable = true
      setEditorState(
        insertTable(getEditorState())(defaultTableProducer()),
      )
    }

    render() {
      return (
        <button
          disabled={this.disabled}
          onClick={this.onClick}
        >
          <Icon d={addTablePathD} />
        </button>
      )
    }
  }
}

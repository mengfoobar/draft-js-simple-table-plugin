import React, { Component } from 'react'
import { EditorState } from 'draft-js'
import { Map } from 'immutable'

import Op from '../model/immutableTableOp'
import Get from '../model/tableGetters'

import Table from './Table'
import TableToolbar from './TableToolbar'

import { arrowLeft, arrowRight, arrowUp, arrowDown } from '../constants'
import styles from '../tableWrapper.css'

export default ({ /* theme, */ getStore, getLocker }) => {
  let store, locker, getEditorState, setEditorState
  return class TableEditor extends Component {
    constructor(props) {
      super(props)

      store = getStore()
      getEditorState = store.getEditorState
      setEditorState = store.setEditorState
      locker = getLocker()

      locker.register(this)

      this.state = {
        currentCell: null,
      }

      this.editors = Map()
      this.NestedEditor = props.blockProps.NestedEditor({
        registerFn: this.registerEditor,
        unregisterFn: this.unregisterEditor,
        onContentChangeFn: this.onEditorChange,
      })
    }

    onLockChange = ({ isRootEditorReadOnly, component, payload }) => {
      if (isRootEditorReadOnly) {
        this._setState(null)
        return
      }
      if (component !== this) {
        this._setState(null)
      } else if (payload) {
        const key = payload.key
        let cellKey
        if ([arrowRight, arrowDown].indexOf(key) >= 0) {
          cellKey = this.getFirstCellKey()
        } else if ([arrowLeft, arrowUp].indexOf(key) >= 0) {
          cellKey = this.getLastCellKey()
        } else {
          return
        }
        this._setState(cellKey)
      }
    }
    _lock = () => locker.lock(this)
    _focus = ck => this.editors.get(ck).editor.focus()
    _blur = ck => this.editors.get(ck).editor.blur()
    _setState = (ck) => {
      const { isRootEditorReadOnly } = locker.getLockedBy()
      if (isRootEditorReadOnly) {
        this.setState({ currentCell: null })
        return
      }
      this.setState({ currentCell: ck }, () => {
        if (ck === null) { return }
        setTimeout(() => {
          this.toolBar.update()
          this._focus(ck)
        }, 0)
      })
    }

    getBlock = () => this.props.block
    getBlockKey = () => this.props.block.getKey()
    getData = () => this.props.block.getData().get('table')

    getFirstCellKey = () => Get.firstCellKey(this.getData())
    getLastCellKey = () => Get.lastCellKey(this.getData())

    getNextCellKey = (dir) => {
      const currentCellKey = this.state.currentCell
      const table = this.getData()
      return Get.nextCellKey(currentCellKey, table)(dir)
    }

    changeCell = (ck) => {
      if (!ck || !this.editors.has(ck)) { return }
      const current = this.state.currentCell
      if (current) { this._blur(current) }
      this._setState(ck)
    }

    shouldComponentUpdate(nextProps, nextState) {
      const table1 = this.getData()
      const table2 = nextProps.block.getData()
      if (
        this.state === nextState &&
        Get.size(table1).equals(Get.size(table2))
      ) {
        return false
      }
      return true
    }

    componentWillUnmount() {
      locker.unregister(this)
    }

    componentDidMount() {
      this.toolBar.table = this.innerTable
      this.toolBar.wrapper = this.domNode
      if (store.addTable) {
        store.addTable = false
        this._lock()
        // Note: I don't know why i can't call this._setState
        this.setState({ currentCell: '0' })
        setTimeout(() => this._focus('0'), 0)
        this.toolBar.update()
      }
    }

    registerEditor = cellKey => (editor) => {
      this.editors = this.editors.set(cellKey, editor)
    }

    unregisterEditor = cellKey => () => {
      this.editors = this.editors.delete(cellKey)
    }

    onEditorChange = cellKey => (contentState) => {
      this.toolBar.update()
      const content = this.getData()
      const newContent = content.setIn(
        ['cells', cellKey, 'data'],
        contentState,
      )
      this.saveContent(newContent)
    }

    saveContent = (content) => {
      const block = this.getBlock()
      const editorState = getEditorState()
      const contentState = editorState.getCurrentContent()
      // const newBlock = block.set('data', content)
      const newBlock = block.setIn(['data', 'table'], content)
      let newContentState = contentState.setIn(
        ['blockMap', block.getKey()],
        newBlock,
      )
      // bug: when the contentState of the parent editor (in
      // readOnly mode) has a selectionAfter with focus,
      // the inner editor receive an incorrect blockKey
      // (probably that of the selectionAfter of parent editor)
      // workaround:
      const isSelectionAfterHasFocus = contentState.getIn(
        ['selectionAfter', 'hasFocus'],
      )
      if (isSelectionAfterHasFocus) {
        newContentState = newContentState.update(
          'selectionAfter',
          sa => sa.merge({ hasFocus: false }),
        )
      }
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-block-data',
      )
      setEditorState(newEditorState)
    }

    onCellMouseDown = cellKey => () => {
      this._setState(cellKey)
    }

    onToolBarClick = opName => () => {
      const { currentCell } = this.state
      const { content, cell } = Op[opName].fn(currentCell, this.getData())
      this.saveContent(content)
      this._setState(cell)
    }

    renderToolBar = () => {
      const { component, isRootEditorReadOnly } = locker.getLockedBy()
      const visible = !isRootEditorReadOnly && component === this

      return (
        <TableToolbar
          visible={visible}
          register={(toolBar) => { this.toolBar = toolBar }}
          onMouseDown={this.onToolBarClick}
        />
      )
    }

    render() {
      const { className } = this.props
      // const classNames = [className, theme.table].filter((p) => p)

      return (
        <div
          className={styles.tableWrapper}
          ref={(tableWrapper) => { this.domNode = tableWrapper }}
          onMouseDown={this._lock}
        >
          {this.renderToolBar()}
          <Table
            className={className}
            content={this.getData()}
            activeCell={this.state.currentCell}
            NestedEditor={this.NestedEditor}
            onMouseDown={this.onCellMouseDown}
            tmp={(table) => { this.innerTable = table }}
          />
        </div>
      )
    }
  }
}

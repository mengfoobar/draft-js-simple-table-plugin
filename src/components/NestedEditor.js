import React, { Component } from 'react'
import Editor from 'draft-js-plugins-editor'
import { EditorState } from 'draft-js'
import { is } from 'immutable'
import keyBindings, { onArrow } from '../keyBindings'
import { nestedHandleKeyCommands } from '../handlers'

export default ({ plugins, getStore, getLocker }) =>
  ({ registerFn, unregisterFn, onContentChangeFn }) =>
    class NestedEditor extends Component {
      constructor(props) {
        super(props)
        const { cellKey, contentState } = props
        this.register = registerFn(cellKey)
        this.unregister = unregisterFn(cellKey)
        this.onContentChange = onContentChangeFn(cellKey)

        const editorState = EditorState.createWithContent(
          contentState,
        )
        this.state = { editorState }

        this.plugins = plugins.map((p) => {
          if (typeof p === 'function') { return p() }
          if (p instanceof Array) { return p[0](p[1]) }
          throw Error(
            'pluginsFns needs to be an array of \'plugins creators\'i' +
            'or an array of the form [plugin creator fn, config]',
          )
        })
      }

      componentDidMount() {
        this.register(this)
      }

      componentWillUnmount() {
        this.unregister(this)
      }

      shouldComponentUpdate(nextProps, nextState) {
        if (
          this.props.readOnly === nextProps.readOnly &&
          is(nextState.editorState, this.state.editorState)
        ) {
          return false
        }
        return true
      }

      handleKeyCommand = nestedHandleKeyCommands({ getStore, getLocker })

      keyBindingFn = e => keyBindings(e, this.state.editorState)

      _onArrow = e => onArrow(
        this.state.editorState,
        this.handleKeyCommand,
      )(e)

      onChange = (editorState) => {
        const { editorState: lastState } = this.state
        this.setState(
          { editorState },
          () => {
            if (!(lastState.getCurrentContent()
              .equals(editorState.getCurrentContent())
            )) {
              const content = editorState.getCurrentContent()
              this.onContentChange(content)
            }
          },
        )
      }

      render() {
        return (
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            ref={(editor) => { this.editor = editor }}
            placeholder="..."
            readOnly={this.props.readOnly}
            plugins={this.plugins}
            keyBindingFn={this.keyBindingFn}
            handleKeyCommand={this.handleKeyCommand}
            onUpArrow={this._onArrow}
            onDownArrow={this._onArrow}
            onTab={this._onArrow}
          />
        )
      }
    }

import { Map } from 'immutable'

import { tableBlock } from './constants'
import { convertToRaw, convertFromRaw } from './model/converters'

import TableWrapper from './components/TableWrapper'
import nestedEditor from './components/NestedEditor'
import addTable from './components/AddTable'

import { rootHandleKeyCommands } from './handlers'

const defaultTheme = {}

const tablePlugin = (config = {}) => {
  const type = tableBlock
  const theme = config.theme ? config.theme : defaultTheme
  const plugins = config.pluginsFns || []

  const getDependency = (getPlugins) => {
    const utilPlugin = getPlugins().filter(p =>
      p.pluginName === 'editable-block-component-helper',
    )
    if (utilPlugin.length !== 1) {
      throw Error('this plugin depend on draft-js-editable-block-component-helper-plugin...')
    }
    return utilPlugin[0]
  }

  const store = {
    addTable: false,
    getEditorState: undefined,
    setEditorState: undefined,
    getEditorRef: undefined,
  }
  const getStore = () => store

  let locker
  const getLocker = () => locker

  const Table = TableWrapper({ theme, getStore, getLocker })
  const NestedEditor = nestedEditor({ plugins, getStore, getLocker })
  const AddTable = addTable({ getStore, getLocker })

  let normalKeyBindings
  const keyBindingFn = (e, { getEditorState, getPlugins }) => {
    if (!normalKeyBindings) {
      normalKeyBindings = getDependency(getPlugins).normalKeyBindings
    }
    return normalKeyBindings(e, getEditorState())
  }

  const handleKeyCommand = rootHandleKeyCommands({ getStore, getLocker })

  let specialKeyBindings
  const onArrow = (e, { getEditorState, getPlugins }) => {
    if (!specialKeyBindings) {
      specialKeyBindings = getDependency(getPlugins).specialKeyBindings
    }
    return specialKeyBindings(getEditorState(), handleKeyCommand)(e)
  }

  return {
    initialize: ({
      setEditorState,
      getEditorState,
      getPlugins,
    }) => {
      store.setEditorState = setEditorState
      store.getEditorState = getEditorState
      locker = getDependency(getPlugins).locker
    },
    blockRenderMap: Map({
      [tableBlock]: {
        element: 'div',
      },
    }),
    blockRendererFn: (contentBlock) => {
      const blockType = contentBlock.getType()
      if (blockType === type) {
        return {
          component: Table,
          editable: false,
          props: {
            NestedEditor,
          },
        }
      }
      return undefined
    },
    keyBindingFn,
    onUpArrow: onArrow,
    onDownArrow: onArrow,
    handleKeyCommand,
    AddTableButton: AddTable,
    pluginName: 'simpleTable',
  }
}

export default tablePlugin
export { convertToRaw, convertFromRaw }

import {obtain, inset, walk} from '@thenewvu/objutil'

export default
function reduckless ({prefix, origin = {}, getter, action = {}}) {
  if (typeof prefix !== 'string') throw new Error(`Require "prefix" string but got ${prefix}`)
  if (typeof action !== 'object') throw new Error(`Require "action" object but got ${action}`)

  const reduce = (state, {type, payload}) => {
    state = state || origin

    const [handlePrefix, handlePath] = type.split('/')
    if (handlePrefix === prefix) {
      const h = obtain(action, handlePath)
      if (typeof h === 'function') {
        return h(state, payload)
      }
    }

    return state
  }

  const on = {}
  walk(action, (node, path) => {
    if (typeof node === 'function') {
      inset(on, path, payload => ({type: `${prefix}/${path}`, payload}))
    } else if (!obtain(on, path)) {
      inset(on, path, {})
    }
  })

  const get = {}
  walk(getter, (node, path) => {
    if (typeof node === 'function') {
      inset(get, path, (state, ...args) => node(state[prefix], ...args))
    } else if (!obtain(get, path)) {
      inset(get, path, {})
    }
  })

  return {reduce, get, on}
}

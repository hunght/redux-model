import {obtain, inset, walk} from '@thenewvu/objutil'

export default
function reduckless ({prefix, origin = {}, getter, handle = {}}) {
  if (typeof prefix !== 'string') throw new Error(`Require "prefix" string but got ${prefix}`)
  if (typeof handle !== 'object') throw new Error(`Require "handle" object but got ${handle}`)

  const reduce = (state, {type, payload}) => {
    state = state || origin

    const [handlePrefix, handlePath] = type.split('/')
    if (handlePrefix === prefix) {
      const h = obtain(handle, handlePath)
      if (typeof h === 'function') {
        return h(state, payload)
      }
    }

    return state
  }

  const on = {}
  walk(handle, (node, path) => {
    if (typeof node === 'function') {
      inset(on, path, payload => ({type: `${prefix}/${path}`, payload}))
    } else if (!obtain(on, path)) {
      inset(on, path, {})
    }
  })

  const get = {}
  walk(getter, (node, path) => {
    if (typeof node === 'function') {
      inset(get, path, state => node(state[prefix]))
    } else if (!obtain(get, path)) {
      inset(get, path, {})
    }
  })

  return {reduce, get, on}
}

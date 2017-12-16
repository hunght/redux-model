import {get, inset, walk} from '@thenewvu/objutil'
import {connect as _connect} from 'react-redux'

export const modelize = (model) => {
  if (typeof model !== 'object') throw new Error(`Require "model" object but got ${model}`)
  if (typeof model.prefix !== 'string') throw new Error(`Require "prefix" string but got ${model.prefix}`)
  if (typeof model.action !== 'object') throw new Error(`Require "action" object but got ${model.action}`)

  const reduce = (state, {type, payload}) => {
    state = state || model.origin

    const [handlePrefix, handlePath] = type.split('/')
    if (handlePrefix === model.prefix) {
      const h = get(model.action, handlePath)
      if (typeof h === 'function') {
        return h(state, payload)
      }
    }

    return state
  }

  const action = {}
  walk(model.action, (node, path) => {
    if (typeof node === 'function') {
      inset(action, path, payload => ({type: `${model.prefix}/${path}`, payload}))
    } else if (!get(action, path)) {
      inset(action, path, {})
    }
  })

  const getter = {}
  walk(model.getter, (node, path) => {
    if (typeof node === 'function') {
      inset(getter, path, (state, ...args) => node(state[model.prefix], ...args))
    } else if (!get(getter, path)) {
      inset(getter, path, {})
    }
  })

  return {reduce, getter, action}
}

export const connect = (mapGetter, mapAction, Component) => (getter, action) => {
  if (typeof getter !== 'object') throw new Error(`Require "getter" object but got ${getter}`)
  if (typeof action !== 'object') throw new Error(`Require "action" object but got ${action}`)
  return _connect(mapGetter(getter), mapAction(action))(Component)
}

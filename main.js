import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {combineReducers} from 'redux'
import {connect as connectStore} from 'react-redux'

const walk = (obj, fn, path = '') => {
  if (!obj) return

  Object.keys(obj).forEach((key) => {
    const nextNode = obj[key]
    const nextPath = path ? `${path}.${key}` : key
    fn(nextNode, nextPath)
    walk(nextNode, fn, nextPath)
  })
}

const get = (obj, at) => {
  if (!obj) return undefined
  if (!at) return obj

  const firstDot = at.indexOf('.')
  if (firstDot === -1) return obj[at]

  const firstKey = at.slice(0, firstDot)
  const restPath = at.slice(firstDot + 1)
  return get(obj[firstKey], restPath)
}

const set = (obj, at, val) => {
  if (!obj || !at) return

  const firstDot = at.indexOf('.')
  if (firstDot === -1) {
    obj[at] = val
  } else {
    const firstKey = at.slice(0, firstDot)
    const restPath = at.slice(firstDot + 1)
    set(obj[firstKey], restPath, val)
  }

  return obj
}

export const createModel = (model) => {
  if (typeof model !== 'object') {
    throw new Error(`Require "model" object but got ${model}`)
  }
  if (typeof model.prefix !== 'string') {
    throw new Error(`Require "prefix" string but got ${model.prefix}`)
  }
  if (typeof model.action !== 'object') {
    throw new Error(`Require "action" object but got ${model.action}`)
  }

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
      set(action, path, (payload) => ({
        type: `${model.prefix}/${path}`,
        payload
      }))
    } else if (!get(action, path)) {
      set(action, path, {})
    }
  })

  const getter = {}
  walk(model.getter, (node, path) => {
    if (typeof node === 'function') {
      set(getter, path, (state, ...args) => (
        node(state[model.prefix], ...args)
      ))
    } else if (!get(getter, path)) {
      set(getter, path, {})
    }
  })

  return {prefix: model.prefix, reduce, getter, action}
}

export const createModelView = (mapGetter, mapAction) => (view) => (
  class ModelView extends Component {
    static contextTypes = {
      getter: PropTypes.object.isRequired,
      action: PropTypes.object.isRequired
    }

    ConnectedView = connectStore(
      mapGetter && mapGetter(this.context.getter),
      mapAction && mapAction(this.context.action)
    )(view)

    render () {
      const ConnectedView = this.ConnectedView
      return <ConnectedView {...this.props} />
    }
  }
)

export const combineModels = (models) => {
  const combined = {getter: {}, action: {}, reduce: {}}
  Object.keys(models).forEach((id) => {
    const {prefix, getter, action, reduce} = models[id]
    combined.getter[prefix] = getter
    combined.action[prefix] = action
    combined.reduce[prefix] = reduce
  })
  combined.reduce = combineReducers(combined.reduce)
  return combined
}

export class ModelProvider extends Component {
  static childContextTypes = {
    getter: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired
  }

  getChildContext () {
    return {
      getter: this.props.getter,
      action: this.props.action
    }
  }

  render () {
    return this.props.children
  }
}

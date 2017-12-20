import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {get, inset, walk} from '@thenewvu/objutil'
import {combineReducers} from 'redux'
import {connect as connectStore} from 'react-redux'

export const createModel = model => {
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
      inset(action, path, payload => ({
        type: `${model.prefix}/${path}`,
        payload
      }))
    } else if (!get(action, path)) {
      inset(action, path, {})
    }
  })

  const getter = {}
  walk(model.getter, (node, path) => {
    if (typeof node === 'function') {
      inset(getter, path, (state, ...args) => (
        node(state[model.prefix], ...args)
      ))
    } else if (!get(getter, path)) {
      inset(getter, path, {})
    }
  })

  return {reduce, getter, action}
}

export const createModelView = (mapGetter, mapAction) => view => (
  class extends Component {
    static contextTypes = {
      getter: PropTypes.object.isRequired,
      action: PropTypes.object.isRequired
    }
    render () {
      const getter = mapGetter(this.context.getter)
      const action = mapAction(this.context.action)
      const ConnectedView = connectStore(getter, action)(view)
      return <ConnectedView {...this.props} />
    }
  }
)

export const combineModels = models => {
  const combined = {getter: {}, action: {}, reduce: {}}
  Object.keys(models).forEach(name => {
    combined.getter[name] = models[name].getter
    combined.action[name] = models[name].action
    combined.reduce[name] = models[name].reduce
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

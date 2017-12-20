/* global expect, describe, test */

import {createModel} from './main'

describe('createModel', () => {
  test('reduce', () => {
    const prefix = 'prefix'
    const origin = 'origin'
    const action = {
      test: {
        actionType: () => 'change',
        prevState: state => state + '+change',
        payload: (state, payload) => state + '+' + payload
      }
    }

    const {reduce} = createModel({prefix, origin, action})

    expect(reduce(null, {type: `${prefix}/test.origin`})).toEqual(origin)
    expect(reduce(null, {type: `${prefix}/test.actionType`})).toEqual('change')
    expect(reduce('prevState', {type: `${prefix}/test.prevState`})).toEqual('prevState+change')
    expect(reduce(null, {type: `${prefix}/test.payload`, payload: 'payload'})).toEqual('origin+payload')
  })

  test('action', () => {
    const prefix = 'prefix'
    const {action} = createModel({
      prefix,
      origin: 'origin',
      action: {
        x: {
          y: () => {},
          z: () => {}
        },
        a: {
          b: {
            c: () => {}
          }
        },
        i: () => {}
      }
    })

    expect(action).toHaveProperty('x.y')
    expect(action.x.y).toBeInstanceOf(Function)
    expect(action.x.y('data')).toEqual({type: `${prefix}/x.y`, payload: 'data'})

    expect(action).toHaveProperty('x.z')
    expect(action.x.z).toBeInstanceOf(Function)
    expect(action.x.z()).toEqual({type: `${prefix}/x.z`})

    expect(action).toHaveProperty('a.b.c')
    expect(action.a.b.c).toBeInstanceOf(Function)
    expect(action.a.b.c('data')).toEqual({type: `${prefix}/a.b.c`, payload: 'data'})
  })

  test('getter', () => {
    const prefix = 'prefix'
    const {getter} = createModel({
      prefix,
      getter: {
        x: {
          next: ({x}) => x + 1,
          cur: ({x}) => x,
          prev: ({x}) => x - 1
        },
        y: ({y}) => y,
        z: {
          add: ({z}, n) => z + n
        }
      },
      action: {}
    })

    expect(getter).toHaveProperty('x.next')
    expect(getter.x.prev).toBeInstanceOf(Function)
    expect(getter.x.prev({[prefix]: {x: 10}})).toEqual(9)

    expect(getter).toHaveProperty('x.cur')
    expect(getter.x.cur).toBeInstanceOf(Function)
    expect(getter.x.cur({[prefix]: {x: 1}})).toEqual(1)

    expect(getter).toHaveProperty('x.prev')
    expect(getter.x.next).toBeInstanceOf(Function)
    expect(getter.x.next({[prefix]: {x: 15}})).toEqual(16)

    expect(getter).toHaveProperty('y')
    expect(getter.y).toBeInstanceOf(Function)
    expect(getter.y({[prefix]: {y: 12}})).toEqual(12)

    expect(getter).toHaveProperty('z.add')
    expect(getter.z.add).toBeInstanceOf(Function)
    expect(getter.z.add({[prefix]: {z: 12}}, 12)).toEqual(24)
  })
})

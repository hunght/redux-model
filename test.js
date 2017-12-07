/* global expect, describe, test */

import reduckless from './main'

describe('reduckless', () => {
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

    const {reduce} = reduckless({prefix, origin, action})

    expect(reduce(null, {type: `${prefix}/test.origin`})).toEqual(origin)
    expect(reduce(null, {type: `${prefix}/test.actionType`})).toEqual('change')
    expect(reduce('prevState', {type: `${prefix}/test.prevState`})).toEqual('prevState+change')
    expect(reduce(null, {type: `${prefix}/test.payload`, payload: 'payload'})).toEqual('origin+payload')
  })

  test('on', () => {
    const prefix = 'prefix'
    const origin = 'origin'
    const action = {
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

    const {on} = reduckless({prefix, origin, action})

    expect(on).toHaveProperty('x.y')
    expect(on.x.y).toBeInstanceOf(Function)
    expect(on.x.y('data')).toEqual({type: `${prefix}/x.y`, payload: 'data'})

    expect(on).toHaveProperty('x.z')
    expect(on.x.z).toBeInstanceOf(Function)
    expect(on.x.z()).toEqual({type: `${prefix}/x.z`})

    expect(on).toHaveProperty('a.b.c')
    expect(on.a.b.c).toBeInstanceOf(Function)
    expect(on.a.b.c('data')).toEqual({type: `${prefix}/a.b.c`, payload: 'data'})
  })

  test('get', () => {
    const prefix = 'prefix'
    const getter = {
      x: {
        next: ({x}) => x + 1,
        cur: ({x}) => x,
        prev: ({x}) => x - 1
      },
      y: ({y}) => y,
      z: {
        add: ({z}, n) => z + n
      }
    }

    const {get} = reduckless({prefix, getter})

    expect(get).toHaveProperty('x.next')
    expect(get.x.prev).toBeInstanceOf(Function)
    expect(get.x.prev({[prefix]: {x: 10}})).toEqual(9)

    expect(get).toHaveProperty('x.cur')
    expect(get.x.cur).toBeInstanceOf(Function)
    expect(get.x.cur({[prefix]: {x: 1}})).toEqual(1)

    expect(get).toHaveProperty('x.prev')
    expect(get.x.next).toBeInstanceOf(Function)
    expect(get.x.next({[prefix]: {x: 15}})).toEqual(16)

    expect(get).toHaveProperty('y')
    expect(get.y).toBeInstanceOf(Function)
    expect(get.y({[prefix]: {y: 12}})).toEqual(12)

    expect(get).toHaveProperty('z.add')
    expect(get.z.add).toBeInstanceOf(Function)
    expect(get.z.add({[prefix]: {z: 12}}, 12)).toEqual(24)
  })
})

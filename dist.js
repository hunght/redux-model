'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = reduckless;

var _objutil = require('@thenewvu/objutil');

function reduckless(_ref) {
  var prefix = _ref.prefix,
      _ref$origin = _ref.origin,
      origin = _ref$origin === undefined ? {} : _ref$origin,
      getter = _ref.getter,
      _ref$action = _ref.action,
      action = _ref$action === undefined ? {} : _ref$action;

  if (typeof prefix !== 'string') throw new Error('Require "prefix" string but got ' + prefix);
  if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) !== 'object') throw new Error('Require "action" object but got ' + action);

  var reduce = function reduce(state, _ref2) {
    var type = _ref2.type,
        payload = _ref2.payload;

    state = state || origin;

    var _type$split = type.split('/'),
        _type$split2 = _slicedToArray(_type$split, 2),
        handlePrefix = _type$split2[0],
        handlePath = _type$split2[1];

    if (handlePrefix === prefix) {
      var h = (0, _objutil.obtain)(action, handlePath);
      if (typeof h === 'function') {
        return h(state, payload);
      }
    }

    return state;
  };

  var on = {};
  (0, _objutil.walk)(action, function (node, path) {
    if (typeof node === 'function') {
      (0, _objutil.inset)(on, path, function (payload) {
        return { type: prefix + '/' + path, payload: payload };
      });
    } else if (!(0, _objutil.obtain)(on, path)) {
      (0, _objutil.inset)(on, path, {});
    }
  });

  var get = {};
  (0, _objutil.walk)(getter, function (node, path) {
    if (typeof node === 'function') {
      (0, _objutil.inset)(get, path, function (state) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return node.apply(undefined, [state[prefix]].concat(args));
      });
    } else if (!(0, _objutil.obtain)(get, path)) {
      (0, _objutil.inset)(get, path, {});
    }
  });

  return { reduce: reduce, get: get, on: on };
}

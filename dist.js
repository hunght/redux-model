'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = exports.modelize = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _objutil = require('@thenewvu/objutil');

var _reactRedux = require('react-redux');

var modelize = exports.modelize = function modelize(model) {
  if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') throw new Error('Require "model" object but got ' + model);
  if (typeof model.prefix !== 'string') throw new Error('Require "prefix" string but got ' + model.prefix);
  if (_typeof(model.action) !== 'object') throw new Error('Require "action" object but got ' + model.action);

  var reduce = function reduce(state, _ref) {
    var type = _ref.type,
        payload = _ref.payload;

    state = state || model.origin;

    var _type$split = type.split('/'),
        _type$split2 = _slicedToArray(_type$split, 2),
        handlePrefix = _type$split2[0],
        handlePath = _type$split2[1];

    if (handlePrefix === model.prefix) {
      var h = (0, _objutil.get)(model.action, handlePath);
      if (typeof h === 'function') {
        return h(state, payload);
      }
    }

    return state;
  };

  var action = {};
  (0, _objutil.walk)(model.action, function (node, path) {
    if (typeof node === 'function') {
      (0, _objutil.inset)(action, path, function (payload) {
        return { type: model.prefix + '/' + path, payload: payload };
      });
    } else if (!(0, _objutil.get)(action, path)) {
      (0, _objutil.inset)(action, path, {});
    }
  });

  var getter = {};
  (0, _objutil.walk)(model.getter, function (node, path) {
    if (typeof node === 'function') {
      (0, _objutil.inset)(getter, path, function (state) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return node.apply(undefined, [state[model.prefix]].concat(args));
      });
    } else if (!(0, _objutil.get)(getter, path)) {
      (0, _objutil.inset)(getter, path, {});
    }
  });

  return { reduce: reduce, getter: getter, action: action };
};

var connect = exports.connect = function connect(mapGetter, mapAction, Component) {
  return function (getter, action) {
    if ((typeof getter === 'undefined' ? 'undefined' : _typeof(getter)) !== 'object') throw new Error('Require "getter" object but got ' + getter);
    if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) !== 'object') throw new Error('Require "action" object but got ' + action);
    return (0, _reactRedux.connect)(mapGetter(getter), mapAction(action))(Component);
  };
};

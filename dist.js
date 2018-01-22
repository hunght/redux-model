'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModelProvider = exports.combineModels = exports.createModelView = exports.createModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _redux = require('redux');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var walk = function walk(obj, fn) {
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (!obj) return;

  Object.keys(obj).forEach(function (key) {
    var nextNode = obj[key];
    var nextPath = path ? path + '.' + key : key;
    fn(nextNode, nextPath);
    walk(nextNode, fn, nextPath);
  });
};

var get = function get(obj, at) {
  if (!obj) return undefined;
  if (!at) return obj;

  var firstDot = at.indexOf('.');
  if (firstDot === -1) return obj[at];

  var firstKey = at.slice(0, firstDot);
  var restPath = at.slice(firstDot + 1);
  return get(obj[firstKey], restPath);
};

var set = function set(obj, at, val) {
  if (!obj || !at) return;

  var firstDot = at.indexOf('.');
  if (firstDot === -1) {
    obj[at] = val;
  } else {
    var firstKey = at.slice(0, firstDot);
    var restPath = at.slice(firstDot + 1);
    set(obj[firstKey], restPath, val);
  }

  return obj;
};

var createModel = exports.createModel = function createModel(model) {
  if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') {
    throw new Error('Require "model" object but got ' + model);
  }
  if (typeof model.prefix !== 'string') {
    throw new Error('Require "prefix" string but got ' + model.prefix);
  }
  if (_typeof(model.action) !== 'object') {
    throw new Error('Require "action" object but got ' + model.action);
  }

  var reduce = function reduce(state, _ref) {
    var type = _ref.type,
        payload = _ref.payload;

    state = state || model.origin;

    var _type$split = type.split('/'),
        _type$split2 = _slicedToArray(_type$split, 2),
        handlePrefix = _type$split2[0],
        handlePath = _type$split2[1];

    if (handlePrefix === model.prefix) {
      var h = get(model.action, handlePath);
      if (typeof h === 'function') {
        return h(state, payload);
      }
    }

    return state;
  };

  var action = {};
  walk(model.action, function (node, path) {
    if (typeof node === 'function') {
      set(action, path, function (payload) {
        return {
          type: model.prefix + '/' + path,
          payload: payload
        };
      });
    } else if (!get(action, path)) {
      set(action, path, {});
    }
  });

  var getter = {};
  walk(model.getter, function (node, path) {
    if (typeof node === 'function') {
      set(getter, path, function (state) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return node.apply(undefined, [state[model.prefix]].concat(args));
      });
    } else if (!get(getter, path)) {
      set(getter, path, {});
    }
  });

  return { prefix: model.prefix, reduce: reduce, getter: getter, action: action };
};

var createModelView = exports.createModelView = function createModelView(mapGetter, mapAction) {
  return function (view) {
    var _class, _temp2;

    return _temp2 = _class = function (_Component) {
      _inherits(ModelView, _Component);

      function ModelView() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, ModelView);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = ModelView.__proto__ || Object.getPrototypeOf(ModelView)).call.apply(_ref2, [this].concat(args))), _this), _this.ConnectedView = (0, _reactRedux.connect)(mapGetter && mapGetter(_this.context.getter), mapAction && mapAction(_this.context.action))(view), _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(ModelView, [{
        key: 'render',
        value: function render() {
          var ConnectedView = this.ConnectedView;
          return _react2.default.createElement(ConnectedView, this.props);
        }
      }]);

      return ModelView;
    }(_react.Component), _class.contextTypes = {
      getter: _propTypes2.default.object.isRequired,
      action: _propTypes2.default.object.isRequired
    }, _temp2;
  };
};

var combineModels = exports.combineModels = function combineModels(models) {
  var combined = { getter: {}, action: {}, reduce: {} };
  Object.keys(models).forEach(function (id) {
    var _models$id = models[id],
        prefix = _models$id.prefix,
        getter = _models$id.getter,
        action = _models$id.action,
        reduce = _models$id.reduce;

    combined.getter[prefix] = getter;
    combined.action[prefix] = action;
    combined.reduce[prefix] = reduce;
  });
  combined.reduce = (0, _redux.combineReducers)(combined.reduce);
  return combined;
};

var ModelProvider = exports.ModelProvider = function (_Component2) {
  _inherits(ModelProvider, _Component2);

  function ModelProvider() {
    _classCallCheck(this, ModelProvider);

    return _possibleConstructorReturn(this, (ModelProvider.__proto__ || Object.getPrototypeOf(ModelProvider)).apply(this, arguments));
  }

  _createClass(ModelProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        getter: this.props.getter,
        action: this.props.action
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);

  return ModelProvider;
}(_react.Component);

ModelProvider.childContextTypes = {
  getter: _propTypes2.default.object.isRequired,
  action: _propTypes2.default.object.isRequired
};

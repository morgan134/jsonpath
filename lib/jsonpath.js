var JsonPath =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var JsonPath = function () {
	  function JsonPath(obj, expr, arg) {
	    _classCallCheck(this, JsonPath);
	
	    this.resultType = arg && arg.resultType || 'VALUE';
	    this.result = [];
	    this.obj = obj;
	    if (expr && obj && (this.resultType === 'VALUE' || this.resultType === 'PATH')) {
	      this.trace(this.normalize(expr).replace(/^\$;?/, ''), obj, '$');
	      // return this.result.length ? this.result : false;
	    }
	    // return false;
	  }
	
	  _createClass(JsonPath, [{
	    key: 'normalize',
	    value: function normalize(expr) {
	      var subx = [];
	      return expr.replace(/[\['](\??\(.*?\))[\]']|\['(.*?)'\]/g, function ($0, $1, $2) {
	        return '[#' + (subx.push($1 || $2) - 1) + '\']';
	      }).replace(/'?\.'?|\['?/g, ';').replace(/;;;|;;/g, ';..;').replace(/;$|'?\]|'$/g, '').replace(/#([0-9]+)/g, function ($0, $1) {
	        return subx[$1];
	      });
	    }
	  }, {
	    key: 'asPath',
	    value: function asPath(path) {
	      var x = path.split(';');
	      var p = '$';
	      for (var i = 1, n = x.length; i < n; i++) {
	        p += /^[0-9*]+$/.test(x[i]) ? '[' + x[i] + ']' : '[\'' + x[i] + '\']';
	      }
	      return p;
	    }
	  }, {
	    key: 'store',
	    value: function store(p, v) {
	      if (p) this.result[this.result.length] = this.resultType === 'PATH' ? this.asPath(p) : v;
	      return !!p;
	    }
	  }, {
	    key: 'trace',
	    value: function trace(expr, val, path) {
	      var _this = this;
	
	      if (expr !== '') {
	        (function () {
	          var x = expr.split(';');
	          var loc = x.shift();
	          x = x.join(';');
	          if (loc === '..') {
	            _this.trace(x, val, path);
	            _this.walk(loc, x, val, path, function (m, l, x2, v, p) {
	              if (_typeof(v[m]) === 'object') {
	                _this.trace('..;' + x2, v[m], p + ';' + m);
	              }
	            });
	          } else if (val && val.hasOwnProperty(loc)) {
	            _this.trace(x, val[loc], path + ';' + loc);
	          } else if (loc === '*') {
	            _this.walk(loc, x, val, path, function (m, l, x2, v, p) {
	              _this.trace(m + ';' + x2, v, p);
	            });
	          } else if (/^\(.*?\)$/.test(loc)) {
	            // [(expr)]
	            _this.trace(_this.processEval(loc, val) + ';' + x, val, path);
	          } else if (/^\?\(.*?\)$/.test(loc)) {
	            // [?(expr)]
	            _this.walk(loc, x, val, path, function (m, l, x2, v, p) {
	              if (_this.processEval(l.replace(/^\?\((.*?)\)$/, '$1'), _this.isArray(v) ? v[m] : v)) {
	                _this.trace(m + ';' + x, v, p);
	              }
	            }); // issue 5 resolved
	          } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) {
	              // [start:end:step]  phyton slice syntax
	              _this.slice(loc, x, val, path);
	            } else if (/,/.test(loc)) {
	              // [name1,name2,...]
	              var s = loc.split(/'?,'?/);
	              var n = s.length;
	              for (var i = 0; i < n; i++) {
	                _this.trace(s[i] + ';' + x, val, path);
	              }
	            }
	        })();
	      } else {
	        this.store(path, val);
	      }
	    }
	
	    // walk(loc, expr, val, path, f)
	
	  }, {
	    key: 'walk',
	    value: function walk() {
	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }
	
	      if (this.isArray(args[2])) {
	        var n = args[2].length;
	        for (var i = n; i >= 0; i--) {
	          if (i in args[2]) {
	            args[4](i, args[0], args[1], args[2], args[3]);
	          }
	        }
	      } else if (_typeof(args[2]) === 'object') {
	        var arr = Object.keys(args[2]);
	        var _i = arr.length;
	        while (_i--) {
	          if (args[2].hasOwnProperty(arr[_i])) args[4](arr[_i], args[0], args[1], args[2], args[3]);
	        }
	      }
	    }
	  }, {
	    key: 'slice',
	    value: function slice(loc, expr, val, path) {
	      var _this2 = this;
	
	      if (this.isArray(val)) {
	        (function () {
	          var len = val.length;
	          var start = 0;
	          var end = len;
	          var step = 1;
	          loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function ($0, $1, $2, $3) {
	            start = parseInt($1 || start, 10);
	            end = parseInt($2 || end, 10);
	            step = parseInt($3 || step, 10);
	          });
	          start = start < 0 ? Math.max(0, start + len) : Math.min(len, start);
	          end = end < 0 ? Math.max(0, end + len) : Math.min(len, end);
	          for (var i = start; i < end; i += step) {
	            _this2.trace(i + ';' + expr, val, path);
	          }
	        })();
	      }
	    }
	  }, {
	    key: 'processEval',
	    value: function processEval(x, _v) {
	      try {
	        return this.obj && _v && this.eval(x.replace(/(^|[^\\])@/g, '$1_v').replace(/\\@/g, '@'));
	      } catch (e) {
	        var x2 = x.replace(/(^|[^\\])@/g, '$1_v').replace(/\\@/g, '@');
	        throw new SyntaxError('jsonPath: ' + e.message + ': ' + x2);
	      }
	    }
	  }, {
	    key: 'isArray',
	    value: function isArray(o) {
	      return Object.prototype.toString.call(o) === '[object Array]';
	    }
	  }, {
	    key: 'eval',
	    value: function _eval() {}
	  }], [{
	    key: 'getValue',
	    value: function getValue(obj, exp) {
	      return new JsonPath(obj, exp, 'VALUE').result;
	    }
	  }, {
	    key: 'getPath',
	    value: function getPath(obj, exp) {
	      return new JsonPath(obj, exp, 'PATH').result;
	    }
	  }]);
	
	  return JsonPath;
	}();
	
	exports.default = JsonPath;
	module.exports = exports['default'];

/***/ }
/******/ ]);
//# sourceMappingURL=JsonPath.js.map
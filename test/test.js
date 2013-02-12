/*global browser, browserDetection, document, escape, navigator, window*/
(function () {
	'use strict';

	var emptyObject, globalObject, testResults, util;

	util = {
		defined: function defined(what) {
			if (typeof what === 'undefined') {
				return false;
			}

			return true;
		},

		escapePrefix: [ "\\u0000", "\\u000", "\\u00", "\\u0", "\\u" ],

		getGlobalObject: function getGlobalObject() {
			var fn;

			fn = function () {
				return this;
			};
			return fn.call(null);
		},

		getUserAgent: function getUserAgent() {
			if (!util.defined(navigator)) {
				return 'navigator is not defined';
			}

			if (!util.defined(navigator.userAgent)) {
				return 'navigator.userAgent is not defined';
			}

			return navigator.userAgent;
		},

		indentation: function indentation(num) {
			var out = '\n';

			while (num) {
				num -= 1;
				out += '\t';
			}

			return out;
		},

		isArray: function isArray(target) {
			if (Array.isArray) {
				return Array.isArray(target);
			}

			if (typeof target !== 'object') {
				return false;
			}

			if (Object.prototype.toString.call(target) === '[object Array]') {
				return true;
			}

			return false;
		},

		isNativeFunction: function isNativeFunction(target) {
			if (typeof target !== 'function') {
				return false;
			}

			/*jslint regexp:true*/
			if (!target.toString().match(/^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/)) {
				return false;
			}
			/*jslint regexp:false*/

			return true;
		},

		isRegExp: function isRegExp(target) {
			if (typeof target !== 'object') {
				return false;
			}

			if (Object.prototype.toString.call(target) === '[object RegExp]') {
				return true;
			}

			return false;
		},

		logMessage: function logMessage(message) {
			var htmlSafe;

			htmlSafe = message;
			htmlSafe = htmlSafe.replace(/&/g, '&amp;');
			htmlSafe = htmlSafe.replace(/</g, '&lt;');
			htmlSafe = htmlSafe.replace(/>/g, '&gt;');
			/*jslint evil:true*/
			document.write(htmlSafe + "\n");
			/*jslint evil:false*/
		},

		performTest: function performTest(name, result, depth) {
			var resultString;

			try {
				resultString = util.stringify(result, depth);
				util.logMessage(name + ': ' + resultString);
			} catch (e) {
				resultString = 'Exception:' + util.stringify(e.toString());
				util.logMessage(name + ': ' + resultString);
			}

			util.sendResults(name, resultString);
		},

		randomNumber: Math.random(),

		sendResults: function sendResults(name, results) {
			var n, bit, size;

			n = 0;
			size = 1024;

			function sendChunk(chunk) {
				/*jslint evil:true*/
				document.write('<img width="1" height="1" src="postback.php?name=' + name + '&r=' + util.randomNumber + '&n=' + n + '&c=' + escape(chunk) + '">');
				/*jslint evil:false*/
				n += 1;
			}

			while (results.length > size) {
				bit = results.substr(0, size);
				results = results.substr(size, results.length - size);
				sendChunk(bit);
			}

			sendChunk(results);
		},

		stringify: function stringify(target, allowedDepth) {
			var type;

			type = typeof target;

			if (type === 'string') {
				return util.stringifyString(target);
			}

			if (type === 'number') {
				return util.stringifyNumber(target);
			}

			if (type === 'function') {
				return util.stringifyFunction(target);
			}

			if (type === 'boolean') {
				return util.stringifyBoolean(target);
			}

			if (type === 'undefined') {
				return util.stringifyUndefined(target);
			}

			if (util.isArray(target)) {
				return util.stringifyArray(target, allowedDepth);
			}

			if (util.isRegExp(target)) {
				return util.stringifyRegExp(target);
			}

			if (target === null) {
				return util.stringifyNull(target);
			}

			if (target instanceof Date) {
				return util.stringifyDate(target);
			}

			if (type === 'object') {
				return util.stringifyObject(target, allowedDepth);
			}

			return '(unhandled type: ' + type + ')';
		},

		stringifyArray: function stringifyArray(target, allowedDepth) {
			var i, l, result;

			if (!allowedDepth) {
				return '[...]';
			}

			allowedDepth -= 1;
			result = '[';

			for (i = 0, l = target.length; i < l; i += 1) {
				if (i > 0) {
					result += ',';
				}

				result += util.stringify(target[i], allowedDepth);
			}

			result += ']';
			return result;
		},

		stringifyBoolean: function stringifyBoolean(target) {
			if (target) {
				return 'true';
			}

			return 'false';
		},

		stringifyDate: function stringifyDate(target) {
			var result;
			result = 'new Date(' + util.stringify(target.toString()) + ')';
			return result;
		},

		stringifyFunction: function stringifyFunction(target) {
			var result;

			result = target.toString();

			if (result === '[object Function]') {
				return 'function object ' + util.stringify(target.name);
			}

			result = result.replace(/[ \t\r\n]*$/, '');
			result = result.replace(/^[ \t\r\n]*/, '');
			result = result.replace(/[{}\[\]]/g, ' ');
			result = result.replace(/[\r\n\t ]+/g, ' ');
			result = result.split(' ');
			return result[0] + " " + util.stringify(result[1]) + " " + util.stringify(target.name);
		},

		stringifyNull: function stringifyNull(target) {
			return 'null';
		},

		stringifyNumber: function stringifyNumber(target) {
			if (util.defined(isNaN) && isNaN(target)) {
				return 'NaN';
			}

			return target.toString();
		},

		stringifyObject: function stringifyObject(target, allowedDepth) {
			var i, prop, propertyCount, propertiesFound, testSpecial, result;

			function addProp(name, valString) {
				if (propertyCount > 0) {
					result += ',';
				}

				result += util.stringify(name) + ':' + valString;
				propertyCount += 1;
			}

			function exportProperty(name) {
				var logName;

				logName = name;
				try {
					if (!util.defined(target[name])) {
						return;
					}
				} catch (e) {
					addProp(name, 'Exception:' + util.stringify(e.message));
					return;
				}

				try {
					if (!Object.prototype.hasOwnProperty(target, name)) {
						logName += '(proto)';
					}
				} catch (ex) {
					addProp(name, 'Exception:' + util.stringify(ex.message));
				}

				addProp(logName, util.stringify(target[name], allowedDepth));
			}

			if (!allowedDepth) {
				return '{...}';
			}

			result = '{';
			allowedDepth -= 1;
			propertiesFound = {};
			propertyCount = 0;

			/*jslint forin:true*/
			for (prop in target) {
				propertiesFound[prop] = true;
				exportProperty(prop);
			}
			/*jslint forin:false*/

			// Test these properties separately
			// Also double-check anything used in testing
			testSpecial = [
				'all',
				'atob',
				'Attr',
				'compatMode',
				'constructor',
				'cpuClass',
				'geolocation',
				'hasOwnProperty',
				'isPrototypeOf',
				'product',
				'propertyIsEnumerable',
				'querySelector',
				'toLocaleString',
				'toString',
				'valueOf',
				'XMLHttpRequest'
			];

			for (i = 0; i < testSpecial.length; i += 1) {
				if (!util.defined(propertiesFound[testSpecial[i]])) {
					exportProperty(testSpecial[i]);
				}
			}

			result += '}';

			return result;
		},

		stringifyRegExp: function stringifyRegExp(target) {
			return target.toString();
		},

		stringifyString: function stringifyString(target) {
			var quoted;
			quoted = target;
			quoted = quoted.replace(/([\"'])/g, "\\$1");
			quoted = quoted.replace(/\n/g, "\\n");
			quoted = quoted.replace(/\0/g, "\\0");
			quoted = quoted.replace(/\t/g, "\\t");

			// Now the rest
			try {
				quoted = quoted.replace(/[\x00-\x1F\x7F-\xFF\u0100-\uFFFF]/g, function (c) {
					var i = c.charCodeAt(0).toString(16);
					return util.escapePrefix[i.length] + i;
				});
			} catch (e) {
				// Ignore error - simply have less clean strings
			}

			return '"' + quoted + '"';
		},

		stringifyUndefined: function stringifyUndefined(name, target) {
			return 'undefined';
		}
	};


	util.logMessage('Starting test');

	if (util.defined(navigator)) {
		if (util.defined(navigator.userAgent)) {
			util.logMessage(navigator.userAgent);
		} else {
			util.logMessage('navigator.userAgent is not defined');
		}
	} else {
		util.logMessage('navigator is not defined');
	}


	globalObject = util.getGlobalObject();
	emptyObject = {};
	testResults = browserDetection();
	testResults['globalObject is window'] = globalObject === window;
	testResults['globalObject is document'] = globalObject === document;
	testResults['window is document'] = window === document;
	testResults.userAgent = util.getUserAgent();

	util.performTest('testResults', testResults, 1);
	util.performTest('globalObject', globalObject, 1);
	util.performTest('baseObject', emptyObject, 1);
	util.performTest('navigator', navigator, 1);
	util.performTest('document', document, 1);
	util.performTest('window', window, 1);
}());

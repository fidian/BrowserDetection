/*global $, browserDetection, browserFiles, ich, sorttable*/
$(function () {
	'use strict';

	var browserStats, previousObject;

	browserStats = [];
	previousObject = {};

	function template(id, data) {
		if (typeof data === 'undefined') {
			data = {};
		}

		return ich[id](data, true);
	}

	function jQueryDetect(ua) {
		var match;

		if (ua === undefined) {
			return 'undefined';
		}

		if (typeof ua !== 'string') {
			return typeof ua;
		}

		ua = ua.toLowerCase();
		/*jslint regexp:true*/
		match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
		    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
			/(msie) ([\w.]+)/.exec(ua) ||
			(ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
			[];
		/*jslint regexp:false*/

		return (match[1] || "unknown") + " " + (match[2] || "0");
	}

	function same(a, b) {
		if (typeof a !== typeof b) {
			return false;
		}

		if (a === null || a === undefined) {
			return !b;
		}

		if (Array.isArray(a)) {
			return Array.isArray(b);
		}

		if (typeof a === 'object') {
			return true;  // Shallow
		}

		return a === b;
	}

	function makeDifferences(a, b) {
		var i, result;

		if (typeof a !== typeof b) {
			return "different types";
		}

		result = {};

		if (Array.isArray(a)) {
			for (i = 0; i < a.length || i < b.length; i += 1) {
				if (!same(a[i], b[i])) {
					if (a[i] === undefined) {
						result[i] = 'added';
					} else if (b[i] === undefined) {
						result[i] = 'removed';
					} else {
						result[i] = 'changed';
					}
				}
			}
		} else if (typeof a === 'object') {
			Object.keys(a).forEach(function (key) {
				if (!same(a[key], b[key])) {
					if (b[key] === undefined) {
						result[key] = 'removed';
					} else {
						result[key] = 'changed';
					}
				}
			});
			Object.keys(b).forEach(function (key) {
				if (typeof a[key] === 'undefined') {
					result[key] = 'added';
				}
			});
		}

		return result;
	}

	function filesLoaded() {
		$('body').empty().append(template('grid', {
			browsers: browserStats
		}));

		$('.sortable').each(function () {
			sorttable.makeSortable(this);
		});

		$('.jQueryTest').each(function () {
			var $elem, id, result;

			$elem = $(this);
			id = $elem.data('id');
			result = jQueryDetect(browserStats[id].navigator.userAgent);
			browserStats[id].jQuery = result;
			$elem.text(result);
		});

		$('.autoTest').each(function () {
			var $elem, id, result;

			$elem = $(this);
			id = $elem.data('id');
			result = browserDetection(browserStats[id].navigator, browserStats[id].document, browserStats[id].window);
			browserStats[id].browserDetection = result;
			$elem.text(result.engine + " " + result.version);
		});

		$('.showOff').click(function (e) {
			var browser, differences, $elem, id, property, toShow;
			e.preventDefault();
			$elem = $(this);
			id = $elem.data('id');
			browser = browserStats[id];
			property = $elem.data('property');

			if (property) {
				toShow = browser[property];
			} else {
				toShow = $elem.data('value');
			}

			differences = makeDifferences(previousObject, toShow);
			console.log(toShow, differences);
			previousObject = toShow;
		});

		$('#evalGo').click(function (e) {
			var js, fn;

			e.preventDefault();
			js = $('#evalMe').val();
			/*jslint evil:true*/
			eval('fn = function() {' +
				'var document = this.document, navigator = this.navigator, baseObject = this.baseObject, globalObject = this.globalObject, testResults = this.testResults, window = this.window;' +
				js + '}');
			/*jslint evil:false*/

			$('.browserResult').each(function () {
				var $elem, id, result;

				$elem = $(this);
				id = $elem.data('id');
				result = fn.call(browserStats[id]);
				$elem.text(result);
			});
		});
	}

	function Cleaner() {
	}

	Cleaner.prototype.clean = function (input) {
		var i, cleanerDef;

		if (typeof input === 'undefined') {
			throw new Error('Did not get a string passed to clean()');
		}

		this.input = input;

		for (i = 0; i < this.cleaners.length; i += 1) {
			cleanerDef = this.cleaners[i];

			if (cleanerDef.match.call(this)) {
				return cleanerDef.process.call(this);
			}
		}

		throw new Error('Unable to clean data: ' + this.input);
	};

	Cleaner.prototype.advance = function (chars) {
		this.input = this.input.substr(chars, this.input.length);
	};

	Cleaner.prototype.cleanAgain = function () {
		var cleaner, result;

		cleaner = new Cleaner();
		result = cleaner.clean(this.input);
		this.input = cleaner.input;
		return result;
	};

	Cleaner.prototype.cleaners = [
		{
			name: 'string',
			match: function () {
				return this.input.charAt(0) === '"';
			},
			process: function () {
				var s = '', c;

				this.advance(1);
				c = this.input.charAt(0);

				while (this.input.length && c !== '"') {
					if (c === '\\') {
						s += c;
						this.advance(1);
						c = this.input.charAt(0);
					}

					s += c;
					this.advance(1);
					c = this.input.charAt(0);
				}

				this.advance(1);
				return s;
			}
		},
		{
			name: 'number',
			match: function () {
				return this.input.match(/^([\-.0-9e]|NaN)/);
			},
			process: function () {
				var n = "";

				if (this.input.match(/^NaN/)) {
					this.advance(3);
					return NaN;
				}

				while (this.input.match(/^[\-.0-9e]/)) {
					n += this.input.charAt(0);
					this.advance(1);
				}

				return parseFloat(n);
			}
		},
		{
			name: 'function',
			match: function () {
				return this.input.match(/^function /);
			},
			process: function () {
				var name, result, Result, signature;

				if (this.input.match(/^function object /)) {
					this.advance(16);
					name = this.cleanAgain();

					if (name === "") {
						name = "FunctionObject";
					}

					/*jslint evil:true*/
					eval('Result = function ' + name + '(){}');
					/*jslint evil:false*/
					return new Result();
				}

				this.advance(9);  // "function "
				signature = this.cleanAgain();
				signature = signature.split('(')[0] + '()';
				this.advance(1);  // " "
				name = this.cleanAgain();

				/*jslint evil:true*/
				eval('result = function ' + signature + '{}');
				/*jslint evil:false*/
				result.name = name;
				return result;
			}
		},
		{
			name: 'boolean',
			match: function () {
				return this.input.match(/^(true|false)/);
			},
			process: function () {
				if (this.input.match(/^true/)) {
					this.advance(4);
					return true;
				}

				this.advance(5);
				return false;
			}
		},
		{
			name: 'undefined',
			match: function () {
				return this.input.match(/^undefined/);
			},
			process: function () {
				this.advance(9);
				return undefined;
			}
		},
		{
			name: 'undefinedObject',
			match: function () {
				return this.input.match(/^ "object" undefined/);
			},
			process: function () {
				this.advance(19);
				return undefined;
			}
		},
		{
			name: 'array',
			match: function () {
				return this.input.charAt(0) === '[';
			},
			process: function () {
				var result, cleaner;

				result = [];

				if (this.input.match(/^\[\.\.\.\]/)) {
					return [undefined, undefined, undefined];
				}

				this.advance(1);

				while (this.input.length && this.input.charAt(0) !== ']') {
					result.push(this.cleanAgain());

					if (this.input.charAt(0) === ',') {
						this.advance(1);
					}
				}

				this.advance(1);
				return result;
			}
		},
		{
			name: 'regexp',
			match: function () {
				return this.input.charAt(0) === '/';
			},
			process: function () {
				var s = '', c;

				this.advance(1);
				c = this.input.charAt(0);

				while (this.input.length && c !== '/') {
					if (c === '\\') {
						s += c;
						this.advance(1);
						c = this.input.charAt(0);
					}

					s += c;
					this.advance(1);
					c = this.input.charAt(0);
				}

				this.advance(1);
				return new RegExp(s);
			}
		},
		{
			name: 'null',
			match: function () {
				return this.input.match(/^null/);
			},
			process: function () {
				this.advance(4);
				return null;
			}
		},
		{
			name: 'date',
			match: function () {
				return this.input.match(/^new Date\(/);
			},
			process: function () {
				var d;

				this.advance(9);  // "new Date("
				d = this.cleanAgain();
				this.advance(1);  // )
				return new Date(d);
			}
		},
		{
			name: 'exception',
			match: function () {
				return this.input.match(/^Exception:/);
			},
			process: function () {
				var message;
				this.advance(10);
				message = this.cleanAgain();
				return new Error(message);
			}
		},
		{
			name: 'object',
			match: function () {
				return this.input.charAt(0) === '{';
			},
			process: function () {
				var result, propName, protoAlso;

				if (this.input.substr(0, 5) === '{...}') {
					this.advance(5);
					return { undefined: undefined };
				}

				result = {};
				result.prototype = {};
				this.advance(1);

				while (this.input.length && this.input.charAt(0) !== '}') {
					propName = this.cleanAgain();
					protoAlso = false;

					if (propName.substr(propName.length - 7, propName.length) === '(proto)') {
						propName = propName.substr(0, propName.length - 7);
						protoAlso = true;
					}

					this.advance(1);  // :
					result[propName] = this.cleanAgain();

					if (protoAlso) {
						result.prototype[propName] = result[propName];
					}

					if (this.input.charAt(0) === ',') {
						this.advance(1);
					}
				}

				this.advance(1);
				return result;
			}
		},
		{
			name: 'unknownObject',
			match: function () {
				return this.input.match(/^ "object" ""/);
			},
			process: function () {
				this.advance(12);
				return {};
			}
		},
	];

	function addBrowserStats(filename, data) {
		var cleansed, cleaner;

		cleansed = {};
		cleaner = new Cleaner();
		cleansed.id = browserStats.length;
		cleansed.name = data.name;
		cleansed.os = data.os;
		cleansed.filename = filename;
		cleansed.baseObject = cleaner.clean(data.baseObject);
		cleansed.document = cleaner.clean(data.document);
		cleansed.globalObject = cleaner.clean(data.globalObject);
		cleansed.navigator = cleaner.clean(data.navigator);
		cleansed.testResults = cleaner.clean(data.testResults);
		cleansed.window = cleaner.clean(data.window || "undefined");
		browserStats[cleansed.id] = cleansed;
	}

	function loadFiles(filesArray, index) {
		if (typeof index === 'undefined') {
			index = 0;
		}

		if (index >= filesArray.length) {
			filesLoaded();
			return;
		}

		$('body').empty().append(template('loading', {
			index: index + 1,
			file: filesArray[index].filename,
			total: filesArray.length
		}));

		setTimeout(function () {
			var chunk;
			chunk = filesArray[index];
			addBrowserStats(chunk.filename, chunk.data);
			loadFiles(filesArray, index + 1);
		});
	}

	loadFiles(browserFiles);
});

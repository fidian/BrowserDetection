/**
 * Browser and Rendering Engine Detection based on Feature Detection
 *
 * Detects your current browser and rendering engine.  Does not ever use
 * the user agent to determine information.  When possible, this will also
 * determine the versions of everything too.
 */
/*global document, navigator, window*/
function browserDetection(nav, doc, wind) {
	'use strict';

	var result;

	result = {
		browser: 'unknown',
		browserVersion: 'unknown',
		engine: 'unknown',
		engineVersion: 'unknown'
	};

	function def(n) {
		return typeof n !== 'undefined';
	}

	// Use the global variables if nothing is passed in
	if (!def(nav)) {
		nav = navigator;
	}

	if (!def(doc)) {
		doc = document;
	}

	if (!def(wind)) {
		wind = window;
	}

	function gecko(result) {
		// Need to do browser detection for Firefox, Netscape, SeaMonkey, etc.
		result.engine = 'gecko';
	}

	function khtml(result) {
		result.browser = 'konqueror';
		result.engine = 'khtml';
	}

	function presto(result) {
		result.browser = 'opera';
		result.engine = 'presto';
	}

	function trident(result) {
		// The browser should change when using a derivative like Lunascape
		result.browser = 'msie';
		result.engine = 'trident';

		if (def(nav.geolocation)) {
			result.browserVersion = 10;
			result.engineVersion = 6;
			return;
		}

		if (def(nav.msDoNotTrack)) {
			result.browserVersion = 9;
			result.engineVersion = 5;
			return;
		}

		if (def(wind.onmessage)) {
			result.browserVersion = 8;
			result.engineVersion = 4;

			if (document.documentMode === 7) {
				// IE8 in compatibility mode
				result.browserVersion = 7;
			}

			return;
		}

		if (def(wind.XMLHttpRequest)) {
			result.browserVersion = 7;
			// IE mobile v7 uses Trident engine 3.1
			// Normal browser has no Trident version
			return;
		}

		if (def(doc.compatMode)) {
			result.browserVersion = 6;
			// Both the mobile and normal browsers have no Trident version
			return;
		}

		// At this point I might just be guessing, but I don't have access
		// to older versions of IE
		result.browserVersion = 5.5;
		// Both the mobile and normal browsers have no Trident version
	}

	function webkit(result) {
		// Need to do browser detection for Safari, Chrome, etc.
		result.engine = 'webkit';
	}

	if (def(nav.cpuClass)) {
		// Only in MSIE and Konqueror
		if (def(nav.product)) {
			// KHTML (Konqueror)
			//     typeof navigator.cpuClass !== 'undefined'
			//     typeof navigator.product !== 'undefined'
			khtml(result);
		} else {
			// Trident (MSIE)
			//     typeof navigator.cpuClass !== 'undefined'
			//     typeof navigator.product === 'undefined'
			trident(result);
		}
	} else if (!def(nav.product)) {
		// Presto (opera)
		//     typeof navigator.cpuClass === 'undefined'
		//     typeof navigator.product === 'undefined'
		presto(result);
	} else if (def(wind.Attr)) {
		// Not too sure about this test
		// Webkit (Safari, Chrome)
		//     typeof navigator.cpuClass === 'undefined'
		//     typeof window.Attr !== 'undefined'
		webkit(result);
	} else {
		// Gecko (Firefox, Netscape)
		//     typeof navigator.cpuClass === 'undefined'
		//     typeof window.Attr === 'undefined'
		gecko(result);
	}

	return result;
}

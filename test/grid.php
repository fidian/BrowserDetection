<html><head><title>Browser Detection Testing Grid</title>
<style type="text/css">

.hover {
	border: 1px solid black;
}

.hover:hover {
	background-color: yellow;
}

thead th, tfoot th {
	background-color: #DDD;
}

</style>
<script>
url = '://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js';

if (window.location.protocol == 'https:') {
	url = 'https' + url;
} else {
	url = 'http' + url;
}

document.write('<script src="' + url + '"></scr' + 'ipt>');

browserFiles = [
<?php

$start = true;
$dataFiles = glob('data/*.js');

foreach ($dataFiles as $fn) {
	if ($start === false) {
		echo ",\n";
	}

	$start = false;
	echo '{"filename":' . json_encode($fn) . ',"data":';
	echo file_get_contents($fn);
	echo '}';
}

?>
];
</script>
<script src="sorttable.js"></script>
<script src="mustache.js"></script>
<script src="ICanHaz-no-mustache.min.js"></script>
<script src="grid.js"></script>
<script src="browserDetection.js"></script>
</head><body>
Loading ...

<script type="text/html" id="loading">
Loading file {{index}} of {{total}}<br>
{{file}}
</script>

<script type="text/html" id="grid">
<textarea rows=20 style="width: 100%" id="evalMe">// jQuery's browser detection
// You have the following variables in the "this" object
//     jQuery - jQuery results
//     browserDetection - This library's results
//     baseObject, document, globalObject, navigator, window - The object from the browser
//     testResults - Some test results and the browser detection code running for that browser
//     name, os - Information about the test
var browser, match, ua, version;
ua = navigator.userAgent;

if (ua === undefined) {
	return 'userAgent is undefined';
}

if (typeof ua !== 'string') {
	return 'userAgent is ' + typeof ua;
}

ua = ua.toLowerCase();
match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	/(msie) ([\w.]+)/.exec( ua ) ||
	ua.indexOf("compatible") &lt; 0 &amp;&amp; /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	[];
browser = match[1] || "";
version = match[2] || "0";

return browser + ", " + version;
</textarea><br>
<button id="evalGo">Run!</button>
<table width="100%" class="sortable">
<thead>
{{> browserHeadline}}
</thead>
<tbody>
{{#browsers}}
{{> browserRow}}
{{/browsers}}
</tbody>
<tfoot>
{{> browserHeadline}}
</tfoot>
<table>
</script>

<script type="text/html" id="browserHeadline">
<tr><th>Browser</th><th>OS</th><th>jQuery</th><th>Test</th><th>Hover</th><th>Results</th></tr>
</script>

<script type="text/html" id="browserRow">
<tr>
<th>{{name}}</th>
<th>{{os}}</th>
<td class="jQueryTest" data-id="{{id}}"></td>
<td class="autotest" data-id="{{id}}"></td>
<td>
	<span data-id="{{id}}" data-property="document" class="hover showOff" title="document">D</span>
	<span data-id="{{id}}" data-property="navigator" class="hover showOff" title="navigator">N</span>
	<span data-id="{{id}}" data-property="baseObject" class="hover showOff" title="baseObject">{}</span>
	<span data-id="{{id}}" data-property="globalObject" class="hover showOff" title="globalObject">G</span>
	<span data-id="{{id}}" data-property="testResults" class="hover showOff" title="testResults">?</span>
	<span data-id="{{id}}" data-property="window" class="hover showOff" title="window">W</span>
	<span class="hover" title="{{filename}}">F</span>
	<span data-value="{{navigator.userAgent}}" title="{{navigator.userAgent}}" class="hover showOff">UA</span>
</td>
<td class="browserResult" data-id="{{id}}"></td></tr>
</script>

</body></html>

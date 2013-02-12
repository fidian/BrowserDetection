#!/usr/bin/env php
<?php

if (empty($GLOBALS['argv'][2])) {
	echo "Specify a scenario to assemble and destination folder, like this:\n";
	echo "\tphp assemble.php 09582299336325377 ../browserData \"name\" \"os\"\n";
	echo "The files 09582299336325377-* must be in the same directory as this script.\n";
	echo "Name and OS are optional\n";
	return;
}

$tests = array('baseObject', 'document', 'globalObject', 'navigator', 'testResults', 'window');

$scenario = $GLOBALS['argv'][1];
$destDir = $GLOBALS['argv'][2];

if (! empty($GLOBALS['argv'][3])) {
	$name = $GLOBALS['argv'][3];
} else {
	$name = 'Unknown';
}

if (! empty($GLOBALS['argv'][4])) {
	$os = $GLOBALS['argv'][4];
} else {
	$os = 'Unknown';
}

$filesByTest = array();
$errors = 0;

foreach ($tests as $test) {
	if (! array_key_exists($test, $filesByTest)) {
		$filesByTest[$test] = array();
	}
	$globMatch = $scenario . '-' . $test . '-*';

	$files = glob($globMatch);

	if (count($files) === 0) {
		$errors ++;
		echo "Missing files matching " . $globMatch . "\n";
	}

	sort($files);
	$filesByTest[$test] = $files;
}

if ($errors) {
	echo "Incomplete scenario - aborting.\n";
	exit();
}

$contentByTest = array();

foreach ($filesByTest as $test => $files) {
	$joined = '';

	foreach ($files as $file) {
		$joined .= file_get_contents($file);
	}

	$contentByTest[$test] = $joined;
}

$output = "{";
$output .= "\n\"name\": \"$name - $scenario\"";
$output .= ",\n\"os\": \"$os\"";

foreach ($tests as $test) {
	$output .= ",\n\"$test\": \"" . addslashes($contentByTest[$test]) . "\"";
}

$output .= "\n}\n";
file_put_contents($destDir . '/' . $scenario . '.js', $output);

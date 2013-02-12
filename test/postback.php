<?php
$n = $_REQUEST['n'] * 1;

while (strlen($n) < 3) {
	$n = '0' . $n;
}

$name = $_REQUEST['r'] . '-' . $_REQUEST['name'] . '-' . $n;
$name = str_replace('.', '', $name);
$name = str_replace('/', '', $name);
// Make sure the web server can write here or else change the path
file_put_contents('results/' . $name, $_REQUEST['c']);

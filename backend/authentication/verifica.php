<?php
header("Content-Type: text/html;charset=utf-8");

if(!isset($_GET['t'])) die('Debe especificar el token');

$token = $_GET['t'];
echo 'tolkem';
var_dump(
    Auth::GetData(
        $token
    )
);

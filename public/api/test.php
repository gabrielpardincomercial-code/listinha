<?php
header('Content-Type: application/json');
$hasSqlite = extension_loaded('pdo_sqlite');
$hasJson = extension_loaded('json');
$writeable = is_writable(__DIR__);
echo json_encode([
    'status' => 'ok',
    'php_version' => phpversion(),
    'has_pdo_sqlite' => $hasSqlite,
    'has_json' => $hasJson,
    'dir_writable' => $writeable
]);

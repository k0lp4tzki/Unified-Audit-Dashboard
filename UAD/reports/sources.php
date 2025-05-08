<?php
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);
error_log('Debugging db query aktiviert');
header_remove();
header('Cache-Control: max-age=86400, public');
ob_start();
ob_clean();

require '../config/db.php';
$config = getConfig();
$connection = oci_connect($config['user'], $config['password'], $config['host'].'/'.$config['dbname'], 'AL32UTF8');

$isAjaxRequest = isset($_GET['ajax']) ||
                (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');

// Sicherstellen dass $connection existiert und gültig ist
if (!isset($connection) || !is_resource($connection)) {
    throw new Exception("Database connection not properly initialized");
}
$query = "SELECT DISTINCT source_database FROM DASHBOARD WHERE source_database IS NOT NULL ORDER BY source_database";
$stmt = oci_parse($connection, $query);
oci_execute($stmt);

$sources = [];
while ($row = oci_fetch_assoc($stmt)) {
    $sources[] = $row['SOURCE_DATABASE'];
}
header('Content-Type: application/json');
echo json_encode($sources);

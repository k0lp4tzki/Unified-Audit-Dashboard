<?php
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);
error_log('Debugging db query aktiviert');
header_remove();
header('Cache-Control: max-age=86400, public');
ob_start();
ob_clean();
$isAjaxRequest = isset($_GET['ajax']) ||
                (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
require '../config/db.php';
date_default_timezone_set('Europe/Berlin');
$start_time = microtime(true);

$config = getConfig();
$connection = oci_connect(
    $config['user'],
    $config['password'],
    $config['host'].'/'.$config['dbname'],'AL32UTF8'
);
if (!$connection) {
    ob_end_clean();
    if (isset($_GET['ajax'])) {
        header('Content-Type: application/json');
        die(json_encode(['error' => 'Database connection failed']));
    }
    die('Database connection error');
}

$reportMonth = $_GET['month'] ?? date('Y-m');
$sourceFilter = $_GET['source'] ?? null;
$monthLabel = date('F Y', strtotime($reportMonth));
$sourceFilter = isset($_GET['source']) ? strtoupper($_GET['source']) : null;

function fetchData($query, $binds = []) {
    global $connection;
    $stmt = oci_parse($connection, $query);
    foreach ($binds as $key => $value) {
        oci_bind_by_name($stmt, $key, $binds[$key]);
    }
    oci_execute($stmt);
    $results = [];
    while ($row = oci_fetch_assoc($stmt)) {
        $results[] = $row;
    }
    return $results;
}

$whereClause = "TO_CHAR(event_timestamp, 'YYYY-MM') = :month";
$binds = ['month' => $reportMonth];
if ($sourceFilter) {
    $whereClause .= " AND source_database = :source";
    $binds['source'] = $sourceFilter;
}


$reportData['total_events'] = fetchData("SELECT COUNT(*) AS COUNT FROM DASHBOARD WHERE $whereClause", $binds)[0]['COUNT'] ?? 0;

$reportData['top_user'] = fetchData("SELECT dbusername FROM (SELECT dbusername, COUNT(*) AS cnt FROM DASHBOARD WHERE $whereClause GROUP BY dbusername ORDER BY cnt DESC) WHERE ROWNUM = 1", $binds)[0]['DBUSERNAME'] ?? 'n/a';

$reportData['top_action'] = fetchData("SELECT action_name FROM (SELECT action_name, COUNT(*) AS cnt FROM DASHBOARD WHERE $whereClause GROUP BY action_name ORDER BY cnt DESC) WHERE ROWNUM = 1", $binds)[0]['ACTION_NAME'] ?? 'n/a';

$reportData['top_db_users'] = fetchData("SELECT dbusername, COUNT(*) as COUNT FROM DASHBOARD WHERE $whereClause GROUP BY dbusername ORDER BY COUNT(*) DESC FETCH FIRST 10 ROWS ONLY", $binds);

$reportData['top_actions'] = fetchData("SELECT action_name, COUNT(*) as COUNT FROM DASHBOARD WHERE $whereClause GROUP BY action_name ORDER BY COUNT(*) DESC FETCH FIRST 10 ROWS ONLY", $binds);

$reportData['top_userhosts'] = fetchData("SELECT userhost, COUNT(*) as COUNT FROM DASHBOARD WHERE $whereClause GROUP BY userhost ORDER BY COUNT(*) DESC FETCH FIRST 10 ROWS ONLY", $binds);

$reportData['top_sources'] = fetchData("SELECT source_database, COUNT(*) as COUNT FROM DASHBOARD WHERE $whereClause GROUP BY source_database ORDER BY COUNT(*) DESC FETCH FIRST 10 ROWS ONLY", $binds);

$reportData['daily'] = fetchData("SELECT TO_CHAR(event_timestamp, 'YYYY-MM-DD') as EVENT_DATE, COUNT(*) as EVENT_COUNT FROM DASHBOARD WHERE $whereClause GROUP BY TO_CHAR(event_timestamp, 'YYYY-MM-DD') ORDER BY EVENT_DATE", $binds);

$statsData = fetchData("SELECT MAX(LAST_ANALYZED) AS LAST_STATS FROM DBA_TABLES WHERE TABLE_NAME = 'DASHBOARD'");
$indexData = fetchData("SELECT MAX(LAST_ANALYZED) AS LAST_INDEX_REBUILD FROM DBA_INDEXES WHERE TABLE_NAME = 'DASHBOARD'");
$columnAnalysis = fetchData("SELECT column_name FROM (SELECT column_name, COUNT(DISTINCT column_name) AS CNT FROM (SELECT 'DBUSERNAME' AS column_name FROM DASHBOARD UNION ALL SELECT 'USERHOST' FROM DASHBOARD UNION ALL SELECT 'ACTION_NAME' FROM DASHBOARD UNION ALL SELECT 'SOURCE_DATABASE' FROM DASHBOARD) GROUP BY column_name ORDER BY CNT DESC) WHERE ROWNUM = 1");

$reportData['stats'] = $statsData;
$reportData['last_index_rebuild'] = $indexData;

$diagnostics = [
    'last_stats_update' => $statsData[0]['LAST_STATS'] ?? 'N/A',
    'last_index_rebuild' => $indexData[0]['LAST_INDEX_REBUILD'] ?? 'N/A',
    'top_column' => $columnAnalysis[0]['COLUMN_NAME'] ?? 'N/A',
    'table_name' => 'DASHBOARD',
    'runtime' => round(microtime(true) - $start_time, 2)
];

?>

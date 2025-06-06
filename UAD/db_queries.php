<?php
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);
error_log('debugging activated!');
header_remove();
header('Cache-Control: max-age=86400, public');
ob_start();
ob_clean();
$isAjaxRequest = isset($_GET['ajax']) ||
                (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');

// Sicherstellen dass $connection existiert und gültig ist
if (!isset($connection) || !is_resource($connection)) {
    throw new Exception("Database connection not properly initialized");
}

function executeQuery($query, $params = []) {
    if (!is_array($params)) {
        error_log("executeQuery ERROR: " . print_r($params, true)); // Ins Log schreiben
        var_dump($params); // Direkt auf der Seite ausgeben
        die();
    }
    global $connection;

    if (!is_array($params)) {
        throw new Exception("executeQuery: params must be an array, " . gettype($params) . " given.");
    }
    $stmt = oci_parse($connection, $query);    if (!$stmt) {
        $error = oci_error($connection);
        throw new Exception("Parse error: " . $error['message']);
    }

    foreach ($params as $param => $value) {
        oci_bind_by_name($stmt, $param, $value);
    }

    if (!oci_execute($stmt)) {
        $error = oci_error($stmt);
        throw new Exception("Execution error: " . $error['message']);
    }

    return $stmt;
}

// Query: Total number of entries in unified_audit_trail
$auditQuery = "SELECT count(*) as AUDIT_COUNT FROM DASHBOARD";
$stmtAudit = executeQuery($auditQuery);
$auditResults = oci_fetch_assoc($stmtAudit);

$recentQuery = "
    SELECT os_username, userhost, dbusername, action_name, return_code, client_program_name, os_process, system_privilege_used, current_user, unified_audit_policies, TO_CHAR(event_timestamp, 'YYYY-MM-DD HH24:MI:SS') as EVENT_TIMESTAMP, source_database
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '4' DAY
    ORDER BY event_timestamp DESC
";
$stmtRecent = executeQuery($recentQuery);
$recentEntries = [];
while ($row = oci_fetch_assoc($stmtRecent)) {
    $recentEntries[] = $row;
}

$todayQuery = "
    SELECT *
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE)
";
$stmttoday = executeQuery($todayQuery);
$todayEntries = [];
while ($row = oci_fetch_assoc($stmttoday)) {
    $todayEntries[] = $row;
}

// SQL query to get daily event counts
$timelineQuery = "SELECT TO_CHAR(event_timestamp, 'YYYY-MM-DD') as EVENT_DATE, COUNT(*) as TIMELINE_COUNT
FROM DASHBOARD
WHERE return_code <> 0
AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '2' DAY
GROUP BY TO_CHAR(event_timestamp, 'YYYY-MM-DD')
ORDER BY EVENT_DATE DESC";

$stmtTimeline = executeQuery($timelineQuery);
$timelineEntries = [];
while ($row = oci_fetch_assoc($stmtTimeline)) {
    $timelineEntries[] = $row;
}


$lineChartQuery = "
SELECT
  TO_CHAR(event_timestamp, 'YYYY-MM-DD HH24') AS EVENT_HOUR,
  COUNT(*) AS EVENT_COUNT
FROM DASHBOARD
WHERE return_code <> 0
  AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '7' DAY
  AND event_timestamp < TRUNC(SYSDATE) + INTERVAL '1' DAY
GROUP BY TO_CHAR(event_timestamp, 'YYYY-MM-DD HH24')
ORDER BY MIN(event_timestamp)";



$stmtLineChart = executeQuery($lineChartQuery);

// Initialize hours for the last 7 days + today (8 days total)
$startDate = new DateTime('-7 days'); // Start: heute - 7
$eventsByHour = [];
for ($i = 0; $i < 8 * 24; $i++) { // 8 Tage * 24 Stunden = 192
    $hourLabel = $startDate->format('Y-m-d H');
    $eventsByHour[$hourLabel] = 0; // Fülle mit 0 vor
    $startDate->modify('+1 hour');
}

// Populate $eventsByHour with actual data from the query
while ($row = oci_fetch_assoc($stmtLineChart)) {
    $hour = $row['EVENT_HOUR'];
    if (array_key_exists($hour, $eventsByHour)) {
        $eventsByHour[$hour] = (int)$row['EVENT_COUNT'];
    }
}

// Piechart Query: Top 5 ACTIONS
$actionCountQuery = "
    SELECT action_name, COUNT(*) as ACTION_COUNT
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '2' DAY
    GROUP BY action_name
    ORDER BY COUNT(*) DESC
    FETCH FIRST 5 ROWS ONLY";
$stmtActionCount = executeQuery($actionCountQuery);
$actionCounts = [];
while ($row = oci_fetch_assoc($stmtActionCount)) {
    $actionCounts[] = $row;
}

// Piechart Query: Top 5 DB Users
$dbUserQuery = "
    SELECT dbusername, COUNT(*) as USER_COUNT
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '2' DAY
    GROUP BY dbusername
    ORDER BY USER_COUNT DESC
    FETCH FIRST 5 ROWS ONLY";
$stmtDbUser = executeQuery($dbUserQuery);
$dbUserCounts = [];
while ($row = oci_fetch_assoc($stmtDbUser)) {
    $dbUserCounts[] = $row;
}

// Piechart Query: Top 5 Source Databases
$sourceDatabaseQuery = "
    SELECT source_database, COUNT(*) as SOURCE_COUNT
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '2' DAY
    GROUP BY source_database
    ORDER BY SOURCE_COUNT DESC
    FETCH FIRST 5 ROWS ONLY";
$stmtSourceDatabase = executeQuery($sourceDatabaseQuery);
$sourceDatabaseCounts = [];
while ($row = oci_fetch_assoc($stmtSourceDatabase)) {
    $sourceDatabaseCounts[] = $row;
}

// Piechart Query: Top 5 Userhosts
$userhostQuery = "
    SELECT userhost, COUNT(*) as USERHOST_COUNT
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '3' DAY
    GROUP BY userhost
    ORDER BY USERHOST_COUNT DESC
    FETCH FIRST 5 ROWS ONLY";
$stmtUserhost = executeQuery($userhostQuery);
$userhostCounts = [];
while ($row = oci_fetch_assoc($stmtUserhost)) {
    $userhostCounts[] = $row;
}

// Prepare data for Charts
$actionLabels = array_column($actionCounts, 'ACTION_NAME');
$actionData = array_column($actionCounts, 'ACTION_COUNT');


// Spaltenreihenfolge für die Tabelle
$columnKeys = [
    'EVENT_TIMESTAMP','OS_USERNAME', 'USERHOST', 'DBUSERNAME', 'ACTION_NAME', 
    'RETURN_CODE', 'CLIENT_PROGRAM_NAME', 'OS_PROCESS', 
    'SYSTEM_PRIVILEGE_USED', 'CURRENT_USER', 
    'UNIFIED_AUDIT_POLICIES', 'SOURCE_DATABASE'
];

// Output as JSON for JavaScript
echo "<script>const timelineEntries = " . json_encode($timelineEntries) . ";</script>";
echo "<script>const recentEntries = " . json_encode($recentEntries) . ";</script>";
echo "<script>const columnKeys = " . json_encode($columnKeys) . ";</script>";

// Close statements and connection
oci_free_statement($stmtAudit);
oci_free_statement($stmtRecent);
oci_free_statement($stmtLineChart);
oci_free_statement($stmtActionCount);
oci_free_statement($stmtDbUser);
oci_free_statement($stmtSourceDatabase);
oci_free_statement($stmtUserhost);
oci_close($connection);

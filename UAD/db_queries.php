<?php
/**
 * Unified Audit Dashboard
 * 
 * (c) 2025 Your Name (github.com/k0lp4tzki)
 * 
 * This project is licensed under the MIT License.
 * 
 * If you find this project useful, feel free to support me:
 * ☕ Buy me a coffee: https://buymeacoffee.com/denniskolpatzki
 * 💸 PayPal: https://paypal.me/MindFck
 * 
 * Disclaimer:
 * This software is provided "as is", without warranty of any kind,
 * express or implied, including but not limited to the warranties of
 * merchantability, fitness for a particular purpose and noninfringement.
 * In no event shall the authors be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising
 * from, out of or in connection with the software or the use or other dealings
 * in the software.
 */

//ini_set('display_errors', 1);
//ini_set('error_reporting', E_ALL);
//error_log('Debugging db query aktiviert');
// There was a try with AJAX Page Loading, but i never get it done
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
SELECT TO_CHAR(event_timestamp, 'YYYY-MM-DD HH24') as EVENT_HOUR, COUNT(*) as EVENT_COUNT
FROM DASHBOARD
WHERE return_code <> 0
AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '4' DAY
GROUP BY TO_CHAR(event_timestamp, 'YYYY-MM-DD HH24')
ORDER BY EVENT_HOUR";

$stmtLineChart = executeQuery($lineChartQuery);

// Initialize hours for the last 2 days with zero counts
$startDate = new DateTime('-2 days'); // 2-day range starting from 3 days ago
$eventsByHour = [];
for ($i = 0; $i < 3 * 24; $i++) {
    $hourLabel = $startDate->format('Y-m-d H');
    $eventsByHour[$hourLabel] = 0; // Initialize each hour with zero events
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
// Change the Interval if needed for a longer or shorter time frame
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
// Change the Interval if needed for a longer or shorter time frame
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
// Change the Interval if needed for a longer or shorter time frame
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
// Change the Interval if needed for a longer or shorter time frame
$userhostQuery = "
    SELECT userhost, COUNT(*) as USERHOST_COUNT
    FROM DASHBOARD
    WHERE return_code <> 0 AND event_timestamp >= TRUNC(SYSDATE) - INTERVAL '2' DAY
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

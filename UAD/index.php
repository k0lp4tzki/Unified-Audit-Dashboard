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

 // Initialisierung
//ini_set('display_errors', 0);
//ini_set('error_reporting', E_ALL);
//error_log('Debugging aktiviert');
header_remove();
header('Cache-Control: max-age=86400, public');
ob_start();
ob_clean();
$start_time = microtime(true);
// Konfiguration und DB-Verbindung
require 'config/db.php';
$config = getConfig();
$connection = oci_connect(
    $config['user'],
    $config['password'],
    $config['host'].'/'.$config['dbname'],'AL32UTF8'
);
error_log("Database connection: " . (microtime(true) - $start_time) . " Sekunden");

if (!$connection) {
    ob_end_clean();
    if (isset($_GET['ajax'])) {
        header('Content-Type: application/json');
        die(json_encode(['error' => 'Database connection failed']));
    }
    die('Database connection error');
}
require 'db_queries.php';


// AJAX-Handling
if (isset($_GET['ajax'])) {
     // Hier werden die Abfragen ausgeführt
    ob_end_clean();
    header('Content-Type: application/json'); 
    try {
        echo json_encode([
            'status' => 'success',
            'data' => [
                'entries' => $recentEntries,  // Hier wird $recentEntries verwendet
                'pagination' => [
                    'page' => $page,
                    'total' => $totalEntries,
                    'pages' => $pages
                ]
            ]
        ]);
    } catch (Exception $e) {
        // Fehlerprotokoll mit Details zur Ausnahme
        error_log('Fehler beim JSON-Ausgeben: ' . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Ein Fehler ist aufgetreten.']);
    }
    
    exit;
}

// Hilfsfunktion
function handleError($message) {
    ob_end_clean();
    if (isset($_GET['ajax'])) {
        header('Content-Type: application/json');
        die(json_encode(['status' => 'error', 'message' => $message]));
    }
    die($message);
}
// 3. Normale HTML-Ausgabe
include 'index.html';
?>

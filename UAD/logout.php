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

session_unset(); // Löscht alle Session-Variablen
session_destroy(); // Zerstört die Session
// Zur Login-Seite weiterleiten
header("Location: login.php");
exit;
?>


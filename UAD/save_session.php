<?php
/**
 * Unified Audit Dashboard
 * 
 * (c) 2025 Dennis Kolpatzki (github.com/k0lp4tzki)
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

 //Save state of sidebar
session_start();

if (isset($_POST['linechart_collapsed'])) {
    $_SESSION['linechart_collapsed'] = $_POST['linechart_collapsed'] == '1' ? true : false;
}

if (isset($_POST['sidebar_collapsed'])) {
    $_SESSION['sidebar_collapsed'] = $_POST['sidebar_collapsed'] == '1' ? true : false;
    echo 'Sidebar state saved.';
}
?>

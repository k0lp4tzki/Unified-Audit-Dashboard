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

session_start();

// Sicherheitsoptionen aktivieren
ini_set('display_errors', 0); // Deaktiviere Fehleranzeige
ini_set('session.cookie_httponly', 1); // Schütze die Session-Cookies
ini_set('session.cookie_secure', 1); // HTTPS nur für Session-Cookies
ini_set('session.use_strict_mode', 1); // Erzwingt gültige Session-IDs

// LDAP-Konfiguration
// Login based on LDAD Authentication but you don't need higher access. It's just a "Can this user read or logon on the local domain"
// Feel free to disable login
define('LDAP_SERVER', 'ldap://YourLDAPServer');
define('LDAP_DOMAIN', 'ad');

// CSRF-Token erstellen
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Funktion zur Authentifizierung
function authenticate($username, $password) {
    $ldapConn = ldap_connect(LDAP_SERVER);
    ldap_set_option($ldapConn, LDAP_OPT_PROTOCOL_VERSION, 3);
    ldap_set_option($ldapConn, LDAP_OPT_REFERRALS, 0);

    $ldapBind = @ldap_bind($ldapConn, LDAP_DOMAIN . "\\" . $username, $password);

    return $ldapBind ? true : false;
}

// Verarbeitungslogik für Login-Formular
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $csrfToken = $_POST['csrf_token'];

    // CSRF-Token überprüfen
    if ($csrfToken !== $_SESSION['csrf_token']) {
        die("Ungültiges CSRF-Token.");
    }

    // Begrenzte Fehlversuche
    if (!isset($_SESSION['failed_attempts'])) {
        $_SESSION['failed_attempts'] = 0;
    }
    
    // Zu viele Fehlversuche
    if ($_SESSION['failed_attempts'] >= 5) {
        die("Too much failed attempts. Please try again later!.");
    }

    // Authentifizieren
    if (authenticate($username, $password)) {
        session_regenerate_id(true); // Session-ID regenerieren
        $_SESSION['username'] = $username;
        $_SESSION['failed_attempts'] = 0;
        header("Location: index.php");
        exit;
    } else {
        $_SESSION['failed_attempts']++;
        $error = "Invalid Username or Password";
    }
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="loginstyle.css"> <!-- Dein CSS-Styling für Buttons und Inputs -->
</head>
<body>
    <div class="title-container">
                <img src="resources/login_logo.jpg" alt="Logo" class="logo-img">

    <?php if (!empty($error)): ?>
        <p style="color:red;"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>
    <form method="post">
        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

        <label for="username">Benutzername:</label>
        <input type="text" id="username" name="username" required class="filterInput"><br>

        <label for="password">Passwort:</label>
        <input type="password" id="password" name="password" required class="filterInput"><br>

        <button type="submit" class="btn-collapse">Login</button>
    </form></div>
</body>
</html>



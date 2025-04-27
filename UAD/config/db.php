<?php
// This file is a pure false security, because keys and password are in the same file, i just used it because i don't like plain passwords.
// So you could discard this whole function and enter your plain text password in the connection string.
// Key and IV for encryption (keep these safe and secure)

define('ENCRYPTION_KEY', '');// 32 Bytes at minimum if you like
define('ENCRYPTION_IV', ''); // IV should be 16 bytes for AES-256-CBC

// Function to encrypt the password
function encryptPassword($password) {
    return openssl_encrypt($password, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV);
}

// Function to decrypt the password
function decryptPassword($encryptedPassword) {
    return openssl_decrypt($encryptedPassword, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV);
}

// Use this to encrypt the password once and store the encrypted password
// $encryptedPassword = encryptPassword('YourPlainTextPasswordHere');
// echo $encryptedPassword; // Copy this encrypted password into the config array below

// Encrypted password to store in config (replace with actual encrypted output)
$encryptedPassword = '';
//echo $encryptedPassword;

function getConfig() {
    global $encryptedPassword; // Use the encrypted password here
    return [
        'host' => 'fqdn:PORT',
        'dbname' => 'SID/SERVICE',
        'user' => 'Username', //i installed everything with DBSNMP because it's per default on every database
        'password' => decryptPassword($encryptedPassword), // Decrypt on-the-fly when needed
    ];
}
?>

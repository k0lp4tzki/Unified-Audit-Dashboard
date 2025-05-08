# Installation Instructions for Unified Audit Dashboard

Welcome!  
This guide explains the necessary system requirements and setup steps to successfully install and run the Unified Audit Dashboard. This is not a complete tutorial, just a quick handout.

---

## System Requirements

- **Operating System:** Linux (recommended) or Windows (with adjustments)
- **Web Server:** Apache HTTP Server
- **PHP Version:** PHP 8 or higher
- **Database:** Oracle Database i guess.. (tested with Oracle 19c)
- **Unified Auditing must be enabled to retrieve and display data!

---

## Required Software Components

| Component | Purpose | Notes |
|:---|:---|:---|
| Apache Webserver | Hosting the PHP application | SSL module required if HTTPS is needed |
| Oracle Instant Client | Database connectivity | [Installation Guide](https://oracle-base.com/articles/misc/oracle-instant-client-installation) |
| PHP Extension: `oci8` | Oracle database access from PHP | |
| PHP Extension: `ldap` | LDAP authentication support (optional) | |
| SSL Certificate | HTTPS encryption (optional but recommended) | Self-signed or CA-signed certificates |

---

## Setup Instructions

### 1. Install Apache Web Server
Install Apache if it's not already installed:

    sudo apt update
    sudo apt install apache2

2. Install Oracle Instant Client

Follow the official guide to install the Oracle Instant Client: 👉 Oracle Instant Client Installation Guide

Make sure to update the system library cache:

    sudo ldconfig /path/to/your/oracle/instantclient

Replace /path/to/your/oracle/instantclient with the actual install path.

3. Install PHP and Required Extensions

Install PHP with necessary extensions:

    sudo apt install php php-oci8 php-ldap

Depending on your distribution, you may need to enable oci8 manually or specify the Oracle Home path in your php.ini.
4. Configure SSL (optional but recommended)

Enable SSL in Apache:

    sudo a2enmod ssl
    sudo a2ensite default-ssl

Edit your SSL VirtualHost (vhost-ssl.conf or default-ssl.conf) to point to your certificate files:

    SSLCertificateFile /etc/ssl/certs/your_certificate.crt
    SSLCertificateKeyFile /etc/ssl/private/your_private.key

Restart Apache:

    sudo systemctl reload apache2

5. Adjust Apache Configuration

Edit /etc/apache2/httpd.conf or /etc/apache2/apache2.conf as needed:

    Ensure PHP is enabled

    Set correct DocumentRoot if you move the dashboard

    (Optional) Configure authentication methods (LDAP etc.)

Example to include PHP8 in Apache (if needed):

    AddHandler application/x-httpd-php .php

6. Deploy the Application

   Clone or download the dashboard code into your web server directory (/var/www/html/ or similar).

   Adjust your config.php to match your environment (database connection, credentials, etc.).
   

8. Oracle Connection Check

Verify that oci_connect() or new PDO('oci:...') successfully connects to your Oracle database from a simple PHP script.

8. In my case, the table name was DASHBOARD, so every sql query is 'FROM DASHBOARD'. If you need to change it to your specific needs or conventions, feel free.

9. Envinronment Installation: 

   Because the original UNIFIED_AUDIT_TRAIL keeps some LOB Locators and oracle doesn't allow to send this type over database links it is necessary to create a global temp table and reflect your unified audit trail into this new table.
   Please have a look at the .SQL Files for further informations.

11. Don't forget to grant create db link permissions to your monitoring user (dbsnmp in my case)

        CREATE DATABASE LINK AUDIT_TO_DASHBOARD_DBSNMP
        CONNECT TO dbsnmp IDENTIFIED BY "XYZ"
        USING '//IP:PORT/DASHBOARD';

12. If you want to use the LDAP Authentication Method, you need to put in your LDAP / Domainserver into the login.php. Otherwise, set the destination directory in your httpd.conf direct to index.php instead of login.php

        # List of resources to look for when the client requests a directory
        DirectoryIndex login.php or index.php



If connection fails:

    Check LD_LIBRARY_PATH and ldconfig settings.
    Verify phpinfo() to confirm oci8 is loaded.


Notes

    For Oracle connections via oci8, it is essential that the Oracle Instant Client is correctly installed and ldconfig is updated.

    LDAP authentication is optional and requires the php-ldap module.

    SSL setup is strongly recommended for production environments.

Troubleshooting

    Blank Page: Check apache2/error.log for PHP errors.

    Database Connection Fails: Verify Oracle Instant Client path and permissions.

    SSL Issues: Make sure certificate files are correctly referenced and Apache has read access.
    

Good to Know

    This project is a hobby project and provided without any official support or warranty.

    Feel free to adapt the dashboard to your needs!

    Pull requests and suggestions are welcome. 🚀

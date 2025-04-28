-- needs to be on every source host
-- reflect the unified_audit_trail into temp data and finally send it via db link to the dashboard database
-- data is only hold for the session and cleared on commit
-- no need for statistics or housekeeping

create or replace NONEDITIONABLE PROCEDURE Unified_Audit_Dashboard
AUTHID DEFINER
AS
    open_mode VARCHAR2(10);
    short_version VARCHAR2(20);
    full_version VARCHAR2(30);
    sql_query VARCHAR2(1500);

BEGIN
    -- Prüfe den Login-Modus der Instanz
    SELECT LOGINS INTO open_mode FROM V$INSTANCE;
    SELECT VERSION_FULL INTO full_version FROM V$INSTANCE;

    -- Bestimme Kurzversion (erste zwei Ziffern, z. B. "19.21")
    -- versions before 19.21 has no source column
    -- i explicit except entries from source column because it is a time where the database isn't up and mostly the entries are massive for the dashboard
    -- feel free to optimize

    short_version := SUBSTR(full_version, 1, INSTR(full_version, '.', 1, 2) - 1);

    -- Falls die Instanz im RESTRICTED Mode ist, beende die Prozedur
    -- In restricted mode it's possible to get a lot of audit entries, i except them explicit
    IF open_mode = 'RESTRICTED' THEN
        RETURN;
    END IF;

    -- Debug-Ausgabe
    DBMS_OUTPUT.PUT_LINE('Login-Modus der Instanz: ' || open_mode);
    DBMS_OUTPUT.PUT_LINE('Vollständige Version: ' || full_version);
    DBMS_OUTPUT.PUT_LINE('Kurzversion (erste zwei Ziffern): ' || short_version);

    -- Dynamische SQL-Abfrage basierend auf der Datenbankversion
    IF short_version >= '19.21' THEN
        DBMS_OUTPUT.PUT_LINE('BETRETE 19.21 IF');

        sql_query := 'INSERT INTO temp_audit_data
                      SELECT 
                          os_username, 
                          userhost, 
                          dbusername, 
                          action_name, 
                          return_code, 
                          client_program_name, 
                          os_process,
                          system_privilege_used,
                          unified_audit_policies,
                          current_user,
                          event_timestamp,
                          (SELECT name FROM v$database) AS source_database
                      FROM 
                          unified_audit_trail
                      WHERE 
                          return_code <> 0 
                          AND event_timestamp > (SELECT NVL(MAX(event_timestamp), TO_TIMESTAMP(''1970-01-01'', ''YYYY-MM-DD'')) FROM temp_audit_data) 
                          AND event_timestamp >= TRUNC(SYSDATE)
                          AND source = ''DATABASE'''; -- Nur in 19.21+ vorhanden
    ELSE
            DBMS_OUTPUT.PUT_LINE('BETRETE 19.21 ELSE');

        sql_query := 'INSERT INTO temp_audit_data
                      SELECT 
                          os_username, 
                          userhost, 
                          dbusername, 
                          action_name, 
                          return_code, 
                          client_program_name, 
                          os_process,
                          system_privilege_used,
                          unified_audit_policies,
                          current_user,
                          event_timestamp,
                          (SELECT name FROM v$database) AS source_database
                      FROM 
                          unified_audit_trail
                      WHERE 
                          return_code <> 0 
                          AND event_timestamp > (SELECT NVL(MAX(event_timestamp), TO_TIMESTAMP(''1970-01-01'', ''YYYY-MM-DD'')) FROM temp_audit_data) 
                          AND event_timestamp >= TRUNC(SYSDATE)';
    END IF;

    -- Führe die dynamische SQL-Abfrage aus
    EXECUTE IMMEDIATE sql_query;

    -- MERGE in Dashboard DB (über DB-Link)
    MERGE INTO dashboard@audit_to_dashboard_dbsnmp d
    USING (
        SELECT * 
        FROM temp_audit_data 
        WHERE event_timestamp >= SYSDATE - (30 / (24 * 60)) -- Letzte 30 Minuten
    ) t
    ON (
        d.event_timestamp = t.event_timestamp 
        AND d.source_database = t.source_database 
        AND d.action_name = t.action_name
        AND d.os_username = t.os_username
        AND d.userhost = t.userhost
    )
    WHEN NOT MATCHED THEN
        INSERT (
            os_username, 
            userhost, 
            dbusername, 
            action_name, 
            return_code, 
            client_program_name, 
            os_process,
            system_privilege_used,
            unified_audit_policies,
            current_user,
            event_timestamp, 
            source_database
        )
        VALUES (
            t.os_username, 
            t.userhost, 
            t.dbusername, 
            t.action_name, 
            t.return_code, 
            t.client_program_name, 
            t.os_process,
            t.system_privilege_used,
            t.unified_audit_policies,
            t.current_user,
            t.event_timestamp, 
            t.source_database
        );

    -- Commit für Dashboard-DB (nicht für GTT)
    COMMIT;
END Unified_Audit_Dashboard;

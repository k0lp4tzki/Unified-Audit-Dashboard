-- needs to be created on every source host
CREATE GLOBAL TEMPORARY TABLE temp_audit_data (
    os_username VARCHAR2(128), 
    userhost VARCHAR2(128), 
    dbusername VARCHAR2(128), 
    action_name VARCHAR2(64), 
    return_code NUMBER, 
    client_program_name VARCHAR2(128), 
    os_process VARCHAR2(16),
    system_privilege_used VARCHAR2(128),
    unified_audit_policies VARCHAR2(4000),
    current_user VARCHAR2(128),
    event_timestamp timestamp(6),
    source_database VARCHAR2(128)
) 
ON COMMIT PRESERVE ROWS;

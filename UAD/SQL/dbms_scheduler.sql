-- reflect data on every 15th minute into temp table 
BEGIN
   DBMS_SCHEDULER.create_job (
      job_name        => 'dashboard_sync',
      job_type        => 'stored_procedure',
      job_action      => 'Unified_Audit_Dashboard',
      start_date      => SYSTIMESTAMP,
      repeat_interval => 'freq=MINUTELY; byminute=15',
      end_date        => NULL,
      enabled         => TRUE,
      comments        => 'Job to sync unified_audit_trail with dashboard table');
END;
/

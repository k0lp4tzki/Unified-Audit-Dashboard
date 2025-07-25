CREATE TABLE DBSNMP.DASHBOARD (
    OS_USERNAME            VARCHAR2(128),
    USERHOST               VARCHAR2(128),
    DBUSERNAME             VARCHAR2(128),
    ACTION_NAME            VARCHAR2(64),
    RETURN_CODE            NUMBER,
    CLIENT_PROGRAM_NAME    VARCHAR2(48),
    OS_PROCESS             VARCHAR2(16),
    SYSTEM_PRIVILEGE_USED  VARCHAR2(1024),
    UNIFIED_AUDIT_POLICIES VARCHAR2(4000),
    CURRENT_USER           VARCHAR2(128),
    EVENT_TIMESTAMP        TIMESTAMP(6),
    SOURCE_DATABASE        VARCHAR2(32)
)
TABLESPACE SYSAUX
PARTITION BY RANGE (EVENT_TIMESTAMP)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
SUBPARTITION BY HASH (SOURCE_DATABASE)
SUBPARTITIONS 16
(
    PARTITION P_INITIAL VALUES LESS THAN (TIMESTAMP'2024-01-01 00:00:00')
);

CREATE INDEX DBSNMP.DASHBOARD_ACTION_NAME_IDX 
ON DBSNMP.DASHBOARD (ACTION_NAME)
TABLESPACE SYSAUX;

CREATE INDEX DBSNMP.DASHBOARD_RETURN_TIMESTAMP_IDX 
ON DBSNMP.DASHBOARD (RETURN_CODE, EVENT_TIMESTAMP)
TABLESPACE SYSAUX;

-- it could make sense to ad another index based on source databse IF you have lot of database connected, currently my system is still in a testmode.
-- feel free to change the subpartition basis to another column and add anothers idx.

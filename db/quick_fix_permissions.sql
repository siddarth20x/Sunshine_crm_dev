-- Quick fix for org.create_org_company permission issue
-- Run this script as MySQL root user or a user with GRANT privileges

-- Grant EXECUTE permission specifically for the create_org_company procedure
GRANT EXECUTE ON PROCEDURE org.create_org_company TO 'crm_dev'@'%';

-- Also grant EXECUTE permission on all procedures in org schema to prevent future issues
GRANT EXECUTE ON org.* TO 'crm_dev'@'%';

-- Grant necessary table permissions for org schema operations (including TRIGGER)
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON org.* TO 'crm_dev'@'%';

-- Grant EXECUTE permission on all procedures in stage schema
GRANT EXECUTE ON stage.* TO 'crm_dev'@'%';

-- Grant necessary table permissions for stage schema operations (including TRIGGER)
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON stage.* TO 'crm_dev'@'%';

-- Flush privileges to apply changes immediately
FLUSH PRIVILEGES;

-- Optional: Verify the grants were applied
-- SHOW GRANTS FOR 'crm_dev'@'%';


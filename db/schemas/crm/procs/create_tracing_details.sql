-- call `crm`.create_tracing_details(@err,3,1,'SQL DETAILS','COMPANY TRADE DETAILS','ADDITIONAL DETAILS',@otdid);
-- call `crm`.create_tracing_details(@err,151,662,1132,'Test SQ6789','TEST Company6789','Test Additioanl6789',@otdid);
DROP PROCEDURE IF EXISTS `crm`.create_tracing_details;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_tracing_details(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_lead_id BIGINT,
       IN in_task_id BIGINT,
       IN in_sql_details VARCHAR(700),
       IN in_company_trade_license_details VARCHAR(1000),
       IN in_additional_details VARCHAR(1000),
       OUT out_traced_details_id BIGINT
) 

BEGIN
SET error_code = -2;

INSERT INTO
       `crm`.tracing_details(
              traced_details_id,
              lead_id,
              task_id,
              sql_details,
              company_trade_license_details,
              additional_details,
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_lead_id,
              in_task_id,
              IFNULL(in_sql_details,""),
              in_company_trade_license_details,
              in_additional_details,
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       )ON DUPLICATE KEY
UPDATE
       company_trade_license_details = IFNULL(in_company_trade_license_details, company_trade_license_details),
       additional_details = IFNULL(in_additional_details, additional_details),
       status = IFNULL(1, status),
       modified_id = IFNULL(in_app_user_id, modified_id),
       modified_dtm = IFNULL(CURRENT_TIMESTAMP(), modified_dtm),
       traced_details_id = LAST_INSERT_ID(traced_details_id);

SET out_traced_details_id = LAST_INSERT_ID();

COMMIT;

SET error_code = 0;

END $$ 
DELIMITER ;
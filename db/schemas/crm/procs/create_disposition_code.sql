-- call `crm`.create_disposition_code(@err,1,"RIGHT PARTY OR SKIP RIGHT PARTY CONTACT","UNDER NEGOTIATION","UNG",@onid);
DROP PROCEDURE IF EXISTS `crm`.create_disposition_code;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_disposition_code(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_stage VARCHAR(100),
       IN in_stage_status VARCHAR(100),
       IN in_stage_status_name VARCHAR(100),
       IN in_stage_status_code VARCHAR(20),
       OUT out_disposition_code_id BIGINT
) 
BEGIN
SET
       error_code = -2;

-- Generate default stage_status_code if NULL or empty
SET @final_stage_status_code = CASE 
    WHEN in_stage_status_code IS NULL OR in_stage_status_code = '' THEN
        CONCAT(LEFT(REPLACE(COALESCE(in_stage_status, 'DEFAULT'), ' ', ''), 10))
    ELSE 
        in_stage_status_code
END;

INSERT INTO
       `crm`.disposition_code (
              disposition_code_id,
              stage,
              stage_status,
              stage_status_name,
              stage_status_code,
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_stage,
              in_stage_status,
              in_stage_status_name,
              @final_stage_status_code,
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       );

SET
       out_disposition_code_id = LAST_INSERT_ID();

COMMIT;

SET
       error_code = 0;

END $$ 
DELIMITER ;
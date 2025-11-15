-- call `crm`.create_web_tracing_details(@err,3,1,1,'TEST TRACING DETAILS',@owtdid);
DROP PROCEDURE IF EXISTS `crm`.create_web_tracing_details;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_web_tracing_details(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_lead_id BIGINT,
       IN in_task_id BIGINT,
       IN in_tracing_source_type_id BIGINT,
       IN in_traced_details VARCHAR(1000),
       OUT out_web_tracing_details_id BIGINT
) BEGIN
SET
       error_code = -2;

INSERT INTO
       `crm`.web_tracing_details(
              web_tracing_details_id,
              lead_id,
              task_id,
              tracing_source_type_id,
              traced_details,
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
              in_tracing_source_type_id,
              in_traced_details,
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       );

SET
       out_web_tracing_details_id = LAST_INSERT_ID();

COMMIT;

SET
       error_code = 0;

END $$ 
DELIMITER ;
-- call crm.get_disposition_code (@err,1); 
DROP PROCEDURE IF EXISTS crm.get_disposition_code;

DELIMITER $$ 
CREATE PROCEDURE crm.get_disposition_code (
   OUT error_code INT,
   IN in_disposition_code_id BIGINT
) 
BEGIN
SET
   error_code = -2;

SET
   @get_q = '
SELECT  disposition_code_id,
        stage,
        stage_status,
        stage_status_name,
        stage_status_code,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
   FROM crm.disposition_code
  WHERE status = 1 ';

IF in_disposition_code_id IS NOT NULL THEN
SET
   @get_q = CONCAT(
      @get_q,
      '
   AND disposition_code_id = ',
      in_disposition_code_id
   );

END IF;

-- select @get_q;
PREPARE stmt
FROM
   @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET
   error_code = 0;

END $$ 
DELIMITER ;
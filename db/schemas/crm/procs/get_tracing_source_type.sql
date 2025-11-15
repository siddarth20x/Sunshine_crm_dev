-- call crm.get_tracing_source_type(@err,null);
DROP PROCEDURE IF EXISTS crm.get_tracing_source_type;

DELIMITER $$ 
CREATE PROCEDURE crm.get_tracing_source_type(
     OUT error_code INT,
     IN in_tracing_source_type_id BIGINT
) 

BEGIN
SET error_code = -2;

SET
     @get_q = '
 SELECT tracing_source_type_id, 
        tracing_source_type_name,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
   FROM crm.tracing_source_type 
  WHERE status = 1 ';

IF in_tracing_source_type_id IS NOT NULL THEN
SET
     @get_q = CONCAT(
          @get_q,
          '
      AND tracing_source_type_id  = ',
          in_tracing_source_type_id
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

END$$ 
DELIMITER ;
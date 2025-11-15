-- call crm.get_sq_parameter_type(@err,null);

DROP PROCEDURE IF EXISTS crm.get_sq_parameter_type;

DELIMITER $$
CREATE PROCEDURE crm.get_sq_parameter_type(OUT error_code INT, 
			            IN in_sq_parameter_type_id BIGINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT sq_parameter_type_id, 
        sq_parameter_type_name,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
   FROM crm.sq_parameter_type 
  WHERE status = 1 ';

IF in_sq_parameter_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND sq_parameter_type_id  = ', in_sq_parameter_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

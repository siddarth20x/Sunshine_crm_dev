-- call crm.get_task_status_type(@err,null);

DROP PROCEDURE IF EXISTS crm.get_task_status_type;

DELIMITER $$
CREATE PROCEDURE crm.get_task_status_type(OUT error_code INT, 
			            IN in_task_status_type_id MEDIUMINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT task_status_type_id, 
        task_status_type_name,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
   FROM crm.task_status_type 
  WHERE status = 1 ';

IF in_task_status_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND task_status_type_id  = ', in_task_status_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

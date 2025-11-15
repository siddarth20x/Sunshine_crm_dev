-- call crm.get_source_type(@err,null);

DROP PROCEDURE IF EXISTS crm.get_source_type;

DELIMITER $$
CREATE PROCEDURE crm.get_source_type(OUT error_code INT, 
			            IN in_source_type_id MEDIUMINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT src.source_type_id, 
        src.source_type_name,
        src.status,
        src.created_id,
        src.created_dtm,
        src.modified_id,
        src.modified_dtm
   FROM crm.source_type src 
  WHERE src.status = 1 ';

IF in_source_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND src.source_type_id  = ', in_source_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

-- call org.get_org_location_operation(@err, 'email');
-- call org.get_org_location_operation(@err, null);

DROP PROCEDURE IF EXISTS org.get_org_location_operation;

DELIMITER $$
CREATE PROCEDURE org.get_org_location_operation(OUT error_code INT, 
                                       IN in_location_id BIGINT
                                      )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT lo.location_operation_id, 
        lo.location_id,
        lo.location_start_date,
        lo.location_end_date,
        lo.location_start_time,
        lo.location_end_time,
        lo.status,
        lo.created_id,
        lo.created_dtm,
        lo.modified_id,
        lo.modified_dtm
   FROM org.location_operation lo 
  WHERE lo.status = 1';

IF in_location_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND lo.location_id  = ', in_location_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

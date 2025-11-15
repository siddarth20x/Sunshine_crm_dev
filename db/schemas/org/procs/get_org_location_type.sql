-- call org.get_org_location_type(@err, 'email');
-- call org.get_org_location_type(@err, null);

DROP PROCEDURE IF EXISTS org.get_org_location_type;

DELIMITER $$
CREATE PROCEDURE org.get_org_location_type(OUT error_code INT, 
                                            IN in_location_type_code VARCHAR(45),
                                            IN in_location_type_name VARCHAR(45)
                                              )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT c.location_type_id, 
        c.location_type_code,
        c.location_type_name,
        c.status,
        c.created_id,
        c.created_dtm,
        c.modified_id,
        c.modified_dtm
   FROM org.location_type c 
  WHERE c.status = 1';

IF in_location_type_code IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(c.location_type_code)  = ', '"', UPPER(in_location_type_code),'"');
END IF; 

IF in_location_type_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(c.location_type_name)  = ', '"',UPPER(in_location_type_name),'"');
END IF; 

SET @get_q = CONCAT(@get_q, '
 ORDER BY c.location_type_name');

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

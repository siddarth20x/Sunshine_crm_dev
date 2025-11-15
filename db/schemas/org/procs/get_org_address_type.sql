-- call org.get_org_address_type(@err, 'email');
-- call org.get_org_address_type(@err, null);

DROP PROCEDURE IF EXISTS org.get_org_address_type;

DELIMITER $$
CREATE PROCEDURE org.get_org_address_type(OUT error_code INT, 
                                              IN in_address_type_code VARCHAR(45),
                                              IN in_address_type_name VARCHAR(45)
                                              )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT a.address_type_id, 
        a.address_type_code,
        a.address_type_name,
        a.address_type_desc,
        a.status,
        a.created_id,
        a.created_dtm,
        a.modified_id,
        a.modified_dtm
   FROM org.address_type a 
  WHERE a.status = 1';

IF in_address_type_code IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(a.address_type_code)  = ','"', UPPER(in_address_type_code),'"');
END IF; 

IF in_address_type_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(a.address_type_name)  = ','"', UPPER(in_address_type_name),'"');
END IF; 

SET @get_q = CONCAT(@get_q, '
 ORDER BY a.address_type_name');

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

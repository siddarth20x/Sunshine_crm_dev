-- call org.get_org_location (@err, null, null, 1,null);
DELIMITER $$
DROP PROCEDURE IF EXISTS org.get_org_location;

CREATE PROCEDURE org.get_org_location(OUT error_code INT, 
                                              IN in_company_id BIGINT,
                                              IN in_location_id BIGINT,
                                              IN in_address_id BIGINT, 
                                              IN in_address_type_id MEDIUMINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT l.company_id,
        l.location_id,
        l.location_type_id,
        lt.location_type_code,
        l.location_name,
        l.location_code,
        CONCAT(l.location_name,"-",l.location_code,"-",a.address_id) AS location_name_with_code_id, 
        org.fn_get_org_full_address_by_id(a.address_id) AS full_address,
        a.address_id,
        a.address_name, 
        a.address_type_id, 
        at.address_type_name,
        at.address_type_code,
        a.address_line_1, 
        a.address_line_2, 
        a.address_line_3, 
        a.city, 
        a.state,
        a.country, 
        a.zipcode
   FROM org.address a,
        org.location l,
        org.location_type lt,
        org.address_type at
  WHERE a.location_id = l.location_id 
    AND a.address_type_id = at.address_type_id
    AND lt.location_type_id = l.location_type_id 
    AND l.status = 1
    AND a.status = 1 ';

IF in_company_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.company_id = ', in_company_id);
END IF;

IF in_location_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.location_id = ', in_location_id);
END IF;

IF in_address_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND a.address_id = ', in_address_id);
END IF; 

IF in_address_type_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND a.address_type_id = ', in_address_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

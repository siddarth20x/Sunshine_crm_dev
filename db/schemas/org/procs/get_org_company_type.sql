-- call org.get_org_company_type(@err, 'email');
-- call org.get_org_company_type(@err, null);

DROP PROCEDURE IF EXISTS org.get_org_company_type;

DELIMITER $$
CREATE PROCEDURE org.get_org_company_type(OUT error_code INT, 
											  IN in_company_type_id INT(11),
                                              IN in_company_type_name VARCHAR(45)
                                              )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT c.company_type_id, 
        c.company_type_name,
        c.company_type_desc,
        c.status,
        c.created_id,
        c.created_dtm,
        c.modified_id,
        c.modified_dtm
   FROM org.company_type c 
  WHERE c.status = 1';

IF in_company_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND c.company_type_id  = ', in_company_type_id);
END IF; 
IF in_company_type_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(c.company_type_name)  like ','"%',UPPER( in_company_type_name),'%"');
END IF;
SET @get_q = CONCAT(@get_q, '
 ORDER BY c.company_type_name');

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

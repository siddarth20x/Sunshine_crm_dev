-- call org.get_org_contact_dept_type (@err, NULL, NULL);

DROP PROCEDURE IF EXISTS org.get_org_contact_dept_type;

DELIMITER $$
CREATE PROCEDURE org.get_org_contact_dept_type(OUT error_code INT, 
					      IN in_contact_dept_type_id BIGINT,
                                              IN in_contact_dept_type_name VARCHAR(200)
                                              )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT ct.contact_dept_type_id, 
        ct.contact_dept_type_name,
        ct.contact_dept_type_desc,
        ct.status,
        ct.created_id,
        ct.created_dtm,
        ct.modified_id,
        ct.modified_dtm
   FROM org.contact_dept_type ct
  WHERE ct.status = 1';

IF in_contact_dept_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND ct.contact_dept_type_id   =', in_contact_dept_type_id);
END IF; 

IF in_contact_dept_type_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(ct.contact_dept_type_name)  like ','"%', UPPER(in_contact_dept_type_name),'%"');
END IF; 

SET @get_q = CONCAT(@get_q, '
 ORDER BY ct.contact_dept_type_name');

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

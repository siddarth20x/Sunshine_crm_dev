-- call org.get_org_contact (@err, 1,null, null,null);

DROP PROCEDURE IF EXISTS org.get_org_contact;

DELIMITER $$
CREATE PROCEDURE org.get_org_contact (OUT error_code INT, 
                                              IN in_contact_id BIGINT,
                                              IN in_company_id BIGINT,                                           
                                              IN in_contact_dept_type_id BIGINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT c.contact_id,
        c.company_id,
        c.contact_dept_type_id,
        cdt.contact_dept_type_name,
        c.contact_mode_list,
        c.designation,
        c.salutation,
        c.first_name, 
        c.last_name,  
        c.email, 
        c.phone, 
        c.phone_ext, 
        c.alternate_phone,
        c.fax,
        c.status, 
        c.created_id,
        c.created_dtm,
        c.modified_id, 
        c.modified_dtm
   FROM org.contact c,
        org.contact_dept_type cdt
  WHERE c.contact_dept_type_id = cdt.contact_dept_type_id
    AND c.status = 1 ';

IF in_contact_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND c.contact_id = ', in_contact_id);
END IF; 

IF in_company_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND c.company_id = ', in_company_id);
END IF; 

IF in_contact_dept_type_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND c.contact_dept_type_id = ', in_contact_dept_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

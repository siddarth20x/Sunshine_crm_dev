-- call org.edit_org_contact(@err,-2,1,1,1,'Mr.','fname','lname','email@email.com','555-555-5555','415','123123123','888',1);

DROP PROCEDURE IF EXISTS org.edit_org_contact;

DELIMITER $$
CREATE PROCEDURE org.edit_org_contact   (OUT error_code INT,
                                                IN in_app_user_id BIGINT, 
                                                IN in_contact_id BIGINT,
                                                IN in_company_id BIGINT,                                                
                                                IN in_contact_dept_type_id MEDIUMINT,
                                                IN in_contact_mode_list VARCHAR(1000),    
                                                IN in_designation VARCHAR(100),
                                                IN in_salutation VARCHAR(45),
                                                IN in_first_name VARCHAR(100), 
                                                IN in_last_name VARCHAR(100), 
                                                IN in_email_address VARCHAR(100), 
                                                IN in_phone VARCHAR(20), 
                                                IN in_phone_ext VARCHAR(10), 
                                                IN in_alternate_phone VARCHAR(20),
                                                IN in_fax VARCHAR(20),
                                                IN in_status TINYINT                                                
                                                )
                                                
BEGIN

SET error_code = -2;

UPDATE org.contact c
   SET c.contact_dept_type_id = IFNULL(in_contact_dept_type_id, contact_dept_type_id),
       c.company_id           = IFNULL(in_company_id, company_id),
       c.contact_mode_list    = CASE WHEN in_contact_mode_list IS NULL
                                     THEN c.contact_mode_list
                                     WHEN UPPER(in_contact_mode_list) LIKE '%OBJECT%'
                                     THEN c.contact_mode_list
                                     ELSE in_contact_mode_list
                                END,
       c.designation          = IFNULL(in_designation, designation),
       c.salutation           = IFNULL(in_salutation, salutation),
       c.first_name           = IFNULL(in_first_name, first_name),
       c.last_name            = IFNULL(in_last_name, last_name),
       c.email                = IFNULL(in_email_address, email),
       c.phone                = IFNULL(in_phone, phone),
       c.phone_ext            = IFNULL(in_phone_ext, phone_ext),
       c.alternate_phone      = IFNULL(in_alternate_phone, alternate_phone),
       c.fax                  = IFNULL(in_fax, fax),
       c.status               = IFNULL(in_status, status),
       c.modified_id          = IFNULL(in_app_user_id, modified_id)
 WHERE c.contact_id = in_contact_id; 

SET error_code=0;

END$$
DELIMITER ;

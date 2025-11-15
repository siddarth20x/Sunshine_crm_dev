--  call `crm`.edit_lead(@err,2,1,1,1,1,"INFOSYS","ACCOUNT EXECUTIVE","MR.","SOURABHA","BEHERA","SOUMYASOURABHA@CODESWIFT.IN","7327048634",NULL,NULL,NULL,NULL,1);
-- call `crm`.edit_lead(@err,2,1,1,1,1,"INFOSYS","ACCOUNT EXECUTIVE","MR.","SOURABHA","BEHERA","SOUMYASOURABHA@CODESWIFT.IN","7327048634",NULL,NULL,NULL,NULL,0);
DROP PROCEDURE IF EXISTS crm.edit_lead;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_lead (
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_lead_id BIGINT,
    IN in_source_type_id MEDIUMINT,
    IN in_lead_status_type_id MEDIUMINT,
    IN in_template_type_id MEDIUMINT,
    IN in_lead_company_name VARCHAR(100),
    IN in_designation VARCHAR(100),
    IN in_salutation VARCHAR(45),
    IN in_first_name VARCHAR(100),
    IN in_last_name VARCHAR(100),
    IN in_email_address VARCHAR(100),
    IN in_phone VARCHAR(20),
    IN in_phone_ext VARCHAR(10),
    IN in_alternate_phone VARCHAR(20),
    IN in_fax VARCHAR(20),
    IN in_website VARCHAR(100),
    IN in_status TINYINT
) 
BEGIN
SET
    error_code = -2;

UPDATE
    crm.leads l
SET
    l.source_type_id = IFNULL(in_source_type_id, source_type_id),
    l.lead_status_type_id = IFNULL(in_lead_status_type_id, lead_status_type_id),
    l.template_type_id = IFNULL(in_template_type_id, template_type_id),
    l.lead_company_name = IFNULL(in_lead_company_name, lead_company_name),
    l.designation = IFNULL(in_designation, designation),
    l.salutation = IFNULL(in_salutation, salutation),
    l.first_name = IFNULL(in_first_name, first_name),
    l.last_name = IFNULL(in_last_name, last_name),
    l.email = IFNULL(in_email_address, email),
    l.phone = IFNULL(in_phone, phone),
    l.phone_ext = IFNULL(in_phone_ext, phone_ext),
    l.alternate_phone = IFNULL(in_alternate_phone, alternate_phone),
    l.fax = IFNULL(in_fax, fax),
    l.website = IFNULL(in_website, website),
    l.status = IFNULL(in_status, status),
    l.modified_id = IFNULL(in_app_user_id, modified_id)
WHERE
    l.lead_id = in_lead_id;

SET
    error_code = 0;

END $$ 
DELIMITER ;
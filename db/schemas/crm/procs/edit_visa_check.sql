--  call `crm`.edit_visa_check(@err,3,1,'VISA_PASSPORT_NO','VISA_STATUS',CURRENT_TIMESTAMP,'VISA_FILE_NUMBER','VISA_EMIRATES','VISA_COMPANY','VISA_DESIGNATION','VISA_CONTACT');
DROP PROCEDURE IF EXISTS crm.edit_visa_check;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_visa_check(
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_lead_id BIGINT,
    IN in_task_id BIGINT,
    IN in_contact_mode_list VARCHAR(100),
    IN in_visa_check_id BIGINT,
    IN in_visa_passport_no VARCHAR(45),
    IN in_visa_status VARCHAR(45),
    IN in_visa_expiry_date TIMESTAMP,
    IN in_visa_file_number VARCHAR(45),
    IN in_visa_emirates VARCHAR(45),
    IN in_visa_company_name VARCHAR(45),
    IN in_visa_designation VARCHAR(45),
    IN in_visa_contact_no VARCHAR(45),
    IN in_new_emirates_id VARCHAR(45),
    IN in_visa_emirates_id VARCHAR(45),
    IN in_unified_number VARCHAR(45),
    IN in_status TINYINT
) 
BEGIN
SET error_code = -2;

UPDATE
    crm.visa_check
SET
    visa_check_id = IFNULL(in_visa_check_id, visa_check_id),
    lead_id = IFNULL(in_lead_id, lead_id),
    task_id = IFNULL(in_task_id, task_id),
    contact_mode_list = IFNULL(in_contact_mode_list, contact_mode_list),
    visa_passport_no = IFNULL(in_visa_passport_no, visa_passport_no),
    visa_status = IFNULL(in_visa_status, visa_status),
    visa_expiry_date = IFNULL(in_visa_expiry_date, visa_expiry_date),
    visa_file_number = IFNULL(in_visa_file_number, visa_file_number),
    visa_emirates = IFNULL(in_visa_emirates, visa_emirates),
    visa_company_name = IFNULL(in_visa_company_name, visa_company_name),
    visa_designation = IFNULL(in_visa_designation, visa_designation),
    visa_contact_no = IFNULL(in_visa_contact_no, visa_contact_no),
    new_emirates_id = IFNULL(in_new_emirates_id, new_emirates_id),
    visa_emirates_id = IFNULL(in_visa_emirates_id, visa_emirates_id),
    unified_number = IFNULL(in_unified_number, unified_number),
    status = IFNULL(in_status, status),
    modified_id = IFNULL(in_app_user_id, modified_id)
WHERE visa_check_id = in_visa_check_id;

SET error_code = 0;

END $$
DELIMITER ;
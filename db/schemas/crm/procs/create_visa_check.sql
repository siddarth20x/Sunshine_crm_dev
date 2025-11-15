-- call `crm`.create_visa_check(@err,3,1,'VISA_PASSPORT_NO','VISA_STATUS',CURRENT_TIMESTAMP,'VISA_FILE_NUMBER','VISA_EMIRATES','VISA_COMPANY','VISA_DESIGNATION','VISA_CONTACT',@ovckhid);
DROP PROCEDURE IF EXISTS `crm`.create_visa_check;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_visa_check(
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_lead_id BIGINT,
    IN in_task_id BIGINT,
    IN in_contact_mode_list VARCHAR(100),
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
    OUT out_visa_check_id BIGINT
) 
BEGIN
SET
    error_code = -2;

INSERT INTO
    `crm`.visa_check(
        visa_check_id,
        lead_id,
        task_id,
        contact_mode_list,
        visa_passport_no,
        visa_status,
        visa_expiry_date,
        visa_file_number,
        visa_emirates,
        visa_company_name,
        visa_designation,
        visa_contact_no,
        new_emirates_id,
        visa_emirates_id,
        unified_number,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
    )
VALUES
    (
        NULL,
        in_lead_id,
        in_task_id,
        IFNULL(in_contact_mode_list,""),
        IFNULL(in_visa_passport_no,""),
        IFNULL(in_visa_status,""),
        IFNULL(in_visa_expiry_date,""),
        IFNULL(in_visa_file_number,""),
        IFNULL(in_visa_emirates,""),
        IFNULL(in_visa_company_name,""),
        IFNULL(in_visa_designation,""),
        IFNULL(in_visa_contact_no,""),
        IFNULL(in_new_emirates_id,""),
        IFNULL(in_visa_emirates_id,""),
        IFNULL(in_unified_number,""),
        1,
        in_app_user_id,
        CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()
    )ON DUPLICATE KEY
UPDATE
       status = IFNULL(1, status),
       modified_id = IFNULL(in_app_user_id, modified_id),
       modified_dtm = IFNULL(CURRENT_TIMESTAMP(), modified_dtm),
       visa_check_id = LAST_INSERT_ID(visa_check_id);

SET out_visa_check_id = LAST_INSERT_ID();

COMMIT;

SET
    error_code = 0;

END $$ 
DELIMITER ;
-- call `crm`.create_mol_check(@err,3,1,'MOL_STATUS','MOL_WRK_PERMIT','MOL_COMPANY_NAME',CURRENT_TIMESTAMP,'MOL_SALARY','MOL_PASSPORT_NO',@omolckhid);
DROP PROCEDURE IF EXISTS `crm`.create_mol_check;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_mol_check(
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_lead_id BIGINT,
    IN in_task_id BIGINT,
    IN in_contact_mode_list VARCHAR(100),
    IN in_mol_status VARCHAR(45),
    IN in_mol_work_permit_no VARCHAR(45),
    IN in_mol_company_name VARCHAR(45),
    IN in_mol_expiry_date TIMESTAMP,
    IN in_mol_salary VARCHAR(45),
    IN in_mol_passport_no VARCHAR(45),
    OUT out_mol_check_id BIGINT
) 
BEGIN
SET error_code = -2;

INSERT INTO
    `crm`.mol_check(
        mol_check_id,
        lead_id,
        task_id,
        contact_mode_list,
        mol_status,
        mol_work_permit_no,
        mol_company_name,
        mol_expiry_date,
        mol_salary,
        mol_passport_no,
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
        IFNULL(in_mol_status,""),
        IFNULL(in_mol_work_permit_no,""),
        IFNULL(in_mol_company_name,""),
        IFNULL(in_mol_expiry_date,""),
        IFNULL(in_mol_salary,""),
        IFNULL(in_mol_passport_no,""),
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
       mol_check_id = LAST_INSERT_ID(mol_check_id);

SET out_mol_check_id = LAST_INSERT_ID();

COMMIT;

SET error_code = 0;

END$$ 
DELIMITER ;
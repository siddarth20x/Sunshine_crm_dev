--  call `crm`.edit_mol_check(@err,3,1,1,'MOL_STATUS_1','MOL_WRK_PERMIT_1','MOL_COMPANY_NAME_1',CURRENT_TIMESTAMP,'MOL_SALARY_1','MOL_PASSPORT_NO_1',1);
DROP PROCEDURE IF EXISTS crm.edit_mol_check;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_mol_check(
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_lead_id BIGINT,
    IN in_task_id BIGINT,
    IN in_contact_mode_list VARCHAR(100),
    IN in_mol_check_id BIGINT,
    IN in_mol_status VARCHAR(45),
    IN in_mol_work_permit_no VARCHAR(45),
    IN in_mol_company_name VARCHAR(45),
    IN in_mol_expiry_date TIMESTAMP,
    IN in_mol_salary VARCHAR(45),
    IN in_mol_passport_no VARCHAR(45),
    IN in_status TINYINT
) 
BEGIN
SET error_code = -2;

UPDATE
    crm.mol_check
SET
    mol_check_id = IFNULL(in_mol_check_id, mol_check_id),
    lead_id = IFNULL(in_lead_id, lead_id),
    task_id = IFNULL(in_task_id, task_id),
    contact_mode_list = IFNULL(in_contact_mode_list, contact_mode_list),
    mol_status = IFNULL(in_mol_status, mol_status),
    mol_work_permit_no = IFNULL(in_mol_work_permit_no, mol_work_permit_no),
    mol_company_name = IFNULL(in_mol_company_name, mol_company_name),
    mol_expiry_date = IFNULL(in_mol_expiry_date, mol_expiry_date),
    mol_salary = IFNULL(in_mol_salary, mol_salary),
    mol_passport_no = IFNULL(in_mol_passport_no, mol_passport_no),
    status = IFNULL(in_status, status),
    modified_id = IFNULL(in_app_user_id, modified_id)
WHERE mol_check_id = in_mol_check_id;

SET error_code = 0;

END $$
DELIMITER ;
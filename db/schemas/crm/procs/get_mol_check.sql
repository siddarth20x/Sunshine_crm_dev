-- call crm.get_mol_check(@err,null,null);
-- call crm.get_mol_check(@err,1,null);
-- call crm.get_mol_check(@err,1,1);
DROP PROCEDURE IF EXISTS crm.get_mol_check;

DELIMITER $$ 
CREATE PROCEDURE crm.get_mol_check(
    OUT error_code INT,
    IN in_mol_check_id BIGINT,
    IN in_lead_id BIGINT
) 

BEGIN
SET error_code = -2;

SET @get_q = '

SELECT mol.mol_check_id,      
       mol.lead_id, 
       mol.task_id, 
       mol.contact_mode_list,
       mol.mol_status, 
       mol.mol_work_permit_no,  
       mol.mol_company_name,  
       mol.mol_expiry_date,  
       mol.mol_salary,  
       mol.mol_passport_no,     
       mol.status,       
       mol.created_id,   
       mol.created_dtm,  
       mol.modified_id,
       mol.modified_dtm
  FROM crm.mol_check mol
  JOIN crm.leads l
    ON mol.lead_id = l.lead_id
WHERE mol.status = 1 

';

IF in_mol_check_id IS NOT NULL THEN
SET
     @get_q = CONCAT(
          @get_q,
          '
      AND mol.mol_check_id  = ',
          in_mol_check_id
     );

END IF;

IF in_lead_id IS NOT NULL THEN
SET
     @get_q = CONCAT(@get_q, '
      AND mol.lead_id  = ', in_lead_id);

END IF;

-- select @get_q;
PREPARE stmt
FROM @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$ 
DELIMITER ;
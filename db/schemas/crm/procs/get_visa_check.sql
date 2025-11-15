-- call crm.get_visa_check(@err,null,null);
-- call crm.get_visa_check(@err,1,null);
-- call crm.get_visa_check(@err,1,1);
DROP PROCEDURE IF EXISTS crm.get_visa_check;

DELIMITER $$ 
CREATE PROCEDURE crm.get_visa_check(
    OUT error_code INT,
    IN in_visa_check_id BIGINT,
    IN in_lead_id BIGINT
) 

BEGIN
SET error_code = -2;

SET @get_q = '

SELECT vc.visa_check_id,      
       vc.lead_id, 
       vc.task_id, 
       vc.contact_mode_list,
       vc.visa_passport_no, 
       vc.visa_status,  
       vc.visa_expiry_date,  
       vc.visa_file_number,  
       vc.visa_emirates,  
       vc.visa_company_name,     
       vc.visa_designation,  
       vc.visa_contact_no,  
       vc.new_emirates_id,  
       vc.visa_emirates_id,  
       vc.unified_number,  
       vc.status,       
       vc.created_id,   
       vc.created_dtm,  
       vc.modified_id,
       vc.modified_dtm
  FROM crm.visa_check vc
  JOIN crm.leads l
    ON vc.lead_id = l.lead_id
WHERE vc.status = 1 

';

IF in_visa_check_id IS NOT NULL THEN
SET
     @get_q = CONCAT(
          @get_q,
          '
      AND vc.visa_check_id  = ',
          in_visa_check_id
     );

END IF;

IF in_lead_id IS NOT NULL THEN
SET
     @get_q = CONCAT(@get_q, '
      AND vc.lead_id  = ', in_lead_id);

END IF;

-- select @get_q;
PREPARE stmt
FROM @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$ 
DELIMITER ;
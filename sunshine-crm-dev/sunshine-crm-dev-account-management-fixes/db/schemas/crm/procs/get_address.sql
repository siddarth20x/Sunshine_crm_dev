-- call crm.get_address(@err,null);
-- call crm.get_address(@err,45);
DROP PROCEDURE IF EXISTS crm.get_address;

DELIMITER $$ 
CREATE PROCEDURE crm.get_address(
  OUT error_code INT,
  IN in_lead_id BIGINT
) 

BEGIN
SET error_code = -2;

SET
  @get_q = '

SELECT a.address_id,      
       a.lead_id, 
       a.task_id, 
       a.address_name, 
       a.contact_mode_list,
       a.address_line_1,
       a.address_line_2,  
       a.address_line_3,  
       a.city,  
       a.state,  
       a.country,     
       a.zipcode,     
       a.address_type,     
       a.residence_type,     
       a.living_status,     
       a.photo,     
       a.current_location,     
       a.is_primary,  
       a.office_address,
       a.status,       
       a.created_id,   
       CONCAT(uc.first_name, " ", uc.last_name) AS created_by_full_name,
       a.created_dtm,  
       a.modified_id,
       CONCAT(um.first_name, " ", um.last_name) AS modified_by_full_name,
       a.modified_dtm
  FROM crm.address a
  JOIN crm.leads l
    ON a.lead_id = l.lead_id
  JOIN user.user uc
    ON a.created_id = uc.user_id
  JOIN user.user um
    ON a.modified_id = um.user_id
WHERE a.status = 1 

';

-- IF in_sq_check_id IS NOT NULL THEN
--      SET @get_q = CONCAT(@get_q, '
--       AND a.sq_check_id  = ', in_sq_check_id);
-- END IF; 
IF in_lead_id IS NOT NULL THEN
SET
  @get_q = CONCAT(
    @get_q,
    '
      AND a.lead_id  = ',
    in_lead_id
  );

END IF;

-- IF in_sq_parameter_type_id IS NOT NULL THEN
--      SET @get_q = CONCAT(@get_q, '
--       AND a.sq_parameter_type_id  = ', in_sq_parameter_type_id);
-- END IF; 
-- select @get_q;
PREPARE stmt FROM @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$ 
DELIMITER ;
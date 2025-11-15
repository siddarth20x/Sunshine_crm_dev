-- call crm.get_contacts(@err,null);
-- call crm.get_contacts(@err,45);
DROP PROCEDURE IF EXISTS crm.get_contacts;

DELIMITER $$ 
CREATE PROCEDURE crm.get_contacts(
  OUT error_code INT,
  IN in_lead_id BIGINT,
  IN in_display_latest TINYINT(4)
) 

BEGIN
SET error_code = -2;

SET
  @get_q = '

SELECT c.contact_id,      
       c.lead_id, 
       c.task_id, 
       c.contact_mode_list, 
       c.customer_name,
      --  c.last_name,  
       c.email,  
       c.phone,  
       c.phone_ext,  
       c.alternate_phone,     
       c.contact_name,     
       c.relationship,     
       c.contact_name_ph_no,     
       c.employment_status,     
       c.employment_type,     
       c.photo,     
       c.is_primary,  
       c.status,       
       c.created_id,   
       CONCAT(uc.first_name, " ", uc.last_name) AS created_by_full_name,
       c.created_dtm,  
       c.modified_id,
       CONCAT(um.first_name, " ", um.last_name) AS modified_by_full_name,
       c.modified_dtm
  FROM crm.contact c
  JOIN crm.leads l
    ON c.lead_id = l.lead_id
  JOIN user.user uc
    ON c.created_id = uc.user_id
  JOIN user.user um
    ON c.modified_id = um.user_id
 WHERE c.status = 1 

';

-- IF in_sq_check_id IS NOT NULL THEN
--      SET @get_q = CONCAT(@get_q, '
--       AND c.sq_check_id  = ', in_sq_check_id);
-- END IF; 
IF in_lead_id IS NOT NULL THEN
SET
  @get_q = CONCAT(
    @get_q,
    '
      AND c.lead_id  = ',
    in_lead_id
  );

END IF;

IF in_display_latest = 1 THEN
     SET @get_q = CONCAT(@get_q, '
      ORDER BY c.contact_id DESC LIMIT 1; ');
END IF;


-- select @get_q;
PREPARE stmt FROM @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$ 
DELIMITER ;
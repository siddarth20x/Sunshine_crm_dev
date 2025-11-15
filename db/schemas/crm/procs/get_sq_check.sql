-- call crm.get_sq_check(@err,null,null,null);
-- call crm.get_sq_check(@err,1,null,null);
-- call crm.get_sq_check(@err,1,1,null);


DROP PROCEDURE IF EXISTS crm.get_sq_check;

DELIMITER $$
CREATE PROCEDURE crm.get_sq_check(OUT error_code INT, 
                                  IN in_sq_check_id BIGINT,
                                  IN in_lead_id BIGINT,
                                  IN in_sq_parameter_type_id BIGINT
                                  )
BEGIN
SET error_code = -2;

SET @get_q = '

SELECT sqc.sq_check_id,      
       sqc.lead_id, 
       sqc.task_id, 
       sqc.sq_parameter_type_id, 
       sqpt.sq_parameter_type_name,
       sqc.scoring1_status,  
       sqc.scoring1,  
       sqc.scoring2_status,  
       sqc.scoring2,  
       sqc.scoring3_status,     
       sqc.scoring3,  
       sqc.status,       
       sqc.created_id,   
       sqc.created_dtm,  
       sqc.modified_id,
       sqc.modified_dtm
  FROM crm.sq_check sqc
  JOIN crm.sq_parameter_type sqpt
    ON sqc.sq_parameter_type_id = sqpt.sq_parameter_type_id
  JOIN crm.leads l
    ON sqc.lead_id = l.lead_id
WHERE sqc.status = 1 

';


IF in_sq_check_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND sqc.sq_check_id  = ', in_sq_check_id);
END IF; 

IF in_lead_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND sqc.lead_id  = ', in_lead_id);
END IF; 

IF in_sq_parameter_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND sqc.sq_parameter_type_id  = ', in_sq_parameter_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

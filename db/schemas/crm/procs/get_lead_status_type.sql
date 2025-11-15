-- call crm.get_lead_status_type(@err,null);

DROP PROCEDURE IF EXISTS crm.get_lead_status_type;

DELIMITER $$
CREATE PROCEDURE crm.get_lead_status_type(OUT error_code INT, 
			            IN in_lead_status_type_id MEDIUMINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT lst.lead_status_type_id, 
        lst.lead_status_type_name,
        lst.status,
        lst.created_id,
        lst.created_dtm,
        lst.modified_id,
        lst.modified_dtm
   FROM crm.lead_status_type lst 
  WHERE lst.status = 1 ';

IF in_lead_status_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND lst.lead_status_type_id  = ', in_lead_status_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

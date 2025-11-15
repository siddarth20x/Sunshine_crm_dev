-- This function will max contact mode by modified dtm associated to the lead
-- SELECT crm.fn_get_max_contact_mode_by_lead_id(652);

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_max_contact_mode_by_lead_id$$

CREATE FUNCTION crm.fn_get_max_contact_mode_by_lead_id( in_lead_id BIGINT)

RETURNS VARCHAR(20) DETERMINISTIC

BEGIN

DECLARE v_last_mode_of_contact VARCHAR(20);

SET v_last_mode_of_contact = NULL;

IF in_lead_id IS NOT NULL THEN 

SELECT mode_of_contact 
  INTO v_last_mode_of_contact
FROM crm.task
WHERE lead_id = in_lead_id
ORDER BY modified_dtm DESC
LIMIT 1;
                         
RETURN v_last_mode_of_contact;
 
END IF;
END$$
DELIMITER ;

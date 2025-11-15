-- This function will max target dtm associated to the user for follow up task
-- SELECT crm.fn_get_next_follow_up_dtm(9,NULL);
-- SELECT crm.fn_get_next_follow_up_dtm(NULL,7);
-- SELECT crm.fn_get_next_follow_up_dtm(20,7);

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_next_follow_up_dtm$$

CREATE FUNCTION crm.fn_get_next_follow_up_dtm( in_user_id BIGINT, in_lead_id BIGINT )

RETURNS TIMESTAMP DETERMINISTIC

BEGIN

DECLARE v_next_follow_up_dtm TIMESTAMP;

SET v_next_follow_up_dtm = NULL;

IF in_user_id IS NOT NULL AND in_lead_id IS NULL THEN 
SELECT MAX(t.target_dtm)
  INTO v_next_follow_up_dtm
  FROM crm.leads l 
  JOIN crm.task t
    ON l.lead_id = t.lead_id
  JOIN crm.task_type tt
    ON ( t.task_type_id = tt.task_type_id
         AND
         tt.task_type_name = "FOLLOW UP")
 WHERE l.created_id = in_user_id;
 
 RETURN v_next_follow_up_dtm;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NULL THEN 
SELECT MAX(t.target_dtm)
  INTO v_next_follow_up_dtm
  FROM crm.leads l 
  JOIN crm.task t
    ON l.lead_id = t.lead_id
  JOIN crm.task_type tt
    ON ( t.task_type_id = tt.task_type_id
         AND
         tt.task_type_name = "FOLLOW UP")
 WHERE l.lead_id = in_lead_id;
 
 RETURN v_next_follow_up_dtm;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NOT NULL THEN 
SELECT MAX(t.target_dtm)
  INTO v_next_follow_up_dtm
  FROM crm.leads l 
  JOIN crm.task t
    ON l.lead_id = t.lead_id
  JOIN crm.task_type tt
    ON ( t.task_type_id = tt.task_type_id
         AND
         tt.task_type_name = "FOLLOW UP")
 WHERE l.created_id = in_user_id
   AND l.lead_id = in_lead_id;
  
 RETURN v_next_follow_up_dtm;
 
END IF;

END$$
DELIMITER ;

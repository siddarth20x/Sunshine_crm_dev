-- This function will max activity dtm associated to the user
-- SELECT crm.fn_get_last_activity_dtm(9,NULL);
-- SELECT crm.fn_get_last_activity_dtm(NULL,4);

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_last_activity_dtm$$

CREATE FUNCTION crm.fn_get_last_activity_dtm( in_user_id BIGINT, in_lead_id BIGINT )

RETURNS TIMESTAMP DETERMINISTIC

BEGIN

DECLARE v_last_activity_dtm TIMESTAMP;

SET v_last_activity_dtm = NULL;

IF in_user_id IS NOT NULL AND in_lead_id IS NULL THEN
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log 
 WHERE created_id = in_user_id;
 
 RETURN v_last_activity_dtm;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NULL THEN
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log 
 WHERE lead_id = in_lead_id;
 
 RETURN v_last_activity_dtm;
 
END IF;

IF in_user_id IS NOT NULL AND in_lead_id IS NOT NULL THEN 
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log 
 WHERE created_id = in_user_id
   AND lead_id = in_lead_id;
 
 RETURN v_last_activity_dtm;
 
END IF;
END$$
DELIMITER ;

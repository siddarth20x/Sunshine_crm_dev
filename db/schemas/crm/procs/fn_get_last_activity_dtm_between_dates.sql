-- This function will max activity dtm associated to the user
-- SELECT crm.fn_get_last_activity_dtm_between_dates(8,NULL,'2025-04-01 11:07:35','2025-05-31 07:39:03');
-- SELECT crm.fn_get_last_activity_dtm_between_dates(NULL,96,'2025-04-01 11:07:35','2025-05-31 07:39:03');

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_last_activity_dtm_between_dates$$

CREATE FUNCTION crm.fn_get_last_activity_dtm_between_dates( 
                                         in_user_id BIGINT, 
                                         in_lead_id BIGINT, 
									     in_start_dtm TIMESTAMP,
                                         in_end_dtm TIMESTAMP
                                         )

RETURNS TIMESTAMP DETERMINISTIC

BEGIN

DECLARE v_last_activity_dtm TIMESTAMP;

SET v_last_activity_dtm = NULL;

IF in_user_id IS NOT NULL AND in_lead_id IS NULL THEN
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log al
 WHERE created_id = in_user_id
   AND al.activity_dtm >= in_start_dtm
   AND al.activity_dtm < in_end_dtm;
 
 RETURN v_last_activity_dtm;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NULL THEN
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log al
 WHERE lead_id = in_lead_id
   AND al.activity_dtm >= in_start_dtm
   AND al.activity_dtm < in_end_dtm;
 
 RETURN v_last_activity_dtm;
 
END IF;

IF in_user_id IS NOT NULL AND in_lead_id IS NOT NULL THEN 
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log al
 WHERE created_id = in_user_id
   AND lead_id = in_lead_id
   AND al.activity_dtm >= in_start_dtm
   AND al.activity_dtm < in_end_dtm;
 
 RETURN v_last_activity_dtm;
 
END IF;
END$$
DELIMITER ;

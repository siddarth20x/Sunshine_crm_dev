-- This function will return the leads having activity log within the given timestamp
-- SELECT user.fn_get_first_activity_after_upload(76,"2025-02-21","2025-02-25");
-- SELECT user.fn_get_first_activity_after_upload(78,"2025-02-24","2025-02-25");

DELIMITER $$

DROP FUNCTION IF EXISTS user.fn_get_first_activity_after_upload$$

CREATE FUNCTION user.fn_get_first_activity_after_upload( in_lead_id BIGINT, 
                                                          in_start_dtm TIMESTAMP, 
                                                          in_end_dtm TIMESTAMP)

RETURNS TIMESTAMP DETERMINISTIC

BEGIN

DECLARE v_first_activity_dtm TIMESTAMP;

SET v_first_activity_dtm = NULL;


IF in_lead_id IS NOT NULL THEN 

SELECT MIN(activity_dtm)  
  INTO v_first_activity_dtm
  FROM (
SELECT lead_id, activity_dtm, GROUP_CONCAT(DISTINCT activity_type) AS activity_type
FROM crm.activity_log al
 WHERE al.activity_dtm >= in_start_dtm
   AND al.activity_dtm < in_end_dtm
   AND al.lead_id = in_lead_id
 GROUP BY lead_id, activity_dtm
 ) temp
 WHERE activity_type NOT LIKE "%NEW_ACCOUNT%";

RETURN v_first_activity_dtm;

END IF;

END$$
DELIMITER ;

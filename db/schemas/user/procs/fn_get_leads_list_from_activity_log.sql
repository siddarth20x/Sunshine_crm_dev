-- This function will return the leads having activity log within the given timestamp
-- SELECT user.fn_get_leads_list_from_activity_log("2025-02-03","2025-02-04",NULL);
-- SELECT user.fn_get_leads_list_from_activity_log("2025-02-01","2025-02-07","daily-report");
-- SELECT user.fn_get_leads_list_from_activity_log("2025-02-01","2025-02-07","touched-untouched-report");
/* Allowed report name params 
daily-report		
contactable-non-contactable-report		
touched-untouched-report
15-30-days-not-working-report		
projection-report		
final-feedback-report	
feedback-for-bank-report
*/

DELIMITER $$

DROP FUNCTION IF EXISTS user.fn_get_leads_list_from_activity_log$$

CREATE FUNCTION user.fn_get_leads_list_from_activity_log( in_start_dtm TIMESTAMP, 
                                                          in_end_dtm TIMESTAMP, 
                                                          in_report_name VARCHAR(100))

RETURNS LONGTEXT DETERMINISTIC

BEGIN

DECLARE v_leads_id_list LONGTEXT;

SET v_leads_id_list = '';

IF in_report_name = "touched-untouched-report" THEN 
SELECT GROUP_CONCAT(DISTINCT al.lead_id) AS leads_id
  INTO v_leads_id_list
  FROM crm.activity_log al
 WHERE al.activity_dtm >= in_start_dtm
   AND al.activity_dtm < in_end_dtm;
RETURN v_leads_id_list;
ELSE 
SELECT GROUP_CONCAT(DISTINCT temp.lead_id)  AS leads_id 
  INTO v_leads_id_list
  FROM (
SELECT lead_id, activity_dtm, GROUP_CONCAT(DISTINCT activity_type) AS activity_type
FROM crm.activity_log al
 WHERE al.activity_dtm >= in_start_dtm
   AND al.activity_dtm < in_end_dtm
 GROUP BY lead_id, activity_dtm
 ) temp
 WHERE activity_type NOT LIKE "%NEW_ACCOUNT%";
RETURN v_leads_id_list;
END IF;



END$$
DELIMITER ;

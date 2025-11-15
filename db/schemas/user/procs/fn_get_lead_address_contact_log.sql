-- This function will return the leads associated to the user
-- SELECT user.fn_get_lead_address_contact_log(1, '2024-01-01', '2025-01-02');

DELIMITER $$

DROP FUNCTION IF EXISTS user.fn_get_lead_address_contact_log$$

CREATE FUNCTION user.fn_get_lead_address_contact_log ( in_lead_id BIGINT, 
                                                       in_start_dtm TIMESTAMP, 
                                                       in_end_dtm TIMESTAMP )

RETURNS LONGTEXT DETERMINISTIC

BEGIN

DECLARE v_address_log LONGTEXT;
DECLARE v_contact_log LONGTEXT;
DECLARE v_address_contact_log LONGTEXT;
DECLARE v_end_dtm TIMESTAMP DEFAULT NULL;

SET v_end_dtm = DATE_ADD(in_end_dtm, INTERVAL 1 DAY);

SELECT GROUP_CONCAT(activity_dtm, activity_detail)
  INTO v_contact_log 
  FROM crm.activity_log 
 WHERE activity_doc_type = "C"
   AND lead_id = in_lead_id
   AND activity_dtm >= in_start_dtm
   AND activity_dtm < v_end_dtm
 GROUP BY lead_id;

SELECT GROUP_CONCAT(activity_dtm, activity_detail)
  INTO v_address_log 
  FROM crm.activity_log 
 WHERE activity_doc_type = "A"
   AND lead_id = in_lead_id
   AND activity_dtm >= in_start_dtm
   AND activity_dtm < v_end_dtm
 GROUP BY lead_id;
   
SET v_address_contact_log = CONCAT("CONTACT INFO UPDATE - ", IFNULL(v_contact_log, ""), '\n', "ADDRESS INFO UPDATE - ", IFNULL(v_address_log, ""));
-- RETURN v_contact_log;
RETURN v_address_contact_log;

END$$
DELIMITER ;

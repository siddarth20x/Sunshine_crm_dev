-- call report.get_inactive_user_report(@err,8, '2025-04-01 11:07:35', '2025-05-31 07:39:03', 28);
-- call report.get_inactive_user_report(@err,8, '2025-04-25 11:07:35', '2025-05-02 07:39:03', 28);
DELIMITER $$

DROP PROCEDURE IF EXISTS report.get_inactive_user_report$$

CREATE PROCEDURE report.get_inactive_user_report(
    OUT error_code INT,
    IN in_app_user_id INT,
    IN in_start_dtm TIMESTAMP,
    IN in_end_dtm TIMESTAMP,
    IN in_company_id INT
)
BEGIN

DECLARE v_leads_id_list LONGTEXT DEFAULT '';

SET error_code = -2;

SELECT user.fn_get_user_leads_id_list(in_app_user_id, in_company_id) INTO v_leads_id_list;

SELECT temp.full_name,
	   temp.roles,
       temp.last_login,
       temp.last_activity_dtm,
       CASE WHEN temp.last_activity_dtm IS NULL 
            THEN TIMESTAMPDIFF(MINUTE, temp.report_start_time, CURRENT_TIMESTAMP)
            ELSE temp.idle_time_in_mins
		END idle_time_in_mins,
       temp.report_start_time,
       temp.report_end_time
  FROM (
SELECT u.user_id, 
       CONCAT(u.first_name,' ', u.last_name) AS full_name,
       GROUP_CONCAT(DISTINCT r.role_name) AS roles,
       u.last_login,
       crm.fn_get_last_activity_dtm_between_dates(u.user_id, NULL,in_start_dtm,in_end_dtm) AS last_activity_dtm,
       IF((TIMESTAMPDIFF(MINUTE, crm.fn_get_last_activity_dtm_between_dates(u.user_id, NULL,in_start_dtm,in_end_dtm), CURRENT_TIMESTAMP)) < 1, 0, (TIMESTAMPDIFF(MINUTE, crm.fn_get_last_activity_dtm_between_dates(u.user_id, NULL,in_start_dtm,in_end_dtm), CURRENT_TIMESTAMP))) AS idle_time_in_mins,
       in_start_dtm AS report_start_time,
       in_end_dtm AS report_end_time
  FROM user.user u 
  JOIN user.user_role_company urc
    ON u.user_id = urc.user_id
  JOIN user.role r
    ON ( urc.role_id = r.role_id 
   AND r.role_name NOT IN ('SUPERUSER','ADMIN') )
  LEFT OUTER JOIN crm.activity_log al
    ON ( u.user_id = al.created_id
   AND al.activity_dtm >= in_start_dtm AND al.activity_dtm < in_end_dtm)
 -- WHERE al.lead_id IN (IFNULL(v_leads_id_list,''))
 GROUP BY u.user_id
 ) temp;

/* 

-- 2-May-2025 : Ravikiran Prabhu
-- Commenting old logic, making it entirely static. 

SET @q = "";

SET @q = CONCAT(@q, "

SELECT CONCAT(u.first_name,' ', u.last_name) AS full_name,
       GROUP_CONCAT(DISTINCT r.role_name) AS roles,
       u.last_login,
       crm.fn_get_last_activity_dtm(u.user_id, NULL) AS last_activity_dtm,
       IF((TIMESTAMPDIFF(MINUTE, crm.fn_get_last_activity_dtm(u.user_id, NULL), u.last_login)) < 1, 0, (TIMESTAMPDIFF(MINUTE, crm.fn_get_last_activity_dtm(u.user_id, NULL), u.last_login))) AS idle_time_in_mins,
");

IF in_start_dtm IS NOT NULL THEN
SET @q = CONCAT(@q, "'", in_start_dtm, "'", "
       AS report_start_time,
");
ELSE 
SET @q = CONCAT(@q, "
       CURRENT_TIMESTAMP AS report_start_time,
");
END IF;

IF in_end_dtm IS NOT NULL THEN
SET @q = CONCAT(@q, "'", in_end_dtm, "'", "
       AS report_end_time
");
ELSE 
SET @q = CONCAT(@q, "
       CURRENT_TIMESTAMP AS report_end_time
");
END IF;

SET @q = CONCAT(@q, "
  FROM user.user u
  JOIN user.user_role_company urc
    ON u.user_id = urc.user_id
  JOIN user.role r
    ON urc.role_id = r.role_id 
   AND r.role_name NOT IN ('SUPERUSER','ADMIN')
   AND NOT EXISTS ( SELECT 1 
                     FROM crm.activity_log al
                     WHERE u.user_id = al.created_id                      
    
    ");
    
IF in_start_dtm IS NOT NULL THEN
SET @q = CONCAT(@q, " AND al.activity_dtm >= ", "'", in_start_dtm, "'");
END IF;

IF in_end_dtm IS NOT NULL THEN
SET @q = CONCAT(@q, " AND al.activity_dtm < ", "'", in_end_dtm, "'");
END IF;

-- SET @q = CONCAT(@q, " AND FIND_IN_SET( al.lead_id, ","'", IFNULL(v_leads_id_list,''), "'"); 

SET @get_q = CONCAT(@get_q, " AND al.lead_id IN ( ", IFNULL(v_leads_id_list,''), ")"); 

SET @q = CONCAT(@q, " 

)");

-- SET @q = CONCAT(@q, " )

SET @q = CONCAT(@q, " 

GROUP BY u.user_id;

");
 
-- SELECT @q;
PREPARE stmt FROM @q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

*/

SET error_code = 0;

END$$

DELIMITER ;
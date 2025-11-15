-- call crm.get_lead_stats (@err,9,9,NULL,NULL); 
-- call crm.get_lead_stats (@err,2,9,"2025-05-01",CURRENT_DATE); 

DROP PROCEDURE IF EXISTS crm.get_lead_stats;

DELIMITER $$
CREATE PROCEDURE crm.get_lead_stats (OUT error_code INT, 
                                     IN in_app_user_id BIGINT,
                                     IN in_company_id BIGINT,
                                     IN in_start_dtm TIMESTAMP,
                                     IN in_end_dtm TIMESTAMP
)
                                              
BEGIN
DECLARE v_leads_id_list LONGTEXT;
SET error_code = -2;

SELECT user.fn_get_user_leads_id_list(in_app_user_id, in_company_id) INTO v_leads_id_list;

SET @get_q = "";

SET @get_q = CONCAT(@get_q, '
SELECT "pending_15_days" AS param_name,
       COUNT(DISTINCT lead_id) AS param_value,
       IFNULL(GROUP_CONCAT(DISTINCT lead_id),0) AS lead_id_list
FROM(
SELECT lead_id,  last_activity_date, DATEDIFF(CURRENT_DATE, last_activity_date) AS pending_days
FROM (
SELECT lead_id, MAX(DATE(activity_dtm)) AS last_activity_date
  FROM (
SELECT al.lead_id, activity_dtm, GROUP_CONCAT(DISTINCT activity_type) AS activity_type
FROM crm.activity_log al
JOIN crm.leads l
  ON ( al.lead_id = l.lead_id AND l.allocation_type IN ("monthly", "existing"))
 WHERE al.is_uploaded_record = 0

');

IF in_start_dtm IS NOT NULL THEN
SET @get_q = CONCAT(@get_q, " AND al.activity_dtm >= ", "'", in_start_dtm, "'");
END IF;

IF in_end_dtm IS NOT NULL THEN
SET @get_q = CONCAT(@get_q, " AND al.activity_dtm < ", "'", in_end_dtm, "'");
END IF;

SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( al.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") "); 

-- SET @get_q = CONCAT(@get_q, '
-- SELECT "pending_15_days" AS param_name,
-- 	SUM(pending_accounts) AS param_value,
--     lead_id_list
--   FROM (
-- SELECT DATE_FORMAT(l.modified_dtm, "%Y-%m-%d") AS last_touched, 
--        DATEDIFF(CURRENT_DATE, DATE_FORMAT(l.modified_dtm, "%Y-%m-%d")) AS pending_days,
--        COUNT(1) AS pending_accounts,
--        GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
--   FROM crm.leads l
-- --  JOIN crm.lead_status_type lst
-- --    ON l.lead_status_type_id = lst.lead_status_type_id
-- --   AND lst.lead_status_type_name = "PENDING" 
--  WHERE 1 = 1 ');
--    
-- IF in_start_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm >= ", "'", in_start_dtm, "'");
-- END IF;

-- IF in_end_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm < ", "'", in_end_dtm, "'");
-- END IF;

-- SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") "); 

-- SET @get_q = CONCAT(@get_q, '
--  GROUP BY DATE_FORMAT(l.modified_dtm, "%Y-%m-%d"), DATEDIFF(CURRENT_DATE, DATE_FORMAT(l.modified_dtm, "%Y-%m-%d"))
-- ) a 
-- WHERE a.pending_days < 15 AND a.pending_days > 0
-- ');

SET @get_q = CONCAT(@get_q, ' 
GROUP BY al.lead_id, al.activity_dtm
 ) temp
 -- WHERE activity_type NOT LIKE "%NEW_ACCOUNT%" 
 GROUP BY lead_id
 ) otemp
) a
WHERE a.pending_days < 15 AND a.pending_days > 0
 ');

SET @get_q = CONCAT(@get_q, ' UNION ' );


-- SET @get_q = CONCAT(@get_q, '
-- SELECT "pending_30_days" AS param_name,
-- 	SUM(pending_accounts) AS param_value,
--     lead_id_list
--   FROM (
-- SELECT DATE_FORMAT(l.modified_dtm, "%Y-%m-%d") AS last_touched, 
--        DATEDIFF(CURRENT_DATE, DATE_FORMAT(l.modified_dtm, "%Y-%m-%d")) AS pending_days,
--        COUNT(1) AS pending_accounts,
--        GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
--   FROM crm.leads l
-- --  JOIN crm.lead_status_type lst
-- --    ON l.lead_status_type_id = lst.lead_status_type_id
-- --   AND lst.lead_status_type_name = "PENDING" 
--  WHERE 1 = 1 ');
--    
-- IF in_start_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm >= ", "'", in_start_dtm, "'");
-- END IF;

-- IF in_end_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm < ", "'", in_end_dtm, "'");
-- END IF;

-- SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") "); 

-- SET @get_q = CONCAT(@get_q, '
--  GROUP BY DATE_FORMAT(l.modified_dtm, "%Y-%m-%d"), DATEDIFF(CURRENT_DATE, DATE_FORMAT(l.modified_dtm, "%Y-%m-%d"))
-- ) a 
-- WHERE a.pending_days > 0
-- ');

-- SET @get_q = CONCAT(@get_q, ' GROUP BY param_name, lead_id_list ');

-- SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '
SELECT "pending_30_days" AS param_name,
       COUNT(DISTINCT lead_id) AS param_value,
       IFNULL(GROUP_CONCAT(DISTINCT lead_id),0) AS lead_id_list
FROM(
SELECT lead_id,  last_activity_date, DATEDIFF(CURRENT_DATE, last_activity_date) AS pending_days
FROM (
SELECT lead_id, MAX(DATE(activity_dtm)) AS last_activity_date
  FROM (
SELECT al.lead_id, activity_dtm, GROUP_CONCAT(DISTINCT activity_type) AS activity_type
FROM crm.activity_log al
JOIN crm.leads l
  ON ( al.lead_id = l.lead_id AND l.allocation_type IN ("monthly", "existing"))
 WHERE al.is_uploaded_record = 0

');

IF in_start_dtm IS NOT NULL THEN
SET @get_q = CONCAT(@get_q, " AND al.activity_dtm >= ", "'", in_start_dtm, "'");
END IF;

IF in_end_dtm IS NOT NULL THEN
SET @get_q = CONCAT(@get_q, " AND al.activity_dtm < ", "'", in_end_dtm, "'");
END IF;

SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( al.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") "); 

-- SET @get_q = CONCAT(@get_q, '
-- SELECT "pending_15_days" AS param_name,
-- 	SUM(pending_accounts) AS param_value,
--     lead_id_list
--   FROM (
-- SELECT DATE_FORMAT(l.modified_dtm, "%Y-%m-%d") AS last_touched, 
--        DATEDIFF(CURRENT_DATE, DATE_FORMAT(l.modified_dtm, "%Y-%m-%d")) AS pending_days,
--        COUNT(1) AS pending_accounts,
--        GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
--   FROM crm.leads l
-- --  JOIN crm.lead_status_type lst
-- --    ON l.lead_status_type_id = lst.lead_status_type_id
-- --   AND lst.lead_status_type_name = "PENDING" 
--  WHERE 1 = 1 ');
--    
-- IF in_start_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm >= ", "'", in_start_dtm, "'");
-- END IF;

-- IF in_end_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm < ", "'", in_end_dtm, "'");
-- END IF;

-- SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") "); 

-- SET @get_q = CONCAT(@get_q, '
--  GROUP BY DATE_FORMAT(l.modified_dtm, "%Y-%m-%d"), DATEDIFF(CURRENT_DATE, DATE_FORMAT(l.modified_dtm, "%Y-%m-%d"))
-- ) a 
-- WHERE a.pending_days < 15 AND a.pending_days > 0
-- ');

SET @get_q = CONCAT(@get_q, ' 
GROUP BY al.lead_id, al.activity_dtm
 ) temp
 -- WHERE activity_type NOT LIKE "%NEW_ACCOUNT%"
 GROUP BY lead_id
 ) otemp
) a
WHERE a.pending_days > 0
 ');

SET @get_q = CONCAT(@get_q, ' UNION ' );


SET @get_q = CONCAT(@get_q, '

SELECT "accounts_allocated" AS param_name,
       SUM(accounts_allocated) AS param_value,
       lead_id_list
  FROM (
SELECT COUNT(1) AS accounts_allocated,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
 WHERE 1 = 1 
' );

-- Remove date filtering for accounts_allocated to show all allocated accounts
-- IF in_start_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm >= ", "'", in_start_dtm, "'");
-- END IF;

-- IF in_end_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm < ", "'", in_end_dtm, "'");
-- END IF;

SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") ");    
   
SET @get_q = CONCAT(@get_q, ' ) b ');


SET @get_q = CONCAT(@get_q, ' GROUP BY param_name, lead_id_list ');

SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '

SELECT "accounts_touched" AS param_name,
       COUNT(DISTINCT l.lead_id) AS param_value,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
  JOIN crm.activity_log al
    ON l.lead_id = al.lead_id
   AND al.is_touched = 1
 WHERE 1 = 1
   AND FIND_IN_SET( l.lead_id, IFNULL(v_leads_id_list,"") )
   AND al.activity_type NOT LIKE '%NEW_ACCOUNT%'
');

-- SET @get_q = CONCAT(@get_q, '

-- SELECT "accounts_touched" AS param_name,
--        SUM(accounts_touched) AS param_value
--   FROM (
-- SELECT COUNT(1) AS accounts_touched
--   FROM crm.leads l
--   JOIN crm.lead_status_type lst
--     ON l.lead_status_type_id = lst.lead_status_type_id
--    AND lst.lead_status_type_name = "IN PROGRESS"
--  WHERE 1 = 1 
-- ' );

-- IF in_start_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm >= ", "'", in_start_dtm, "'");
-- END IF;

-- IF in_end_dtm IS NOT NULL THEN
-- SET @get_q = CONCAT(@get_q, " AND l.modified_dtm < ", "'", in_end_dtm, "'");
-- END IF;

-- SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ") ");    
   
-- SET @get_q = CONCAT(@get_q, ' ) c ');


SET @get_q = CONCAT(@get_q, ' GROUP BY param_name ');

SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '

SELECT "total_outstanding_amount" AS param_name,
       SUM(lpl.total_outstanding_amount) AS param_value,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.leads_payment_ledger lpl
  JOIN crm.leads l
    ON lpl.lead_id = l.lead_id
   AND lpl.status = 1 
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
 WHERE 1 = 1 
   AND FIND_IN_SET( l.lead_id, IFNULL(v_leads_id_list,"") )
');

SET @get_q = CONCAT(@get_q, ' GROUP BY param_name ');

SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '

SELECT "total_collections" AS param_name,
       SUM(lpl.last_paid_amount) AS param_value,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.leads_payment_ledger lpl 
  JOIN crm.leads l
    ON lpl.lead_id = l.lead_id
   AND lpl.status = 1 
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
 WHERE 1 = 1 
   AND FIND_IN_SET( l.lead_id, IFNULL(v_leads_id_list,"") )
');

SET @get_q = CONCAT(@get_q, ' GROUP BY param_name ');


SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '

SELECT "total_follow_up" AS param_name,
       COUNT(DISTINCT l.lead_id) AS param_value,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.task t
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id
   AND tt.task_type_name = "FOLLOW UP"
  JOIN crm.leads l
    ON t.lead_id = l.lead_id
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
 WHERE 1 = 1 
   AND FIND_IN_SET( l.lead_id, IFNULL(v_leads_id_list,"") )
');

SET @get_q = CONCAT(@get_q, ' GROUP BY param_name ');

SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '

SELECT "total_follow_up_today" AS param_name,
       COUNT(DISTINCT l.lead_id) AS param_value,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.task t
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id
   AND tt.task_type_name = "FOLLOW UP"
   AND DATE(t.target_dtm) = CURRENT_DATE
  JOIN crm.leads l
    ON t.lead_id = l.lead_id
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
 WHERE 1 = 1 
   AND FIND_IN_SET( l.lead_id, IFNULL(v_leads_id_list,"") )
');

SET @get_q = CONCAT(@get_q, ' GROUP BY param_name ');

SET @get_q = CONCAT(@get_q, ' UNION ' );

SET @get_q = CONCAT(@get_q, '

SELECT "accounts_untouched" AS param_name,
       COUNT(DISTINCT l.lead_id) AS param_value,
       GROUP_CONCAT(DISTINCT l.lead_id) AS lead_id_list
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED")
   AND l.allocation_type IN ("monthly", "existing")
  LEFT JOIN (
    SELECT DISTINCT al.lead_id
      FROM crm.activity_log al
     WHERE al.is_touched = 1
       AND al.activity_type NOT LIKE '%NEW_ACCOUNT%'
  ) touched_leads ON l.lead_id = touched_leads.lead_id
 WHERE touched_leads.lead_id IS NULL
   AND FIND_IN_SET( l.lead_id, IFNULL(v_leads_id_list,"") )
');

SET @get_q = CONCAT(@get_q, ' GROUP BY param_name ');

-- SELECT @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET error_code=0;

END$$
DELIMITER ;

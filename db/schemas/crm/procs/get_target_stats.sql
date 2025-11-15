-- call crm.get_target_stats (@err,9,NULL,NULL); 
-- call crm.get_target_stats (@err,9, "2024-07-22",CURRENT_DATE); 

DROP PROCEDURE IF EXISTS crm.get_target_stats;

DELIMITER $$
CREATE PROCEDURE crm.get_target_stats (OUT error_code INT, 
                                IN in_app_user_id BIGINT,
                                IN in_start_dtm TIMESTAMP,
                                IN in_end_dtm TIMESTAMP
                                              )
                                              
BEGIN
DECLARE v_leads_id_list VARCHAR(5000);
SET error_code = -2;

SELECT temp_inner.user_id,
       SUM(temp_inner.target_amount) AS total_target_amount,
       SUM(temp_inner.achieved_target) AS total_achieved_target,
       SUM(temp_inner.daily_target_by_target_id) AS daily_target
  FROM
       
(
SELECT t.target_id,
       t.senior_manager_id AS user_id,
	   SUM(IFNULL(target_amount,0)) AS target_amount,
       SUM(IFNULL(achieved_target,0)) AS achieved_target,
       (SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0))) AS remaining_target,
       SUM(IFNULL(working_days,0)) AS working_days,
       ROUND((SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0)))/SUM(IFNULL(working_days,0))) AS daily_target_by_target_id,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.senior_manager_id IS NOT NULL 
   AND t.senior_manager_id = in_app_user_id
   AND (in_start_dtm IS NULL OR t.from_date >= in_start_dtm)
   AND (in_end_dtm IS NULL OR t.to_date < in_end_dtm)
   AND t.status = 1
 -- GROUP BY t.senior_manager_id
 GROUP BY t.target_id
  UNION
SELECT t.target_id,
       t.team_manager_id,
	   SUM(IFNULL(target_amount,0)) AS target_amount,
       SUM(IFNULL(achieved_target,0)) AS achieved_target,
       (SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0))) AS remaining_target,
       SUM(IFNULL(working_days,0)) AS working_days,
       ROUND((SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0)))/SUM(IFNULL(working_days,0))) AS daily_target_by_target_id,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.team_manager_id IS NOT NULL 
   AND t.team_manager_id = in_app_user_id
   AND (in_start_dtm IS NULL OR t.from_date >= in_start_dtm)
   AND (in_end_dtm IS NULL OR t.to_date < in_end_dtm)
   AND t.status = 1
 -- GROUP BY t.team_manager_id
 GROUP BY t.target_id
 UNION
SELECT t.target_id,
	   t.team_lead_id,
	   SUM(IFNULL(target_amount,0)) AS target_amount,
       SUM(IFNULL(achieved_target,0)) AS achieved_target,
       (SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0))) AS remaining_target,
       SUM(IFNULL(working_days,0)) AS working_days,
       ROUND((SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0)))/SUM(IFNULL(working_days,0))) AS daily_target_by_target_id,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.team_lead_id IS NOT NULL 
   AND t.team_lead_id = in_app_user_id
   AND (in_start_dtm IS NULL OR t.from_date >= in_start_dtm)
   AND (in_end_dtm IS NULL OR t.to_date < in_end_dtm)
   AND t.status = 1
 -- GROUP BY t.team_lead_id
 GROUP BY t.target_id
 UNION
SELECT t.target_id,
       t.agent_id,
	   SUM(IFNULL(target_amount,0)) AS target_amount,
       SUM(IFNULL(achieved_target,0)) AS achieved_target,
       (SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0))) AS remaining_target,
       SUM(IFNULL(working_days,0)) AS working_days,
       ROUND((SUM(IFNULL(target_amount,0)) - SUM(IFNULL(achieved_target,0)))/SUM(IFNULL(working_days,0))) AS daily_target_by_target_id,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.agent_id IS NOT NULL 
   AND t.agent_id = in_app_user_id
   AND (in_start_dtm IS NULL OR t.from_date >= in_start_dtm)
   AND (in_end_dtm IS NULL OR t.to_date < in_end_dtm)
   AND t.status = 1
 -- GROUP BY t.agent_id;
 GROUP BY t.target_id
) temp_inner
GROUP BY temp_inner.user_id;

   


/* 

-- 1-May-2025 : Ravikiran Prabhu
-- Removing Dynamic SQL since there won't be any optional params
-- Converting to a prepped statement

SET @get_q = "";

SET @get_q = CONCAT(@get_q, '
SELECT senior_manager_id AS user_id,
	   SUM(target_amount) AS target_amount,
       SUM(working_days) AS working_days,
       SUM(achieved_target) AS achieved_target,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.senior_manager_id IS NOT NULL 
   AND t.status = 1
   AND t.senior_manager_id = ', in_app_user_id );
   
IF in_start_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.from_date >= ', '"', in_start_dtm, '"');
END IF; 

IF in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.to_date < ', '"', in_end_dtm, '"');
END IF; 

SET @get_q = CONCAT(@get_q, ' 

 GROUP BY t.senior_manager_id
  UNION
SELECT team_manager_id,
	   SUM(target_amount) AS target_amount,
       SUM(working_days) AS working_days,
       SUM(achieved_target) AS achieved_target,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.team_manager_id IS NOT NULL 
   AND t.status = 1
   AND t.team_manager_id = ', in_app_user_id );

IF in_start_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.from_date >= ', '"', in_start_dtm, '"');
END IF; 

IF in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.to_date < ', '"', in_end_dtm, '"');
END IF; 

SET @get_q = CONCAT(@get_q, ' 
 GROUP BY t.team_manager_id
 UNION
SELECT team_lead_id,
	   SUM(target_amount) AS target_amount,
       SUM(working_days) AS working_days,
       SUM(achieved_target) AS achieved_target,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.team_lead_id IS NOT NULL
   AND t.status = 1
   AND t.team_lead_id = ', in_app_user_id );

IF in_start_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.from_date >= ', '"', in_start_dtm, '"');
END IF; 

IF in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.to_date < ', '"', in_end_dtm, '"');
END IF; 

SET @get_q = CONCAT(@get_q, ' 
 GROUP BY t.team_lead_id
 UNION
SELECT agent_id,
	   SUM(target_amount) AS target_amount,
       SUM(working_days) AS working_days,
       SUM(achieved_target) AS achieved_target,
       MIN(from_date) AS from_date,
       MAX(to_date) AS to_date
  FROM crm.target t
 WHERE t.agent_id IS NOT NULL
   AND t.status = 1
   AND t.agent_id = ', in_app_user_id );
   
IF in_start_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.from_date >= ', '"', in_start_dtm, '"');
END IF; 

IF in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.to_date < ', '"', in_end_dtm, '"');
END IF; 
   
SET @get_q = CONCAT(@get_q, ' 
 GROUP BY t.agent_id;
   
   ');



-- SELECT  @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

*/

SET error_code=0;

END$$
DELIMITER ;

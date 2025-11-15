-- call crm.get_target (@err,9,NULL); 
-- call crm.get_target (@err,NULL,1); 
DROP PROCEDURE IF EXISTS crm.get_target;

DELIMITER $$ 
CREATE PROCEDURE crm.get_target (
  OUT error_code INT,
  IN in_app_user_id BIGINT,
  IN in_target_id BIGINT
) 

BEGIN
SET
  error_code = -2;

SET
  @get_q = '
          SELECT t.target_id,
            t.admin_id,
              CONCAT(u1.first_name, " ", u1.last_name) AS admin_full_name, 
              t.agent_id,
              CONCAT(u2.first_name, " ", u2.last_name) AS agent_full_name,       
              t.team_lead_id,
              CONCAT(u3.first_name, " ", u3.last_name) AS team_lead_full_name,       
              t.senior_manager_id,
              CONCAT(u4.first_name, " ", u4.last_name) AS senior_manager_full_name,       
              t.team_manager_id,
              CONCAT(u5.first_name, " ", u5.last_name) AS team_manager_full_name,  
              t.target_amount,
              t.target_assigned_by,
              CONCAT(u6.first_name, " ", u6.last_name) AS target_assigned_by_full_name,  
              t.working_days,
              t.achieved_target,
              t.from_date,
              t.to_date,
              t.status,
              t.created_id,
              t.created_dtm,
              t.modified_id,
              t.modified_dtm
              FROM crm.target t
              -- JOIN org.company comp
              --  ON t.company_id = comp.company_id
              LEFT OUTER JOIN user.user u1 -- For admin info
                ON t.admin_id = u1.user_id
              LEFT OUTER JOIN user.user u2 -- For agent info
                ON t.agent_id = u2.user_id
              LEFT OUTER JOIN user.user u3 -- For team lead info
                ON t.team_lead_id = u3.user_id
              LEFT OUTER JOIN user.user u4 -- For senior manager info
               ON t.senior_manager_id = u4.user_id
              LEFT OUTER JOIN user.user u5 -- For team manager to info
               ON t.team_manager_id = u5.user_id 
              LEFT OUTER JOIN user.user u6 -- For team manager to info
               ON t.target_assigned_by = u6.user_id  
              WHERE t.status = 1 ';

IF in_target_id IS NOT NULL THEN
SET
  @get_q = CONCAT(@get_q, '
   AND t.target_id = ', in_target_id);

END IF;


IF in_app_user_id IS NOT NULL THEN
 SET
 @get_q = CONCAT(
 @get_q,
 '
 AND ( t.senior_manager_id = ',
 in_app_user_id
 );
 SET
 @get_q = CONCAT(
 @get_q,
 '
 OR t.team_manager_id = ',
 in_app_user_id
 );

SET
 @get_q = CONCAT(
 @get_q,
 '
 OR t.team_lead_id = ',
 in_app_user_id
 );

 SET
 @get_q = CONCAT(
 @get_q,
 '
 OR t.admin_id = ',
 in_app_user_id
 );

SET
 @get_q = CONCAT(
 @get_q,
 '
 OR t.agent_id = ',
 in_app_user_id, ' )'
 ); 
 
 END IF;

-- select @get_q;
PREPARE stmt
FROM
  @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET
  error_code = 0;

END $$ 
DELIMITER ;
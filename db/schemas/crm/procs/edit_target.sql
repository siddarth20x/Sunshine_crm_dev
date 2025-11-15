--  call `crm`.edit_target(@err,2,1,3,28,20,9,14,5000,3,30,2500,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,0);
DROP PROCEDURE IF EXISTS crm.edit_target;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_target (
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_target_id BIGINT,
    IN in_admin_id BIGINT,
    IN in_senior_manager_id BIGINT,
    IN in_team_manager_id BIGINT,
    IN in_team_lead_id BIGINT,
    IN in_agent_id BIGINT,
    IN in_target_amount FLOAT,
    IN in_target_assigned_by BIGINT,
    IN in_working_days BIGINT,
    IN in_achieved_target FLOAT,
    IN in_from_date TIMESTAMP,
    IN in_to_date TIMESTAMP,
    IN in_status TINYINT
) 

BEGIN
SET
    error_code = -2;

UPDATE
    crm.target
SET
    admin_id = in_admin_id,
    senior_manager_id = in_senior_manager_id,
    team_manager_id = in_team_manager_id,
    team_lead_id = in_team_lead_id,
    agent_id = in_agent_id,
    target_amount = in_target_amount,
    target_assigned_by = in_target_assigned_by,
    working_days = in_working_days,
    achieved_target = in_achieved_target,
    from_date = in_from_date,
    to_date = in_to_date,
    status = in_status,
    modified_id = in_app_user_id
WHERE
    target_id = in_target_id;

SET
    error_code = 0;

END $$ 
DELIMITER ;
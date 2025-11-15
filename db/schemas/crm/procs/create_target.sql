-- call `crm`.create_target(@err,3,3,28,20,9,14,5000,3,30,2500,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,@otid);
DROP PROCEDURE IF EXISTS `crm`.create_target;

DELIMITER $$ 

CREATE PROCEDURE `crm`.create_target(
        OUT error_code INT,
        IN in_app_user_id BIGINT,
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
        OUT out_target_id BIGINT
) 

BEGIN
SET
        error_code = -2;

INSERT INTO
        `crm`.target(
                target_id,
                admin_id,
                senior_manager_id,
                team_manager_id,
                team_lead_id,
                agent_id,
                target_amount,
                target_assigned_by,
                working_days,
                achieved_target,
                from_date,
                to_date,
                status,
                created_id,
                created_dtm,
                modified_id,
                modified_dtm
        )
VALUES
        (
                NULL,
                in_admin_id,
                in_senior_manager_id,
                in_team_manager_id,
                in_team_lead_id,
                in_agent_id,
                in_target_amount,
                in_target_assigned_by,
                in_working_days,
                in_achieved_target,
                in_from_date,
                in_to_date,
                1,
                in_app_user_id,
                CURRENT_TIMESTAMP(),
                in_app_user_id,
                CURRENT_TIMESTAMP()
        );

SET
        out_target_id = LAST_INSERT_ID();

COMMIT;

SET
        error_code = 0;

END $$ 
DELIMITER ;
--  call `crm`.edit_disposition_code(@err,1,1,"Abc Pqr XYZ","Disp Status Update","EFG",1);
DROP PROCEDURE IF EXISTS crm.edit_disposition_code;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_disposition_code (
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_disposition_code_id BIGINT,
    IN in_stage VARCHAR(100),
    IN in_stage_status VARCHAR(100),
    IN in_stage_status_name VARCHAR(100),
    IN in_stage_status_code VARCHAR(20),
    IN in_status TINYINT
) BEGIN
SET
    error_code = -2;

UPDATE
    crm.disposition_code
SET
    stage = IFNULL(in_stage, stage),
    stage_status = IFNULL(in_stage_status, stage_status),
    stage_status_name = IFNULL(in_stage_status_name, stage_status_name),
    stage_status_code = IFNULL(in_stage_status_code, stage_status_code),
    status = IFNULL(in_status, status),
    modified_id = IFNULL(in_app_user_id, modified_id)
WHERE
    disposition_code_id = in_disposition_code_id;

SET
    error_code = 0;

END $$ 
DELIMITER ;
--  call `crm`.edit_note(@err,2,1,"EMAIL SENT",1);
-- call `crm`.edit_note(@err,2,1,"EMAIL SENT",0);
DROP PROCEDURE IF EXISTS crm.edit_note;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_note (
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_note_id BIGINT,
    IN in_note VARCHAR(5000),
    IN in_status TINYINT
)
BEGIN
SET
    error_code = -2;

UPDATE
    crm.notes n
SET
    n.note = IFNULL(in_note, note),
    n.status = IFNULL(in_status, status),
    n.modified_id = IFNULL(in_app_user_id, modified_id)
WHERE
    n.note_id = in_note_id;

SET
    error_code = 0;

END $$  
DELIMITER ;
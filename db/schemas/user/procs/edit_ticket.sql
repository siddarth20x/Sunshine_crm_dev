-- call user.edit_ticket (@err,3,1,2,1,1,CURRENT_TIMESTAMP,null,1);
DROP PROCEDURE IF EXISTS user.edit_ticket;

DELIMITER $$ 
CREATE PROCEDURE user.edit_ticket(
        OUT error_code INT,
        IN in_app_user_id BIGINT,
        IN in_ticket_id BIGINT,
        IN in_ticket_status_type_id BIGINT,
        IN in_ticket_issue_category_type_id BIGINT,
        IN in_ticket_raised_by_id BIGINT,
        IN in_ticket_resolved_dtm TIMESTAMP,
        IN in_ticket_raised_dtm TIMESTAMP,
        IN in_status TINYINT
) 

BEGIN
SET
        error_code = -2;

UPDATE
        user.ticket
SET
        ticket_status_type_id = IFNULL(in_ticket_status_type_id, ticket_status_type_id),
        ticket_issue_category_type_id = IFNULL(in_ticket_issue_category_type_id, ticket_issue_category_type_id),
        ticket_raised_by_id = IFNULL(in_ticket_raised_by_id, ticket_raised_by_id),
        ticket_raised_dtm = IFNULL(in_ticket_raised_dtm, ticket_raised_dtm),
        ticket_resolved_dtm = IFNULL(in_ticket_resolved_dtm, ticket_resolved_dtm),
        status = IFNULL(in_status, status),
        modified_id = in_app_user_id
WHERE
        ticket_id = in_ticket_id;

SET
        error_code = 0;

END $$ 
DELIMITER ;
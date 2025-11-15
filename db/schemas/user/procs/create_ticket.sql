-- call user.create_ticket (@err,3,1,1,1,CURRENT_TIMESTAMP,null,@otktid);
DROP PROCEDURE IF EXISTS user.create_ticket;

DELIMITER $$ 
CREATE PROCEDURE user.create_ticket(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_ticket_status_type_id BIGINT,
       IN in_ticket_issue_category_type_id BIGINT,
       IN in_ticket_raised_by_id BIGINT,
       IN in_ticket_raised_dtm TIMESTAMP,
       IN in_ticket_resolved_dtm TIMESTAMP,
       OUT out_ticket_id BIGINT
) 

BEGIN
SET
       error_code = -2;

INSERT INTO
       user.ticket (
              ticket_id,
              ticket_status_type_id,
              ticket_issue_category_type_id,
              ticket_raised_by_id,
              ticket_raised_dtm,
              ticket_resolved_dtm,
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_ticket_status_type_id,
              in_ticket_issue_category_type_id,
              in_ticket_raised_by_id,
              in_ticket_raised_dtm,
              in_ticket_resolved_dtm,
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       );

SET
       out_ticket_id = LAST_INSERT_ID();

SET
       error_code = 0;

END $$ 
DELIMITER ;
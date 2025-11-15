-- call user.edit_comment (@err,3,1,'Updated comment',1);
DROP PROCEDURE IF EXISTS user.edit_comment;

DELIMITER $$ 
CREATE PROCEDURE user.edit_comment(
        OUT error_code INT,
        IN in_app_user_id BIGINT,
        IN in_comment_id BIGINT,
        IN in_comment VARCHAR(1000),
        IN in_status TINYINT
) 

BEGIN
SET
        error_code = -2;

UPDATE
        user.comment
SET
        comment_id = IFNULL(in_comment_id, comment_id),
       -- ticket_id = IFNULL(in_ticket_id, ticket_id),
        comment = IFNULL(in_comment, comment),
        status = IFNULL(in_status, status),
        modified_id = in_app_user_id
WHERE
        comment_id = in_comment_id;

SET
        error_code = 0;

END $$ 
DELIMITER ;
-- call user.create_comment (@err,3,1,'Test Comment',@ocid);
DROP PROCEDURE IF EXISTS user.create_comment;

DELIMITER $$ 
CREATE PROCEDURE user.create_comment(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_ticket_id BIGINT,
       IN in_comment VARCHAR(1000),
       OUT out_comment_id BIGINT
) 

BEGIN
SET
       error_code = -2;

INSERT INTO
       user.comment (
              comment_id,
              ticket_id,
              comment,
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_ticket_id,
              in_comment,
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       );

SET
       out_comment_id = LAST_INSERT_ID();

SET
       error_code = 0;

END $$ 
DELIMITER ;
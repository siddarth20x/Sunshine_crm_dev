-- call user.get_comment(@err,1,null);
DELIMITER $$ 
DROP PROCEDURE IF EXISTS user.get_comment$$

CREATE PROCEDURE user.get_comment(
  OUT error_code BIGINT,
  IN in_ticket_id BIGINT,
  IN in_comment_id BIGINT
) 
BEGIN
SET
  error_code = -2;

SET
  @q = CONCAT(
    '
SELECT  comment_id,
        ticket_id,
        comment,
        status,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
  FROM 
        user.comment c
 WHERE  1 = 1  '
  );

IF in_ticket_id IS NOT NULL THEN
SET
  @q = CONCAT(
    @q,
    ' AND ticket_id = ',
    in_ticket_id
  );

END IF;

IF in_comment_id IS NOT NULL THEN
SET
  @q = CONCAT(@q, ' AND comment_id = ', in_comment_id);

END IF;

/* 
 IF in_module_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND module_id = ',in_module_id);
 END IF;
 
 IF in_notification_type_name IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND UPPER (notification_type_name) = ', "'",UPPER(in_notification_type_name),"'"); 
 END IF;
 */
SET
  @q = CONCAT(@q, ' AND status = 1');

-- SELECT @q;
PREPARE stmt
FROM
  @q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET
  error_code = 0;

END $$ 
DELIMITER ;
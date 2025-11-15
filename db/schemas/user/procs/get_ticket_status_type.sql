-- call user.get_ticket_status_type(@err,null);
DELIMITER $$ 
DROP PROCEDURE IF EXISTS user.get_ticket_status_type$$

CREATE PROCEDURE user.get_ticket_status_type(
  OUT error_code INT,
  IN in_ticket_status_type_id BIGINT
) 

BEGIN
SET
  error_code = -2;

SET
  @q = CONCAT(
    '
SELECT  ticket_status_type_id,
        ticket_status_type_name,
        status,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
  FROM 
        user.ticket_status_type t
 WHERE  1 = 1  '
  );

IF in_ticket_status_type_id IS NOT NULL THEN
SET
  @q = CONCAT(
    @q,
    ' AND ticket_status_type_id = ',
    in_ticket_status_type_id
  );

END IF;

/*IF in_company_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND company_id = ',in_company_id);
 END IF;
 
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
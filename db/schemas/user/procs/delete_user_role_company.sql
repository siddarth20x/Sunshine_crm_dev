-- call user.delete_user_role_company(@err, -2, 3);
DELIMITER $$


DROP PROCEDURE IF EXISTS user.delete_user_role_company$$

CREATE  PROCEDURE user.delete_user_role_company  (OUT error_code INT,
                                                   IN in_app_user_id BIGINT,
						   IN in_user_role_company_id BIGINT)
BEGIN
SET error_code = -2;

UPDATE user.user_role_company
   SET status           = 0,
       modified_id 	= in_app_user_id,
       modified_dtm     = CURRENT_TIMESTAMP
WHERE  user_role_company_id = in_user_role_company_id;

SET error_code = 0;

END$$

DELIMITER ;

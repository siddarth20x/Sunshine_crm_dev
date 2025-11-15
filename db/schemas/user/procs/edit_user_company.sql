-- call user.edit_user_company(@err,3,1,0);
-- call user.edit_user_company(@err,3,1,1);
DELIMITER $$


DROP PROCEDURE IF EXISTS user.edit_user_company$$

CREATE  PROCEDURE user.edit_user_company  (OUT error_code INT,
                                            IN in_app_user_id BIGINT,
						                    IN in_user_company_id BIGINT,
											IN in_status TINYINT)
BEGIN
SET error_code = -2;

UPDATE user.user_company
SET     status                  =			IFNULL(in_status,status),
       	modified_id 		    = 			IFNULL(in_app_user_id,modified_id),
       	modified_dtm            = 			CURRENT_TIMESTAMP
WHERE  user_company_id = in_user_company_id;


SET error_code = 0;

END$$

DELIMITER ;

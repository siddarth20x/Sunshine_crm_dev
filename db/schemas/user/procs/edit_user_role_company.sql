-- call user.edit_user_role_company(@err,3,null,null,44,null,null);
DELIMITER $$


DROP PROCEDURE IF EXISTS user.edit_user_role_company$$

CREATE  PROCEDURE user.edit_user_role_company  (OUT error_code INT,
						IN in_user_role_company_id BIGINT,
                                                IN in_user_id BIGINT,
                                                IN in_role_id BIGINT,
                                                IN in_company_id BIGINT, 
                                                IN in_status TINYINT, 
                                                IN in_modified_id  BIGINT)
BEGIN
SET error_code = -2;

UPDATE user.user_role_company
SET    	
	user_id                 =			IFNULL(in_user_id,user_id),
    	role_id	         	=			IFNULL(in_role_id,role_id),
    	company_id              =			IFNULL(in_company_id,company_id),
    	status                  =			IFNULL(in_status,status),
       	modified_id 		= 			IFNULL(in_modified_id,modified_id),
       	modified_dtm            = 			CURRENT_TIMESTAMP
WHERE  user_role_company_id = in_user_role_company_id;


SET error_code = 0;

END$$

DELIMITER ;

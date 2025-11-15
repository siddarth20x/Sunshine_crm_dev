
-- call user.edit_user_preference (@err, 2,1,5,'1,2,3,4,5', '6,7,8,9',1);


DROP PROCEDURE IF EXISTS user.edit_user_preference;

DELIMITER $$
CREATE PROCEDURE user.edit_user_preference(OUT error_code INT
				       ,IN in_app_user_id BIGINT
                                       ,IN in_user_preference_id BIGINT
				       ,IN in_user_id BIGINT
				       ,IN in_preferred_module_ids TEXT
				       ,IN in_preferred_notification_type_ids TEXT
				       ,IN in_status TINYINT)

BEGIN
SET error_code=-2;

IF (in_user_preference_id IS NULL ) THEN

call user.create_user_preference (@err, in_app_user_id, in_user_id, in_preferred_module_ids, in_preferred_notification_type_ids, @upid);

ELSE

UPDATE user.user_preference 
SET 	
        preferred_module_ids    = CASE WHEN in_preferred_module_ids = "" THEN NULL
                                       WHEN in_preferred_module_ids IS NULL THEN preferred_module_ids 
                                       ELSE in_preferred_module_ids END,
        preferred_notification_type_ids  = CASE WHEN in_preferred_notification_type_ids = "" THEN NULL
                                                WHEN in_preferred_notification_type_ids IS NULL THEN preferred_notification_type_ids 
                                                ELSE in_preferred_notification_type_ids END,
        status        = IFNULL(in_status, status),
        modified_id   = in_app_user_id
        
WHERE
        user_preference_id = in_user_preference_id;
        
END IF;

SET error_code=0;  

END$$
DELIMITER ;

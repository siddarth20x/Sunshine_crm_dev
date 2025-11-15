
-- call user.create_user_preference (@err, 2, 7, '1,2,3,4,5', '14,15,16,22,32,33', @upid);

DROP PROCEDURE IF EXISTS user.create_user_preference;

DELIMITER $$
CREATE PROCEDURE user.create_user_preference(OUT error_code INT
				                 ,IN in_app_user_id BIGINT
								 ,IN in_user_id BIGINT
						         ,IN in_preferred_module_ids TEXT
					             ,IN in_preferred_notification_type_ids TEXT
						         ,OUT out_user_preference_id BIGINT)
BEGIN

SET error_code=-2;

INSERT INTO user.user_preference 
       (user_preference_id,
        user_id, 
        preferred_module_ids,
        preferred_notification_type_ids, 
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
       )
VALUES
       (NULL, 
        in_user_id,
        in_preferred_module_ids, 
	in_preferred_notification_type_ids,
        1,
        in_app_user_id,
        CURRENT_TIMESTAMP,
        in_app_user_id,
        CURRENT_TIMESTAMP
       );
       
SET out_user_preference_id=LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;

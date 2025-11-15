-- CALL user.edit_user_notification(@err,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,CURRENT_TIMESTAMP,0);

DELIMITER $$


DROP PROCEDURE IF EXISTS user.edit_user_notification$$

CREATE PROCEDURE user.edit_user_notification (OUT error_code INT,
                                        IN in_app_user_id BIGINT,
                                        IN in_user_notification_id BIGINT, 
                                        IN in_notification_type_id INT,                                         
                                        IN in_notification_name VARCHAR(100),
                                        IN in_notification_message TEXT, 
                                        IN in_notification_effective_from DATETIME, 
                                        IN in_notification_effective_to  DATETIME, 
                                        IN in_notification_lifespan_days TINYINT,
                                        IN in_notification_publish_flag TINYINT,
                                        IN in_acknowledgment_required TINYINT,
                                        IN in_notification_acknowledged_on TIMESTAMP,                                        
                                        IN in_status TINYINT
                                        )
BEGIN

SET error_code=-2;

UPDATE user.user_notification
SET    notification_name = IFNULL(in_notification_name, notification_name),
       notification_message = IFNULL(in_notification_message, notification_message),
       notification_type_id = IFNULL(in_notification_type_id, notification_type_id),
       notification_effective_from = IFNULL(in_notification_effective_from, notification_effective_from),
       notification_effective_to = IFNULL(in_notification_effective_to, notification_effective_to),
       notification_lifespan_days = IFNULL(in_notification_lifespan_days, notification_lifespan_days),
       notification_publish_flag = IFNULL(in_notification_publish_flag, notification_publish_flag),
       acknowledgment_required = IFNULL(in_acknowledgment_required, acknowledgment_required),
       notification_acknowledged_on = IFNULL(in_notification_acknowledged_on, notification_acknowledged_on),
       status = IFNULL(in_status, STATUS),
       modified_id = IFNULL(in_app_user_id, modified_id),
       modified_dtm = CURRENT_TIMESTAMP
WHERE  user_notification_id = in_user_notification_id ;

SET error_code=0;

END$$

DELIMITER ;

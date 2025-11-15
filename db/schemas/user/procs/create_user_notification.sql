--  CALL user.create_user_notification(@err,2,1,'USER CREATED','MSG - User Created XYA','2024-05-27','2024-05-28',4,1,1,NULL,1,@out_id);

DELIMITER $$


DROP PROCEDURE IF EXISTS user.create_user_notification$$

CREATE PROCEDURE user.create_user_notification (OUT error_code INT,
                                        IN in_user_id BIGINT,
                                        IN in_notification_type_id INT,                                         
                                        IN in_notification_name VARCHAR(100),
                                        IN in_notification_message TEXT, 
                                        IN in_notification_effective_from DATETIME, 
                                        IN in_notification_effective_to  DATETIME, 
                                        IN in_notification_lifespan_days TINYINT,
                                        IN in_notification_publish_flag TINYINT,
                                        IN in_acknowledgment_required TINYINT,
                                        IN in_notification_acknowledged_on TIMESTAMP,                                        
                                        IN in_app_user_id BIGINT,
                                        OUT out_notification_id BIGINT )
BEGIN

SET error_code = -2;

INSERT INTO user.user_notification 
(   user_id,
    notification_type_id,
    notification_name, 
    notification_message, 
    notification_effective_from, 
    notification_effective_to, 
    notification_lifespan_days, 
    notification_publish_flag, 
    acknowledgment_required, 
    status, 
    created_id,
    created_dtm,
    modified_id, 
    modified_dtm
    
)
VALUES
(
    in_user_id,
    in_notification_type_id,     
    in_notification_name, 
    in_notification_message, 
    CURRENT_TIMESTAMP, -- in_notification_effective_from, 
    in_notification_effective_to, 
    in_notification_lifespan_days,
    in_notification_publish_flag, 
    in_acknowledgment_required, 
    1, 
    in_app_user_id, 
    CURRENT_TIMESTAMP,
    in_app_user_id, 
    CURRENT_TIMESTAMP
);

SET out_notification_id = LAST_INSERT_ID();

SET error_code=0;

END$$

DELIMITER ;

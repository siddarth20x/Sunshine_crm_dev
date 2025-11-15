--  CALL user.create_user_company(@err,1,2,2,@out_id);

DELIMITER $$


DROP PROCEDURE IF EXISTS user.create_user_company$$

CREATE PROCEDURE user.create_user_company (OUT error_code INT,
                                        IN in_app_user_id BIGINT,
                                        IN in_user_id BIGINT,
                                        IN in_company_id INT,
                                        OUT out_notification_id BIGINT )
BEGIN

SET error_code = -2;

INSERT INTO user.user_company 
(   user_id,
    company_id,
    status, 
    created_id,
    created_dtm,
    modified_id, 
    modified_dtm
    
)
VALUES
(
    in_user_id,
    in_company_id,     
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

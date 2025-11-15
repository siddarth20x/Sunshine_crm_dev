-- call user.get_user_activity_log(@err,1);

DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_user_activity_log$$

CREATE PROCEDURE user.get_user_activity_log(
    OUT error_code INT,
    IN in_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- If there is any error, set error_code to -1 and rollback the transaction
        SET error_code = -1;
        ROLLBACK;
    END;

    -- Default error code indicating no user found
    SET error_code = -2;

    -- Start transaction
    START TRANSACTION;

    -- Select the user activity log with user full name
    SELECT
        ua.user_activity_log_id, 
        ua.user_id, 
        ua.activity_doc_pk_id,
        CONCAT(u.first_name, " ", u.last_name) AS full_name,
        CONCAT(u.designation) AS designation,
        ua.activity_doc_num,
        ua.activity_detail,
        ua.activity_type,
        ua.activity_dtm,
        ua.status,
        ua.created_id,
        ua.created_dtm,
        ua.modified_id, 
        ua.modified_dtm
    FROM 
        user.user_activity_log ua
    JOIN 
        user.user u ON ua.user_id = u.user_id
    WHERE  
        ua.user_id = in_user_id;

    -- If no exception occurred, set error_code to 0 and commit the transaction
    SET error_code = 0;
    COMMIT;
END$$

DELIMITER ;

-- call user.edit_user (@err,2,2,null,null, null, null, null,null,null,null,null,null,1,null,3,'country','state','city',1);
-- call user.edit_user (@err,2,2,null,null, null, null, null,null,null,null,null,null,null,1,null,3,1);
DROP PROCEDURE IF EXISTS user.edit_user;

DELIMITER $$ 
CREATE PROCEDURE user.edit_user(
        OUT error_code INT,
        IN in_app_user_id BIGINT,
        IN in_user_id BIGINT,
        IN in_designation VARCHAR(100),
        IN in_first_name VARCHAR(100),
        IN in_last_name VARCHAR(100),
        IN in_email_address VARCHAR(100),
        IN in_password VARCHAR(128),
        IN in_phone VARCHAR(20),
        IN in_otp MEDIUMINT,
        IN in_mac_address VARCHAR(1000),
        IN in_allowed_ip VARCHAR(45),
        IN in_last_login TIMESTAMP,
        IN in_last_login_ip_address VARCHAR(45),
        IN in_is_admin TINYINT,
        IN in_image_url TEXT,
        IN in_reporting_to_id BIGINT,
        IN in_country VARCHAR(100),
        IN in_state VARCHAR(45),
        IN in_city VARCHAR(45),
        IN in_token VARCHAR(1000),
        IN in_status TINYINT
) 

BEGIN
SET
        error_code = -2;

UPDATE
        user.user
SET
        designation = IFNULL(in_designation, designation),
        first_name = IFNULL(in_first_name, first_name),
        last_name = IFNULL(in_last_name, last_name),
        email_address = IFNULL(in_email_address, email_address),
        password = IFNULL(in_password, password),
        phone = IFNULL(in_phone, phone),
        otp = IFNULL(in_otp, otp),
        mac_address = IFNULL(in_mac_address, mac_address),
        allowed_ip = IFNULL(in_allowed_ip, allowed_ip),
        last_login = IFNULL(in_last_login, last_login),
        last_login_ip_address = IFNULL(in_last_login_ip_address, last_login_ip_address),
        is_admin = IFNULL(in_is_admin, is_admin),
        image_url = IFNULL(in_image_url, image_url),
        reporting_to_id = IFNULL(in_reporting_to_id, reporting_to_id),
        country = IFNULL(in_country, country),
        state = IFNULL(in_state, state),
        city = IFNULL(in_city, city),
        status = IFNULL(in_status, status),
        token = IFNULL(in_token, token),
        modified_id = in_app_user_id
WHERE
        user_id = in_user_id;

SET
        error_code = 0;

END $$ 
DELIMITER ;
-- call user.create_user (@err, 123,'Super Admin', 'first_name', 'last_name', 'in1345@gmail.com', 'in12345_in23','9898989989','de:43:23','103.211.17.122',1,'www.google.com',@aid);
DROP PROCEDURE IF EXISTS user.create_user;

DELIMITER $$ 
CREATE PROCEDURE user.create_user(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_designation VARCHAR(100),
       IN in_first_name VARCHAR(100),
       IN in_last_name VARCHAR(100),
       IN in_email_address VARCHAR(100),
       IN in_password VARCHAR(128),
       IN in_phone VARCHAR(20),
       IN in_mac_address VARCHAR(1000),
       IN in_allowed_ip VARCHAR(45),
       IN in_is_admin TINYINT,
       IN in_image_url TEXT,
       IN in_reporting_to_id BIGINT,
       IN in_country VARCHAR(100),
       IN in_state VARCHAR(45),
       IN in_city VARCHAR(45),
       IN in_token VARCHAR(1000),
       OUT out_user_id BIGINT
) 
BEGIN
SET
       error_code = -2;

INSERT INTO
       user.user (
              user_id,
              designation,
              first_name,
              last_name,
              email_address,
              password,
              phone,
              mac_address,
              allowed_ip,
              is_admin,
              image_url,
              reporting_to_id,
              country,
              state,
              city,
              token,
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_designation,
              in_first_name,
              in_last_name,
              in_email_address,
              in_password,
              in_phone,
              in_mac_address,
              in_allowed_ip,
              in_is_admin,
              in_image_url,
              in_reporting_to_id,
              in_country,
              in_state,
              in_city,
              in_token,
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP,
              in_app_user_id,
              CURRENT_TIMESTAMP
       ) ON DUPLICATE KEY
UPDATE
       designation = IFNULL(in_designation, designation),
       first_name = IFNULL(in_first_name, first_name),
       last_name = IFNULL(in_last_name, last_name),
       password = IFNULL(in_password, password),
       phone = IFNULL(in_phone, phone),
       mac_address = IFNULL(in_mac_address, mac_address),
       allowed_ip = IFNULL(in_allowed_ip, allowed_ip),
       is_admin = IFNULL(in_is_admin, is_admin),
       image_url = IFNULL(in_image_url, image_url),
       reporting_to_id = IFNULL(in_reporting_to_id, reporting_to_id),
       country = IFNULL(in_country, country),
       state = IFNULL(in_state, state),
       city = IFNULL(in_city, city),
       token = IFNULL(in_token, token),
       status = 1,
       modified_id = IFNULL(in_app_user_id, modified_id),
       modified_dtm = CURRENT_TIMESTAMP;

SET
       out_user_id = LAST_INSERT_ID();

SET
       error_code = 0;

END $$ 
DELIMITER ;
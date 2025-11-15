DROP PROCEDURE IF EXISTS user.login;

DELIMITER $$
CREATE PROCEDURE user.login(OUT error_code INT, 
                            IN in_user_email VARCHAR(100), 
                            IN in_password VARCHAR(128), 
                            IN in_mac_address VARCHAR(1000), 
                            IN in_allowed_ip VARCHAR(45))
BEGIN

DECLARE user_exists INT;

SELECT COUNT(*) INTO user_exists
FROM user.user u
WHERE u.email_address = in_user_email 
AND u.password = in_password;
-- AND u.mac_address = in_mac_address
-- AND u.allowed_ip = in_allowed_ip;

IF user_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User not found';
ELSE
   SELECT u.user_id,
           u.email_address,
          -- u.password,
           u.designation,
           u.first_name,
           u.last_name,
           u.image_url
      FROM user.user u
     WHERE u.email_address = in_user_email 
       AND u.password = in_password;
      -- AND u.mac_address = in_mac_address
      -- AND u.allowed_ip = in_allowed_ip;
END IF;
    
SET error_code = 0;    
    
END$$
DELIMITER ;

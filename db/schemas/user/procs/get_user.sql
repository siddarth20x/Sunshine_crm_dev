-- call user.get_user(@err,null,null,null,null,null,null,null);


DELIMITER $$

DROP PROCEDURE IF EXISTS `user`.get_user$$

CREATE PROCEDURE `user`.get_user(
    OUT error_code INT,
    IN in_user_id BIGINT,
    IN in_first_name VARCHAR(100),
    IN in_last_name VARCHAR(100),
    IN in_email_address VARCHAR(100),
    IN in_phone VARCHAR(20),
    IN in_mac_address VARCHAR(45),
    IN in_token VARCHAR(1000),
    IN in_status TINYINT
)
BEGIN
    DECLARE v_user_id BIGINT DEFAULT NULL;
    SET error_code = -2;
    SET @q = CONCAT('
        SELECT u.user_id, 
               u.designation,
               u.first_name, 
               u.last_name, 
               CONCAT(u.first_name, " ", u.last_name) AS full_name,
               u.email_address, 
               u.password, 
               u.is_admin,
               CASE WHEN u.is_admin=1
                    THEN "Y"
                    ELSE "N" 
                END AS is_admin_display,       
               DATE_FORMAT(u.created_dtm, "%d-%b-%Y") AS display_active_date,
               u.phone,
               u.otp,
               u.mac_address,
               u.allowed_ip,
               u.last_login,
               u.last_login_ip_address,
               r.role_name,
               r.company_code,
               u.image_url,
               u.reporting_to_id,
               usc.company_id_list,
               u.country,
               u.state,
               u.city,
               u.token,
               u.status, 
               u.created_id, 
               u.created_dtm, 
               u.modified_id, 
               u.modified_dtm
          FROM user.user u
          LEFT OUTER JOIN
              (
               SELECT urc.user_id,
                      GROUP_CONCAT(DISTINCT r.role_name) AS role_name,
                      GROUP_CONCAT(DISTINCT c.company_code) AS company_code
                 FROM user.user_role_company urc,
                      user.role r,
                      org.company c
                WHERE urc.role_id = r.role_id
                  AND urc.company_id = c.company_id
                GROUP BY urc.user_id
               ) r
            ON u.user_id = r.user_id
          LEFT OUTER JOIN
              (
               SELECT u.user_id, 
                      GROUP_CONCAT(DISTINCT uc.company_id) AS company_id_list 
                 FROM user.user u
                 JOIN user.user_company uc
                   ON u.user_id = uc.user_id 
                 JOIN org.company c
                   ON uc.company_id = c.company_id
                GROUP BY u.user_id
               ) usc
            ON u.user_id = usc.user_id
         WHERE 1 = 1 ');

    IF in_user_id IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND u.user_id = ', in_user_id);
    END IF;

    IF in_first_name IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND UPPER(u.first_name) = ', '"', UPPER(in_first_name), '"');
    END IF;

    IF in_last_name IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND UPPER(u.last_name) = ', '"', UPPER(in_last_name), '"');
    END IF;

    IF in_email_address IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND UPPER(u.email_address) = ', '"', UPPER(in_email_address), '"');
    END IF;

    IF in_phone IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND UPPER(u.phone) = ', '"', UPPER(in_phone), '"');
    END IF;

    IF in_mac_address IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND UPPER(u.mac_address) = ', '"', UPPER(in_mac_address), '"');
    END IF;

    IF in_token IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND u.token = ', '"', in_token, '"');
    END IF;

    IF in_status IS NOT NULL THEN
        SET @q = CONCAT(@q, ' AND u.status = ', in_status);
    END IF;
    
    PREPARE stmt FROM @q;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    IF in_email_address IS NOT NULL THEN
        SELECT u.user_id
        INTO v_user_id
        FROM user.user u
        WHERE u.email_address = in_email_address;

        IF v_user_id IS NOT NULL THEN
            UPDATE user.user usr
            SET last_login = CURRENT_TIMESTAMP
            WHERE usr.user_id = v_user_id;
        END IF;
    END IF;

    SET error_code = 0;
END$$

DELIMITER ;

DELIMITER $$ 

DROP PROCEDURE IF EXISTS `user`.get_all_associated_users $$ 

CREATE PROCEDURE `user`.get_all_associated_users(
  OUT error_code INT,
  IN in_reporting_to_id BIGINT
) 

BEGIN 

-- Default error code to -2 for error
SET
  error_code = -2;

-- Start building the query
SET
  @get_q = '
        SELECT u1.user_id, u1.first_name, u1.last_name , CONCAT(u1.first_name, " ", u1.last_name) AS full_name, r1.role_id, r1.role_name  
        FROM user.user u1
         LEFT JOIN user.user_role_company urc ON u1.user_id = urc.user_id
        LEFT JOIN user.role r1 ON urc.role_id = r1.role_id
        WHERE u1.reporting_to_id = ';

-- Add the `in_reporting_to_id` condition dynamically
SET
  @get_q = CONCAT(
    @get_q,
    in_reporting_to_id,
    '
        UNION
        SELECT u2.user_id, u2.first_name, u2.last_name, CONCAT(u2.first_name, " ", u2.last_name) AS full_name, r2.role_id, r2.role_name  
        FROM user.user u1
        JOIN user.user u2
          ON u1.user_id = u2.reporting_to_id
        LEFT JOIN user.user_role_company urc ON u2.user_id = urc.user_id
        LEFT JOIN user.role r2 ON urc.role_id = r2.role_id
        WHERE u1.reporting_to_id = ',
    in_reporting_to_id,
    '
        UNION
        SELECT u3.user_id, u3.first_name, u3.last_name, CONCAT(u3.first_name, " ", u3.last_name) AS full_name, r3.role_id, r3.role_name  
        FROM user.user u1
        JOIN user.user u2
          ON u1.user_id = u2.reporting_to_id
        JOIN user.user u3
          ON u2.user_id = u3.reporting_to_id
        LEFT JOIN user.user_role_company urc ON u3.user_id = urc.user_id
        LEFT JOIN user.role r3 ON urc.role_id = r3.role_id
        WHERE u1.reporting_to_id = ',
    in_reporting_to_id,
    '
        UNION
        SELECT u4.user_id, u4.first_name, u4.last_name, CONCAT(u4.first_name, " ", u4.last_name) AS full_name, r4.role_id, r4.role_name  
        FROM user.user u1
        JOIN user.user u2
          ON u1.user_id = u2.reporting_to_id
        JOIN user.user u3
          ON u2.user_id = u3.reporting_to_id
        JOIN user.user u4
          ON u3.user_id = u4.reporting_to_id
        LEFT JOIN user.user_role_company urc ON u4.user_id = urc.user_id
        LEFT JOIN user.role r4 ON urc.role_id = r4.role_id
        WHERE u1.reporting_to_id = ',
    in_reporting_to_id,
    '	
		UNION
        SELECT u5.user_id, u5.first_name, u5.last_name, CONCAT(u5.first_name, " ", u5.last_name) AS full_name, r5.role_id, r5.role_name  
        FROM user.user u1
        JOIN user.user u2
          ON u1.user_id = u2.reporting_to_id
        JOIN user.user u3
          ON u2.user_id = u3.reporting_to_id
        JOIN user.user u4
          ON u3.user_id = u4.reporting_to_id
		    JOIN user.user u5
          ON u4.user_id = u5.reporting_to_id
        LEFT JOIN user.user_role_company urc ON u5.user_id = urc.user_id
        LEFT JOIN user.role r5 ON urc.role_id = r5.role_id
        WHERE u1.reporting_to_id = ',
    in_reporting_to_id,
    '
		UNION
        SELECT u6.user_id, u6.first_name, u6.last_name, CONCAT(u6.first_name, " ", u6.last_name) AS full_name,  r6.role_id, r6.role_name  
        FROM user.user u1
        JOIN user.user u2
          ON u1.user_id = u2.reporting_to_id
        JOIN user.user u3
          ON u2.user_id = u3.reporting_to_id
        JOIN user.user u4
          ON u3.user_id = u4.reporting_to_id
		   JOIN user.user u5
          ON u4.user_id = u5.reporting_to_id
		   JOIN user.user u6
          ON u5.user_id = u6.reporting_to_id
         LEFT JOIN user.user_role_company urc ON u6.user_id = urc.user_id
        LEFT JOIN user.role r6 ON urc.role_id = r6.role_id
        WHERE u1.reporting_to_id = ',
    in_reporting_to_id
  );

-- Prepare and execute the dynamic query
PREPARE stmt
FROM
  @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- Set error code to 0 for success
SET
  error_code = 0;

END$$ 
DELIMITER ;


--   SELECT u1.user_id  
--     FROM user.user u1
--    WHERE u1.reporting_to_id = 47
--    UNION
--   SELECT u2.user_id  
--     FROM user.user u1
--     JOIN user.user u2
-- 	  ON u1.user_id = u2.reporting_to_id
--    WHERE u1.reporting_to_id = 47
--    UNION
--   SELECT u3.user_id  
--     FROM user.user u1
--     JOIN user.user u2
-- 	  ON u1.user_id = u2.reporting_to_id
-- 	JOIN user.user u3
--       ON u2.user_id = u3.reporting_to_id
--    WHERE u1.reporting_to_id = 47
--    UNION
--   SELECT u4.user_id  
--     FROM user.user u1
--     JOIN user.user u2
-- 	  ON u1.user_id = u2.reporting_to_id
-- 	JOIN user.user u3
--       ON u2.user_id = u3.reporting_to_id
-- 	JOIN user.user u4
--       ON u3.user_id = u4.reporting_to_id
--    WHERE u1.reporting_to_id = 47
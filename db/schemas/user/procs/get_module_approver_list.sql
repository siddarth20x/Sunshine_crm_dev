-- call user.get_module_approver_list(@err,4, NULL, NULL);
-- call user.get_module_approver_list(@err,2, NULL,'ACCOUNTS-ORDERS');
-- call user.get_module_approver_list(@err,2, 3,'ACCOUNTS-ORDERS');
-- call user.get_module_approver_list(@err,2, 3,'ACCOUNTS-INVOICE');

DELIMITER $$

DROP PROCEDURE IF EXISTS `user`.get_module_approver_list;

CREATE PROCEDURE `user`.get_module_approver_list(
    OUT error_code INT,
    IN in_app_user_id BIGINT,
    IN in_user_id BIGINT,
    IN in_module_name VARCHAR(100)
    )
BEGIN

SET error_code = -2;

SET @get_q = '';
SET @get_q = CONCAT('
SELECT DISTINCT urc.user_id,
       CONCAT(u.first_name, " ", u.last_name, "-",urc.user_id) AS approver_name_with_id,
       m.module_name 
  FROM user.user_role_company urc,
       user.user u,
       user.module m,
       user.privilege p
 WHERE urc.user_id = u.user_id
   AND urc.module_id = m.module_id
   AND urc.status = 1
   AND u.status = 1
   AND p.privilege_name = "APPROVE"
   AND urc.privilege_mask & p.privilege_bit > 0
   AND u.user_id <> ', in_app_user_id
   );

IF in_user_id IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND urc.user_id = ', in_user_id);
END IF; 

IF in_module_name IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(m.module_name) = ','"', UPPER(in_module_name),'"');
END IF; 

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$
DELIMITER ;

-- call user.get_group_assignee_list(@err,NULL, NULL);
-- call user.get_group_assignee_list(@err,NULL,'ACCOUNTS-ORDERS');
-- call user.get_group_assignee_list(@err,1,'ACCOUNTS-ORDERS');
-- call user.get_group_assignee_list(@err,1,'ACCOUNTS-INVOICE');

DELIMITER $$

DROP PROCEDURE IF EXISTS `user`.get_group_assignee_list;

CREATE PROCEDURE `user`.get_group_assignee_list(
    OUT error_code INT,
    IN in_user_id BIGINT,
    IN in_group_name VARCHAR(100)
    )
BEGIN

SET error_code = -2;

SET @get_q = '
SELECT DISTINCT urc.user_id,
       CONCAT(u.first_name, " ", u.last_name, "-",urc.user_id) AS assignee_name_with_id
  FROM user.user_role_company urc,
       user.user u,
       org.group g,
       org.company comp,
       org.division di,
       org.dept de
 WHERE urc.user_id = u.user_id
   AND urc.status = 1
   AND u.status = 1
   AND urc.group_mask & g.group_bit > 0
   AND urc.company_id = comp.company_id
   AND di.company_id = comp.company_id
   AND di.division_id = de.division_id
   AND de.dept_id = g.dept_id
';

IF in_user_id IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND urc.user_id = ', in_user_id);
END IF; 

IF in_group_name IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(g.group_name) = ','"', UPPER(in_group_name),'"');
END IF; 

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$
DELIMITER ;



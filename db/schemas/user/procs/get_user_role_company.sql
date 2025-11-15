
-- call user.get_user_role_company(@err,1,null,null,null);
DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_user_role_company$$

CREATE  PROCEDURE user.get_user_role_company(OUT error_code INT, 
			                      IN in_user_role_company_id BIGINT,
                                              IN in_user_id BIGINT,
                                              IN in_role_id BIGINT, 
                                              IN in_company_id BIGINT
                                              )
BEGIN

SET error_code = -2;

SET @q = CONCAT('
       SELECT urc.user_role_company_id, 
              urc.user_id, 
              u.designation AS designation,
              CONCAT(u.first_name, " ", u.last_name) AS full_name,
              u.email_address,
              urc.role_id, 
              r.role_name,
              urc.company_id, 
              c.company_code,
              c.company_logo_url,
              urc.module_id,
              m.module_name,
              m.module_desc,
              m.module_bit,
              m.route_name,
              m.module_icon,
              m.module_alias,
              m.module_type,
              m.module_group,
              m.module_group_sort_order,
              m.module_sort_order,
              urc.privilege_list AS privilege_bit,
              urc.privilege_mask,
              urc.group_list AS group_bit,
              urc.group_mask,
              urc.status,
              urc.created_id,
              urc.created_dtm,
              urc.modified_id, 
              urc.modified_dtm              
         FROM user.user_role_company urc,
              user.user u,
              user.role r,
              org.company c,
              user.module m
        WHERE 1 = 1 
          AND urc.user_id = u.user_id
          AND urc.role_id = r.role_id
          AND urc.company_id = c.company_id 
          AND urc.module_id = m.module_id ' );

 IF in_user_role_company_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND urc.user_role_company_id = ', in_user_role_company_id);
 END IF;
 
 IF in_user_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND urc.user_id = ', in_user_id);
 END IF;
 
 IF in_role_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND urc.role_id = ', in_role_id);
 END IF;
 
 IF in_company_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND urc.company_id = ', in_company_id);
 END IF;
 
 SET @q = CONCAT(@q,' 
                      AND urc.status = 1 
                      AND r.status = 1 
                      AND c.status = 1 
                      AND m.status = 1 
                    ORDER BY m.module_group_sort_order, m.module_sort_order
                      ');
 
PREPARE stmt FROM @q;

EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$

DELIMITER ;

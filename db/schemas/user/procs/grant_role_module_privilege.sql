-- call user.grant_role_module_privilege(@err,2,"soumyasourabha.608@gmail.com","DEPARTMENT USER","TLP","ACCOUNTS-ORDERS,ACCOUNTS-INVOICE","BEDDING-MANAGERS,BATH-MANAGERS",@ourc);
-- call user.grant_role_module_privilege(@err,2,"soumyasourabha.608@gmail.com","DEPARTMENT USER","TLP","INVENTORY","BEDDING-MANAGERS,BATH-MANAGERS",@ourc);
DROP PROCEDURE IF EXISTS user.grant_role_module_privilege;
DELIMITER $$ 
CREATE PROCEDURE user.grant_role_module_privilege (OUT error_code INT, 
                                                IN in_app_user_id BIGINT,
                                                IN in_email_address VARCHAR(100),
                                                IN in_role_name VARCHAR(100), 
                                                IN in_company_code VARCHAR(10),
                                                IN in_module_name_list TEXT,
                                                IN in_group_list VARCHAR(1000),
                                                OUT out_user_role_company_id BIGINT)

BEGIN   
DECLARE v_finished INTEGER DEFAULT 0;
DECLARE v_user_id BIGINT;
DECLARE v_role_id BIGINT;
DECLARE v_comp_id BIGINT;
DECLARE v_mod_id BIGINT;
DECLARE v_priv_list VARCHAR(50);
DECLARE v_priv_mask INTEGER;
DECLARE v_group_list VARCHAR(50);
DECLARE v_group_mask INTEGER;

DECLARE user_cursor CURSOR FOR
SELECT DISTINCT grp.user_id,
      grp.role_id,
      grp.company_id,
      grp.module_id,
      grp.privilege_bit_list,
      grp.privilege_mask,
	  grp.group_bit_list,
      user.fn_get_number_from_csv(grp.group_bit_list) AS privilege_mask
FROM
(SELECT u.user_id,
      r.role_id,
      comp.company_id,
      m.module_id,
      (SELECT GROUP_CONCAT(privilege_bit) FROM user.privilege) AS privilege_bit_list,
      user.fn_get_number_from_csv((SELECT privilege_bit_list)) AS privilege_mask,
	   GROUP_CONCAT(g.group_bit) AS group_bit_list
 FROM user.user u,
      user.role r,
      org.company comp,
      org.division d,
      org.dept de,
      org.group g,
      user.module m
WHERE u.email_address = in_email_address
 AND r.role_name = UPPER(in_role_name)
 AND comp.company_code = UPPER(in_company_code) 
 AND d.company_id = comp.company_id
 AND d.division_id = de.division_id
 AND de.dept_id = g.dept_id 
 AND FIND_IN_SET(m.module_name,IFNULL(in_module_name_list,'')) 
 AND FIND_IN_SET(g.group_name,IFNULL(in_group_list,''))
 GROUP BY comp.company_id,
          m.module_id) grp
UNION
SELECT DISTINCT p.user_id,
      p.role_id,
      p.company_id,
      p.module_id,
      p.privilege_bit_list,
      p.privilege_mask,
	  p.group_bit_list,
      user.fn_get_number_from_csv(p.group_bit_list) AS privilege_mask
FROM
(SELECT u.user_id,
      r.role_id,
      comp.company_id,
      m.module_id,
      (SELECT GROUP_CONCAT(privilege_bit) FROM user.privilege) AS privilege_bit_list,
      user.fn_get_number_from_csv((SELECT privilege_bit_list)) AS privilege_mask,
	   GROUP_CONCAT(g.group_bit) AS group_bit_list
 FROM user.user u,
      user.role r,
      org.company comp,
      org.division d,
      org.dept de,
      org.group g,
      user.module m
WHERE u.email_address = in_email_address
 AND r.role_name = UPPER(in_role_name)
 AND comp.company_code = UPPER(in_company_code) 
 AND d.company_id = comp.company_id
 AND d.division_id = de.division_id
 AND de.dept_id = g.dept_id 
 AND m.module_name LIKE CONCAT("%",in_module_name_list,"%")
 AND FIND_IN_SET(g.group_name,IFNULL(in_group_list,''))
 GROUP BY comp.company_id,
          m.module_id) p;
 
           DECLARE CONTINUE HANDLER
        FOR NOT FOUND SET v_finished = 1;
        
 OPEN user_cursor;

 grant_role_privilege: LOOP
 
FETCH user_cursor INTO v_user_id,v_role_id,v_comp_id,v_mod_id,v_priv_list,v_priv_mask,v_group_list,v_group_mask;
-- SELECT v_user_id,v_role_id,v_comp_id,v_mod_id,v_priv_list,v_priv_mask,v_group_list,v_group_mask;
IF v_finished=1 THEN
LEAVE grant_role_privilege;
END IF;

  INSERT INTO user.user_role_company 
        (user_role_company_id, 
        user_id,
        role_id,
        company_id,
        module_id,
        privilege_list,
        privilege_mask,
        group_list, 
        group_mask,
	status,
	created_id, 
        created_dtm,
        modified_id,
        modified_dtm
        )
  VALUES
        (NULL, 
        v_user_id, 
        v_role_id,
        v_comp_id, 
        v_mod_id,
        v_priv_list,
        v_priv_mask,
        v_group_list,
        v_group_mask,
        1,
        in_app_user_id, 
        CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()
        ) 
 ON DUPLICATE KEY UPDATE
      role_id = IFNULL(v_role_id, role_id),
      modified_id = IFNULL(in_app_user_id,modified_id),
      privilege_list = IFNULL(v_priv_list,privilege_list),
      group_list = IFNULL(v_group_list,group_list),
      modified_dtm = CURRENT_TIMESTAMP,
      user_role_company_id = LAST_INSERT_ID(user_role_company_id);

  SET out_user_role_company_id  = LAST_INSERT_ID();
  
  SET error_code = 0;

END LOOP grant_role_privilege;

 CLOSE user_cursor;
 END$$

DELIMITER ; 

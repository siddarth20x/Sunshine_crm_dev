
-- call user.upsert_user_role_company(@err,-2,2,1,1,1,@ourc);


DROP PROCEDURE IF EXISTS user.upsert_user_role_company;

DELIMITER $$ 

CREATE PROCEDURE user.upsert_user_role_company (
                                               OUT error_code INT, 
                                                IN in_app_user_id BIGINT,
                                                IN in_user_id BIGINT,
                                                IN in_role_id BIGINT, 
                                                IN in_company_id BIGINT,
                                                IN in_module_id INT,
                                                IN in_privilege_list VARCHAR(1000),
                                                IN in_group_list VARCHAR(1000),
                                                IN in_status TINYINT,
                                                IN in_is_role_only_update TINYINT,
                                               OUT out_user_role_company_id BIGINT)

BEGIN 

  SET error_code = -2;

IF in_is_role_only_update = 1 THEN

UPDATE user.user_role_company
   SET role_id = in_role_id,
       modified_id = in_app_user_id
 WHERE user_id = in_user_id;
 
END IF;

IF in_is_role_only_update = 0 THEN

  INSERT INTO user.user_role_company 
        (user_role_company_id, 
        user_id,
        role_id,
        company_id,
        module_id,
        privilege_list, 
        group_list, 
	status,
	created_id, 
        created_dtm,
        modified_id,
        modified_dtm
        )
  VALUES
        (NULL, 
        in_user_id, 
        in_role_id,
        in_company_id, 
        in_module_id,
        in_privilege_list, 
        in_group_list,
        in_status,
        in_app_user_id, 
        CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()
        )
  ON DUPLICATE KEY UPDATE
        role_id                 = IFNULL(in_role_id, role_id),
        privilege_list	        = CASE WHEN in_privilege_list IS NULL
                                       THEN privilege_list
                                       WHEN UPPER(in_privilege_list) LIKE '%OBJECT%'
                                       THEN privilege_list
                                       ELSE in_privilege_list
                                   END,
        group_list	        = CASE WHEN in_group_list IS NULL
                                       THEN group_list
                                       WHEN UPPER(in_group_list) LIKE '%OBJECT%'
                                       THEN group_list
                                       ELSE in_group_list
                                   END,                                   
    	status                  = IFNULL(in_status,status),
       	modified_id 		= IFNULL(in_app_user_id,modified_id),
       	modified_dtm            = CURRENT_TIMESTAMP,
       	user_role_company_id    = LAST_INSERT_ID(user_role_company_id);

  SET out_user_role_company_id  = LAST_INSERT_ID();
  
  UPDATE user.user_role_company
     SET privilege_mask = user.fn_get_number_from_csv(privilege_list),
         group_mask = user.fn_get_number_from_csv(group_list)
   WHERE user_role_company_id = out_user_role_company_id;
  
  SET error_code = 0;

END IF;

END $$ 

DELIMITER ; 

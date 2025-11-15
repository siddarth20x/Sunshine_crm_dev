DELIMITER $$

DROP TRIGGER IF EXISTS user.t_au_user_role_company$$

CREATE TRIGGER user.t_au_user_role_company AFTER UPDATE on user.user_role_company 
FOR EACH ROW BEGIN

/* Avoiding unnecessary activity logs
DECLARE v_app_user_id BIGINT DEFAULT NULL ;  
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'USER_ROLE_COMPANY_DATA_UPDATE' AS activity_type,
       new.user_role_company_id AS activity_doc_pk_id,
       new.user_id AS activity_doc_num,
       CONCAT(
        IF( old.user_id<>new.user_id, CONCAT(' user_id value was modified from ' , old.user_id,' to ',new.user_id,';'), ""),
		    IF( old.role_id<>new.role_id, CONCAT(' role_id value was modified from ' , old.role_id,' to ',new.role_id,';'), ""),
		    IF( old.company_id<>new.company_id, CONCAT(' company_id value was modified from ' , old.company_id,' to ',new.company_id,';'), ""),
		    IF( old.module_id<>new.module_id, CONCAT(' module_id value was modified from ' , old.module_id,' to ',new.module_id,';'), ""),
		    IF( old.privilege_list<>new.privilege_list, CONCAT(' privilege_list value was modified from ' , old.privilege_list,' to ',new.privilege_list,';'), ""),
		    IF( old.privilege_mask<>new.privilege_mask, CONCAT(' privilege_mask value was modified from ' , old.privilege_mask,' to ',new.privilege_mask,';'), ""),
		    IF( old.group_list<>new.group_list, CONCAT(' group_list value was modified from ' , old.group_list,' to ',new.group_list,';'), ""),
		    IF( old.group_mask<>new.group_mask, CONCAT(' group_mask value was modified from ' , old.group_mask,' to ',new.group_mask,';'), ""),
        IF( old.status<>new.status, CONCAT(' status value was modified from ' , old.status,' to ',new.status,';'), "")
       ) AS activity_detail,
       CURRENT_TIMESTAMP AS activity_dtm 
  INTO v_app_user_id,
       v_activity_type,
       v_activity_doc_pk_id,
       v_activity_doc_num,
       v_activity_detail,
       v_activity_dtm
  FROM DUAL;

CALL user.create_user_activity_log (@err,v_app_user_id,v_activity_type,v_activity_doc_pk_id,v_activity_doc_num,v_activity_detail,v_activity_dtm,@osuid);

*/

INSERT INTO user.user_role_company_audit
(  	
  user_role_company_id,
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
  modified_dtm,
  audit_action,
  audit_dtm
)
VALUES
(
  old.user_role_company_id,
  old.user_id,
  old.role_id,
  old.company_id,
  old.module_id,
  old.privilege_list,
  old.privilege_mask,
  old.group_list,
  old.group_mask,  
  old.status,
  old.created_id,
  old.created_dtm,
  old.modified_id,
  old.modified_dtm,
  'AU',
  CURRENT_TIMESTAMP
);
END;
$$

DELIMITER ;

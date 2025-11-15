DELIMITER $$

DROP TRIGGER IF EXISTS user.t_ai_user_role_company$$

CREATE TRIGGER user.t_ai_user_role_company AFTER INSERT on user.user_role_company 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;  
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'USER_ROLE_COMPANY_DATA_INSERT' AS activity_type,
       new.user_role_company_id AS activity_doc_pk_id,
       new.user_id AS activity_doc_num,
       CONCAT(
                     CONCAT(' user_id value was created as ' ,new.user_id,';'),
		     CONCAT(' role_id value was created as ' ,new.role_id,';'),
		     CONCAT(' company_id value was created as ' ,new.company_id,';'),
		     CONCAT(' module_id value was created as ' ,new.module_id,';'),
		     CONCAT(' privilege_list value was created as ' ,new.privilege_list,';'),
		     CONCAT(' privilege_mask value was created as ' ,new.privilege_mask,';'),
		     CONCAT(' group_list value was created as ' ,new.group_list,';'),
		     CONCAT(' group_mask value was created as ' ,new.group_mask,';'),
                     CONCAT(' status value was created as ' ,new.status,';')
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


END;
$$

DELIMITER ;

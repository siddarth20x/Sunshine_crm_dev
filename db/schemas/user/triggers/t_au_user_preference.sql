DELIMITER $$

DROP TRIGGER IF EXISTS `user`.`t_au_user_preference`$$

CREATE TRIGGER `user`.`t_au_user_preference` AFTER UPDATE on `user`.`user_preference` 
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
       'USER_PREFERENCE_DATA_UPDATE' AS activity_type,
       new.user_preference_id AS activity_doc_pk_id,
       new.user_id AS activity_doc_num,
       CONCAT(		
       		   IF( old.preferred_module_ids<>new.preferred_module_ids, CONCAT(' preferred_module_ids value was modified from ' , old.preferred_module_ids,' to ',new.preferred_module_ids,';'), ""),
               IF( old.preferred_notification_type_ids<>new.preferred_notification_type_ids, CONCAT(' preferred_notification_type_ids value was modified from ' , old.preferred_notification_type_ids,' to ',new.preferred_notification_type_ids,';'), ""),
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

INSERT INTO user.user_preference_audit
(  	user_id,
	preferred_module_ids,             
	preferred_notification_type_ids,
	status,
	created_id,
	created_dtm,
	modified_id,
	modified_dtm,
	audit_action,
	audit_dtm
)
VALUES
(  	old.user_id, 
    old.preferred_module_ids,
	old.preferred_notification_type_ids,
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

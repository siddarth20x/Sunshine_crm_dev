DELIMITER $$

DROP TRIGGER IF EXISTS `user`.`t_ai_user_preference`$$

CREATE TRIGGER `user`.`t_ai_user_preference` AFTER INSERT on `user`.`user_preference` 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;  
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'USER_PREFERENCE_DATA_INSERT' AS activity_type,
       new.user_preference_id AS activity_doc_pk_id,
       new.user_id AS activity_doc_num,
       CONCAT(		
                    CONCAT(' preferred_module_ids value was created as ' ,new.preferred_module_ids,';'),
                    CONCAT(' preferred_notification_type_ids value was created as ' ,new.preferred_notification_type_ids,';'),
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

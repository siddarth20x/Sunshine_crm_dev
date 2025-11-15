DELIMITER $$

DROP TRIGGER IF EXISTS user.t_ai_user_notification$$

CREATE TRIGGER user.t_ai_user_notification AFTER INSERT on user.user_notification 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;  
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'USER_NOTIFICATION_DATA_INSERT' AS activity_type,
       new.user_notification_id AS activity_doc_pk_id,
       new.user_id AS activity_doc_num,
       CONCAT(
                CONCAT(' user_id value was created as ' ,new.user_id,';'),
		CONCAT(' notification_type_id value was created as ' ,new.notification_type_id,';'),
		CONCAT(' notification_name value was created as ' ,new.notification_name,';'),
		CONCAT(' notification_message value was created as ' ,new.notification_message,';'),
		CONCAT(' notification_effective_from value was created as ' ,new.notification_effective_from,';'),
		CONCAT(' notification_effective_to value was created as ' ,new.notification_effective_to,';'),
		CONCAT(' notification_lifespan_days value was created as ' ,new.notification_lifespan_days,';'),
		CONCAT(' notification_publish_flag value was created as ' ,new.notification_publish_flag,';'),
		CONCAT(' acknowledgment_required value was created as ' ,new.acknowledgment_required,';'),
		CONCAT(' notification_acknowledged_on value was created as ' ,new.notification_acknowledged_on,';'),
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

DELIMITER $$

DROP TRIGGER IF EXISTS user.t_au_user_notification$$

CREATE TRIGGER user.t_au_user_notification AFTER UPDATE on user.user_notification 
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
       'USER_NOTIFICATION_DATA_UPDATE' AS activity_type,
       new.user_notification_id AS activity_doc_pk_id,
       new.user_id AS activity_doc_num,
       CONCAT(
        IF( old.user_id<>new.user_id, CONCAT(' user_id value was modified from ' , old.user_id,' to ',new.user_id,';'), ""),
		    IF( old.notification_type_id<>new.notification_type_id, CONCAT(' notification_type_id value was modified from ' , old.notification_type_id,' to ',new.notification_type_id,';'), ""),
		    IF( old.notification_name<>new.notification_name, CONCAT(' notification_name value was modified from ' , old.notification_name,' to ',new.notification_name,';'), ""),
		    IF( old.notification_message<>new.notification_message, CONCAT(' notification_message value was modified from ' , old.notification_message,' to ',new.notification_message,';'), ""),
		    IF( old.notification_effective_from<>new.notification_effective_from, CONCAT(' notification_effective_from value was modified from ' , old.notification_effective_from,' to ',new.notification_effective_from,';'), ""),
		    IF( old.notification_effective_to<>new.notification_effective_to, CONCAT(' notification_effective_to value was modified from ' , old.notification_effective_to,' to ',new.notification_effective_to,';'), ""),
		    IF( old.notification_lifespan_days<>new.notification_lifespan_days, CONCAT(' notification_lifespan_days value was modified from ' , old.notification_lifespan_days,' to ',new.notification_lifespan_days,';'), ""),
		    IF( old.notification_publish_flag<>new.notification_publish_flag, CONCAT(' notification_publish_flag value was modified from ' , old.notification_publish_flag,' to ',new.notification_publish_flag,';'), ""),
		    IF( old.acknowledgment_required<>new.acknowledgment_required, CONCAT(' acknowledgment_required value was modified from ' , old.acknowledgment_required,' to ',new.acknowledgment_required,';'), ""),
		    IF( old.notification_acknowledged_on<>new.notification_acknowledged_on, CONCAT(' notification_acknowledged_on value was modified from ' , old.notification_acknowledged_on,' to ',new.notification_acknowledged_on,';'), ""),
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

INSERT INTO user.user_notification_audit
(  	
  user_notification_id,
  user_id,
  notification_type_id,
  notification_name,
  notification_message,
  notification_effective_from,
  notification_effective_to,
  notification_lifespan_days,
  notification_publish_flag,
  acknowledgment_required,
  notification_acknowledged_on,
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
  old.user_notification_id,
  old.user_id,
  old.notification_type_id,  
  old.notification_name,
  old.notification_message,
  old.notification_effective_from,
  old.notification_effective_to,
  old.notification_lifespan_days,
  old.notification_publish_flag,
  old.acknowledgment_required,
  old.notification_acknowledged_on,
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

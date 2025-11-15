DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_ai_tracing_details$$

CREATE TRIGGER crm.t_ai_tracing_details AFTER INSERT on crm.tracing_details
FOR EACH ROW BEGIN 

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_lead_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_type CHAR(1) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

DECLARE v_assigned_by	BIGINT(20);
DECLARE v_assigned_to	BIGINT(20);

DECLARE v_notification_type_id BIGINT;
DECLARE v_notification_type_description VARCHAR(100);

DECLARE v_task_id BIGINT DEFAULT NULL;
DECLARE v_task_type_id_pc BIGINT DEFAULT NULL;
DECLARE v_is_uploaded_rec TINYINT DEFAULT 0;
DECLARE v_is_touched TINYINT DEFAULT 0;


SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       new.lead_id AS lead_id,
       'TRACED_DETAILS_INSERT' AS activity_type,
       "D" AS activity_doc_type,             
       new.traced_details_id AS activity_doc_pk_id,
       CONCAT(
		CONCAT(' traced_details_id was created as ', IFNULL(new.traced_details_id, ''), ';'),
		CONCAT(' lead_id was created as ', IFNULL(new.lead_id, ''), ';'),
		CONCAT(' task_id was created as ', IFNULL(new.task_id, ''), ';'),
		CONCAT(' sql_details name was created as ', IFNULL(new.sql_details, ''), ';'),
		CONCAT(' company_trade_license_details was created as ', IFNULL(new.company_trade_license_details, ''), ';'),
		CONCAT(' additional_details was created as ', IFNULL(new.additional_details, ''), ';'),
          CONCAT(' is uploaded record was created as ', IFNULL(new.is_uploaded_record, ''), ';'),          
		CONCAT(' status was created as ', IFNULL(new.status, ''), ';'),
		CONCAT(' created_id was created as ', IFNULL(new.created_id, ''), ';')
       ) AS activity_detail,
       CURRENT_TIMESTAMP AS activity_dtm 
  INTO v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,       
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm
  FROM DUAL;

SELECT tt.task_type_id
  INTO v_task_type_id_pc
  FROM crm.task t
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id
 WHERE t.task_id = new.task_id
   AND tt.task_type_name = 'PRELIMINARY CHECKS';

IF v_task_type_id_pc IS NOT NULL OR LENGTH(v_task_type_id_pc) > 0 THEN
   SET v_is_uploaded_rec = 1;
END IF;  

CALL crm.create_activity_log (@err,
       v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       v_is_uploaded_rec,
       v_is_touched,              
       @osuid);

-- Create User Notif When New Traced Details are added

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "TRACED_DETAILS_ADDED";

   SELECT assigned_by,
          assigned_to
     INTO v_assigned_by,
          v_assigned_to
     FROM crm.task 
	WHERE lead_id = new.lead_id LIMIT 1;
   
-- Send one notif to assigned by of the task
   CALL user.create_user_notification(@err,
                                       v_assigned_by, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Traced Details Added',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to  assigned_to of the task
   CALL user.create_user_notification(@err,
                                       v_assigned_to, -- Notif recipient
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Traced Details Added',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);


END;

$$

DELIMITER ;

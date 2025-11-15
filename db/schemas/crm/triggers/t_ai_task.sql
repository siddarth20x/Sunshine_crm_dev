DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_ai_task$$

CREATE TRIGGER crm.t_ai_task AFTER INSERT on crm.task
FOR EACH ROW BEGIN 

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_lead_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_type CHAR(1) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

DECLARE v_notification_type_id BIGINT;
DECLARE v_notification_type_description VARCHAR(100);

DECLARE v_task_type_new VARCHAR(100);
DECLARE v_stage_new VARCHAR(100);
DECLARE v_stage_status_new VARCHAR(100);
DECLARE v_stage_status_name_new VARCHAR(100);
DECLARE v_stage_status_code_new VARCHAR(100);
DECLARE v_assigned_by_new VARCHAR(500);
DECLARE v_assigned_to_new VARCHAR(500);
DECLARE v_task_status_type_new VARCHAR(100);
DECLARE v_created_by_new VARCHAR(500);
DECLARE v_lead_status_type_name VARCHAR(100);

DECLARE v_task_id BIGINT DEFAULT NULL;
DECLARE v_task_type_id_pc BIGINT DEFAULT NULL;
DECLARE v_is_uploaded_rec TINYINT DEFAULT 0;
DECLARE v_is_touched TINYINT DEFAULT 0;
 
SELECT task_type_name
  INTO v_task_type_new
  FROM crm.task_type
 WHERE task_type_id = new.task_type_id;
 
SELECT stage, stage_status, stage_status_name, stage_status_code
  INTO v_stage_new, v_stage_status_new, v_stage_status_name_new, v_stage_status_code_new
  FROM crm.disposition_code
 WHERE disposition_code_id = new.disposition_code_id;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_by_new
  FROM user.user u
 WHERE user_id = new.assigned_by;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_to_new
  FROM user.user u
 WHERE user_id = new.assigned_to;
 
SELECT task_status_type_name
  INTO v_task_status_type_new
  FROM crm.task_status_type
 WHERE task_status_type_id = new.task_status_type_id;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_created_by_new
  FROM user.user u
 WHERE user_id = new.created_id;
 
SELECT lst.lead_status_type_name
  INTO v_lead_status_type_name
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND l.lead_id = new.lead_id; 

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       new.lead_id,
       'TASK_INSERT' AS activity_type,
       "T" AS activity_doc_type,             
       new.task_id AS activity_doc_pk_id,
       CONCAT(
		CONCAT(' task_id was created as ', IFNULL(new.task_id, ''), ';'),
		CONCAT(' task_type was created as ', IFNULL(v_task_type_new, ''), ';'),
		CONCAT(' stage_status_code was created as ', IFNULL(v_stage_status_code_new, ''), ';'),
		CONCAT(' lead_id was created as ', IFNULL(new.lead_id, ''), ';'),
		CONCAT(' assigned_by was created as ', IFNULL(v_assigned_by_new, ''), ';'),
		CONCAT(' assigned_dtm was created as ', IFNULL(new.assigned_dtm, ''), ';'),
		CONCAT(' assigned_to was created as ', IFNULL(v_assigned_to_new, ''), ';'),
		CONCAT(' target_dtm was created as ', IFNULL(new.target_dtm, ''), ';'),
		CONCAT(' task_status_type was created as ', IFNULL(v_task_status_type_new, ''), ';'),
		CONCAT(' document_url was created as ', IFNULL(new.document_url, ''), ';'),
		CONCAT(' mode_of_contact was created as ', IFNULL(new.mode_of_contact, ''), ';'),
          CONCAT(' is uploaded record was created as ', IFNULL(new.is_uploaded_record, ''), ';'),          
		CONCAT(' status was created as ', IFNULL(new.status, ''), ';'),
		CONCAT(' created_id was ', IFNULL(v_created_by_new, ''), ';')
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

-- IF v_task_type_id_pc IS NOT NULL OR LENGTH(v_task_type_id_pc) > 0 THEN
--    SET v_is_uploaded_rec = 1;
-- END IF;  

-- Mark as touched if the 4 specific fields are filled:
-- 1. Feedback (from notes table)
-- 2. Contactable / Non-contactable (from task table)
-- 3. Disposition Code (from task table) 
-- 4. Disposition Status Name (from task table)
-- Check if disposition fields are filled - either disposition_code_id is set OR disposition fields have values
-- Also check if this is an uploaded record with disposition fields
IF new.disposition_code_id IS NOT NULL OR
   v_stage_new IS NOT NULL OR
   v_stage_status_new IS NOT NULL OR 
   v_stage_status_name_new IS NOT NULL OR 
   v_stage_status_code_new IS NOT NULL OR
   (new.is_uploaded_record = 1 AND new.disposition_code_id IS NOT NULL) THEN
   SET v_is_touched = 1;
END IF;

-- Additional check for PRELIMINARY CHECKS tasks (keep existing logic)
IF (v_task_type_id_pc IS NOT NULL OR 
   LENGTH(v_task_type_id_pc) > 0) AND 
   (v_stage_new IS NOT NULL OR
   v_stage_status_new IS NOT NULL OR 
   v_stage_status_name_new IS NOT NULL OR 
   v_stage_status_code_new IS NOT NULL)
THEN
   SET v_is_touched = 1;
END IF;  

CALL crm.create_activity_log (@err,
       v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm,
       v_task_type_new,
       v_stage_new, 
       v_stage_status_new,
       v_stage_status_name_new, 
       v_stage_status_code_new,
       v_task_status_type_new,
       v_lead_status_type_name,
       new.is_uploaded_record,   
       v_is_touched,           
       @osuid);
       
-- Get the notif ID       
       
   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "TASK_CREATION_ASSIGNED_BY";       

-- Send one notif to new task assigned_by 
   CALL user.create_user_notification(@err,
                                       new.assigned_by, -- Notif recipient
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Task Assigned',
                                       CURRENT_TIMESTAMP,
                                       DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);	


-- Get the notif ID       
       
   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "TASK_CREATION_ASSIGNED_TO";       

-- Send one notif to new task assigned_to 
   CALL user.create_user_notification(@err,
                                       new.assigned_to, -- Notif recipient
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Task Assigned',
                                       CURRENT_TIMESTAMP,
                                       DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);	


END;
$$

DELIMITER ;

DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_au_task$$

CREATE TRIGGER crm.t_au_task AFTER UPDATE on crm.task
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

DECLARE v_task_type_old VARCHAR(100);
DECLARE v_stage_old VARCHAR(100);
DECLARE v_stage_status_old VARCHAR(100);
DECLARE v_stage_status_name_old VARCHAR(100);
DECLARE v_stage_status_code_old VARCHAR(100);
DECLARE v_assigned_by_old VARCHAR(500);
DECLARE v_assigned_to_old VARCHAR(500);
DECLARE v_task_status_type_old VARCHAR(100);
DECLARE v_created_by_old VARCHAR(500);

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

DECLARE v_is_touched TINYINT DEFAULT 0;

SELECT task_type_name
  INTO v_task_type_old
  FROM crm.task_type
 WHERE task_type_id = old.task_type_id;
 
SELECT task_type_name
  INTO v_task_type_new
  FROM crm.task_type
 WHERE task_type_id = new.task_type_id;

SELECT stage, stage_status, stage_status_name, stage_status_code
  INTO v_stage_old, v_stage_status_old, v_stage_status_name_old, v_stage_status_code_old
  FROM crm.disposition_code
 WHERE disposition_code_id = old.disposition_code_id;
 
SELECT stage, stage_status, stage_status_name, stage_status_code
  INTO v_stage_new, v_stage_status_new, v_stage_status_name_new, v_stage_status_code_new
  FROM crm.disposition_code
 WHERE disposition_code_id = new.disposition_code_id;

SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_by_old
  FROM user.user u
 WHERE user_id = old.assigned_by;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_by_new
  FROM user.user u
 WHERE user_id = new.assigned_by;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_to_old
  FROM user.user u
 WHERE user_id = old.assigned_to;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_to_new
  FROM user.user u
 WHERE user_id = new.assigned_to;
 
SELECT task_status_type_name
  INTO v_task_status_type_old
  FROM crm.task_status_type
 WHERE task_status_type_id = old.task_status_type_id;
 
SELECT task_status_type_name
  INTO v_task_status_type_new
  FROM crm.task_status_type
 WHERE task_status_type_id = new.task_status_type_id;

SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_created_by_old
  FROM user.user u
 WHERE user_id = old.created_id;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_created_by_new
  FROM user.user u
 WHERE user_id = new.created_id;

SELECT lst.lead_status_type_name
  INTO v_lead_status_type_name
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
   AND l.lead_id = old.lead_id;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       old.lead_id,
       'TASK_UPDATE' AS activity_type,
       "T" AS activity_doc_type,       
       old.task_id AS activity_doc_pk_id,
       CONCAT(
		IF(IFNULL(old.task_type_id, '') <> IFNULL(new.task_type_id, ''), CONCAT(' task_type was modified from ', IFNULL(v_task_type_old, ''),' to ', IFNULL(v_task_type_new, ''), ';'),''),
		IF(IFNULL(old.disposition_code_id, '') <> IFNULL(new.disposition_code_id, ''), CONCAT(' disposition_code was modified from ', IFNULL(v_stage_status_code_old, ''),' to ', IFNULL(v_stage_status_code_new, ''), ';'),''),
		IF(IFNULL(old.lead_id, '') <> IFNULL(new.lead_id, ''), CONCAT(' lead_id was modified from ', IFNULL(old.lead_id, ''),' to ', IFNULL(new.lead_id, ''), ';'),''),
		IF(IFNULL(old.assigned_by, '') <> IFNULL(new.assigned_by, ''), CONCAT(' assigned_by was modified from ', IFNULL(v_assigned_by_old, ''),' to ', IFNULL(v_assigned_by_new, ''), ';'),''),
		IF(IFNULL(old.assigned_dtm, '') <> IFNULL(new.assigned_dtm, ''), CONCAT(' assigned_dtm was modified from ', IFNULL(old.assigned_dtm, ''),' to ', IFNULL(new.assigned_dtm, ''), ';'),''),
		IF(IFNULL(old.assigned_to, '') <> IFNULL(new.assigned_to, ''), CONCAT(' assigned_to was modified from ', IFNULL(v_assigned_to_old, ''),' to ', IFNULL(v_assigned_to_new, ''), ';'),''),
		IF(IFNULL(old.target_dtm, '') <> IFNULL(new.target_dtm, ''), CONCAT(' target_dtm was modified from ', IFNULL(old.target_dtm, ''),' to ', IFNULL(new.target_dtm, ''), ';'),''),
		IF(IFNULL(old.task_status_type_id, '') <> IFNULL(new.task_status_type_id, ''), CONCAT(' task_status_type was modified from ', IFNULL(v_task_status_type_old, ''),' to ', IFNULL(v_task_status_type_new, ''), ';'),''),
		IF(IFNULL(old.document_url, '') <> IFNULL(new.document_url, ''), CONCAT(' document_url was modified from ', IFNULL(old.document_url, ''),' to ', IFNULL(new.document_url, ''), ';'),''),
		IF(IFNULL(old.mode_of_contact, '') <> IFNULL(new.mode_of_contact, ''), CONCAT(' mode_of_contact was modified from ', IFNULL(old.mode_of_contact, ''),' to ', IFNULL(new.mode_of_contact, ''), ';'),''),
		IF(IFNULL(old.is_uploaded_record, '') <> IFNULL(new.is_uploaded_record, ''), CONCAT(' is_uploaded_record was modified from ', IFNULL(old.is_uploaded_record, ''),' to ', IFNULL(new.is_uploaded_record, ''), ';'),''),
		IF(IFNULL(old.status, '') <> IFNULL(new.status, ''), CONCAT(' status was modified from ', IFNULL(old.status, ''),' to ', IFNULL(new.status, ''), ';'),'')		
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

-- Only mark as touched if disposition fields change (Contactable/Non-contactable, Disposition Code, Disposition Status Name)
-- DO NOT mark as touched for: task_status_type_id, target_dtm, document_url, mode_of_contact
IF IFNULL(v_stage_old,'') <> IFNULL(v_stage_new,'')  OR
   IFNULL(v_stage_status_old,'') <> IFNULL(v_stage_status_new,'')  OR 
   IFNULL(v_stage_status_name_old,'') <> IFNULL(v_stage_status_name_new,'')  OR 
   IFNULL(v_stage_status_code_old,'') <> IFNULL(v_stage_status_code_new,'')  THEN
   SET v_is_touched = 1;
END IF;  

IF LENGTH(v_activity_detail) > 0 THEN 
CALL crm.create_activity_log (@err,
       v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm,
       v_task_type_new,
       v_stage_old, 
       v_stage_status_old,
       v_stage_status_name_old,
       v_stage_status_code_old,
       v_task_status_type_new,
       v_lead_status_type_name,
       0, -- new.is_uploaded_record,  
       v_is_touched,     
       @osuid);
END IF;

-- Create User Notif When assigned_by Changes
IF (old.assigned_by<>new.assigned_by) THEN 

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "TASK_ASSIGNED_BY_REASSIGN";
   
-- Send one notif to old assigned_by 
   CALL user.create_user_notification(@err,
                                       old.assigned_by, -- Notif recipient Old assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Task Unassigned',
                                       CURRENT_TIMESTAMP,
                                       DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to new assigned_by
   CALL user.create_user_notification(@err,
                                       new.assigned_by, -- Notif recipient New Assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Task Assigned',
                                       CURRENT_TIMESTAMP,
                                       DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

END IF;


-- Create User Notif When assigned_to Changes
IF (old.assigned_to<>new.assigned_to) THEN 

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "TASK_ASSIGNED_TO_REASSIGN";
   
-- Send one notif to old assigned_to 
   CALL user.create_user_notification(@err,
                                       old.assigned_to, -- Notif recipient Old assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Task Unassigned',
                                       CURRENT_TIMESTAMP,
                                       DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to new assigned_to
   CALL user.create_user_notification(@err,
                                       new.assigned_to, -- Notif recipient New Assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Task Assigned',
                                       CURRENT_TIMESTAMP,
                                       DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

END IF;

END;
$$

DELIMITER ;

DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_ai_note$$

CREATE TRIGGER crm.t_ai_note AFTER INSERT on crm.notes
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

DECLARE v_is_touched TINYINT DEFAULT 0;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       (SELECT lead_id FROM crm.task WHERE task_id = new.task_id LIMIT 1) AS lead_id,
       'NOTES_INSERT' AS activity_type,
       "N" AS activity_doc_type,             
       new.note_id AS activity_doc_pk_id,
       CONCAT(
		CONCAT(' note_id was created as ', IFNULL(new.note_id, ''), ';'),
		CONCAT(' task_id was created as ', IFNULL(new.task_id, ''), ';'),
		CONCAT(' note was created as ', IFNULL(new.note, ''), ';'),
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

-- To handle Feedback during uploads
-- Only mark as touched if feedback is provided AND this is an uploaded record
-- Regular notes (non-uploaded) should NOT mark accounts as touched
IF new.note IS NOT NULL AND new.is_uploaded_record = 1 THEN
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
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL, 
       new.is_uploaded_record,
       v_is_touched,             
       @osuid);

-- Create User Notif When New notes are added

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "NOTES_ADDED";

   SELECT assigned_by,
          assigned_to
     INTO v_assigned_by,
          v_assigned_to
     FROM crm.task 
	WHERE task_id = new.task_id;
   
-- Send one notif to assigned by of the task
   CALL user.create_user_notification(@err,
                                       v_assigned_by, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Notes Added',
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
                                       'New Notes Added',
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

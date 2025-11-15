--  call `crm`.edit_task(@err,2,1,1,1,1,1,CURRENT_TIMESTAMP,2,CURRENT_TIMESTAMP,1,"www.newdoc.com",1);
--  call `crm`.edit_task(@err,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
DROP PROCEDURE IF EXISTS crm.edit_task; 

DELIMITER $$
CREATE PROCEDURE crm.edit_task   (OUT error_code INT,
			                      IN in_app_user_id BIGINT,
			                      IN in_task_id BIGINT,
				                  IN in_task_type_id MEDIUMINT,
				                  IN in_disposition_code_id BIGINT,
				                  IN in_lead_id BIGINT,
				                  IN in_assigned_by BIGINT,
				                  IN in_assigned_dtm TIMESTAMP,
				                  IN in_assigned_to BIGINT,
				                  IN in_target_dtm TIMESTAMP,
				                  IN in_task_status_type_id MEDIUMINT,
				                  IN in_document_url VARCHAR(5000),
				                  IN in_mode_of_contact VARCHAR(15),
                                  IN in_status TINYINT                                                
                                  )
                                                
BEGIN

SET error_code = -2;

UPDATE crm.task
   SET task_type_id = IFNULL(in_task_type_id, task_type_id),
       disposition_code_id = IFNULL(in_disposition_code_id, disposition_code_id),
       lead_id = IFNULL(in_lead_id, lead_id),
       assigned_by = IFNULL(in_assigned_by, assigned_by),
       assigned_dtm = IFNULL(DATE(in_assigned_dtm), assigned_dtm),
       assigned_to = IFNULL(in_assigned_to, assigned_to),
       target_dtm = IFNULL(DATE(in_target_dtm), target_dtm),
       task_status_type_id = IFNULL(in_task_status_type_id, task_status_type_id),
       document_url = IFNULL(in_document_url, document_url),
       mode_of_contact = IFNULL(in_mode_of_contact, mode_of_contact),
       status = IFNULL(in_status, status),
       modified_id = IFNULL(in_app_user_id, modified_id)
 WHERE task_id = in_task_id; 

SET error_code=0;

END$$
DELIMITER ;

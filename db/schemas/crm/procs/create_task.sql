-- call `crm`.create_task(@err,2,2,2,2,2,CURRENT_TIMESTAMP,2,CURRENT_TIMESTAMP,1,"https://firebase.com",1,@onid);

DROP PROCEDURE IF EXISTS `crm`.create_task;

DELIMITER $$
CREATE PROCEDURE `crm`.create_task(OUT error_code INT,
			          IN in_app_user_id BIGINT,
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
				  OUT out_task_id BIGINT
                                   )
BEGIN

SET error_code=-2;

INSERT INTO `crm`.task(
        task_id,              
        task_type_id,         
        disposition_code_id,  
        lead_id,              
        assigned_by,          
        assigned_dtm,         
        assigned_to,          
        target_dtm,           
        task_status_type_id,  
        document_url,      
        mode_of_contact,   
        is_automated,
        is_uploaded_record,
        status,               
        created_id,           
        created_dtm,          
        modified_id,
        modified_dtm
 
       )
VALUES
       (NULL,
        in_task_type_id,         
        in_disposition_code_id,
        in_lead_id,
        in_assigned_by,
        DATE(in_assigned_dtm),
        IFNULL(in_assigned_to,8),
        DATE(in_target_dtm),
        IFNULL(in_task_status_type_id,1),
        in_document_url,
        in_mode_of_contact,
        0,
        0,
        1,
        in_app_user_id,
	CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()        
       )
  ON DUPLICATE KEY UPDATE 
         disposition_code_id = IFNULL(in_disposition_code_id, disposition_code_id),
         assigned_by = IFNULL(in_assigned_by, assigned_by),
         assigned_dtm = IFNULL(DATE(in_assigned_dtm), assigned_dtm),
         -- assigned_to = IFNULL(in_assigned_to, assigned_to),
         target_dtm = IFNULL(DATE(in_target_dtm), target_dtm),
         -- task_status_type_id = IFNULL(in_task_status_type_id, task_status_type_id),
         document_url = IFNULL(in_document_url, document_url),
         mode_of_contact = IFNULL(in_mode_of_contact, mode_of_contact),         
         status = 1,
         modified_id = IFNULL(in_app_user_id, modified_id),
         modified_dtm = CURRENT_TIMESTAMP,
         task_id = LAST_INSERT_ID(task_id);
       
SET out_task_id=LAST_INSERT_ID();

COMMIT;

SET error_code=0;
 
END$$
DELIMITER ;

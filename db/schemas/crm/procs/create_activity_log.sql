-- call crm.create_activity_log (@err,2,1,"NEW_ACCOUNT","L",1,'leads',CURRENT_TIMESTAMP,"TT","dstg","dsts","dcd","tst","lst",@osuid);

DROP PROCEDURE IF EXISTS crm.create_activity_log;

DELIMITER $$
CREATE PROCEDURE crm.create_activity_log(OUT error_code INT
				       	,IN in_app_user_id BIGINT
				       	,IN in_lead_id BIGINT
				       	,IN in_activity_type VARCHAR(45)
					,IN in_activity_doc_type CHAR(1)				       	
					,IN in_activity_doc_pk_id BIGINT
					,IN in_activity_detail TEXT
					,IN in_activity_dtm TIMESTAMP
					,IN in_task_type VARCHAR(100)
					,IN in_stage VARCHAR(100)
					,IN in_stage_status VARCHAR(100)
					,IN in_stage_status_name VARCHAR(100)
					,IN in_stage_status_code VARCHAR(20)
					,IN in_task_status_type VARCHAR(100)
					,IN in_lead_status_type VARCHAR(100)
                                        ,IN in_is_uploaded_record TINYINT
                                        ,IN in_is_touched TINYINT
                                       	,OUT out_activity_log_id BIGINT
                                        )
BEGIN

SET error_code=-2;

INSERT INTO crm.activity_log
       ( 
        activity_log_id,
        lead_id, 
        activity_type,
        activity_doc_type,        
        activity_doc_pk_id,
        activity_detail,
        activity_dtm,
        task_type,
	stage,
	stage_status,
	stage_status_name,
	stage_status_code,
	task_status_type,
        lead_status_type,
        is_uploaded_record,
        is_touched,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
       )
VALUES
       ( NULL,
        in_lead_id, 
        in_activity_type,
        in_activity_doc_type,        
        in_activity_doc_pk_id,
        in_activity_detail,
        in_activity_dtm,
        in_task_type,
	in_stage,
	in_stage_status,
	in_stage_status_name,
	in_stage_status_code,
	in_task_status_type,
        in_lead_status_type,
        in_is_uploaded_record,
        in_is_touched,
        1,
        in_app_user_id,
	CURRENT_TIMESTAMP(),
        in_app_user_id,        
	CURRENT_TIMESTAMP()
       );
       
SET out_activity_log_id=LAST_INSERT_ID();


SET error_code=0;
 
END$$
DELIMITER ;

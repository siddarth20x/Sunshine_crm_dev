-- call user.create_user_activity_log (@err,2,"CREATE_user",1,1,'user name',CURRENT_TIMESTAMP,@osuid);

DROP PROCEDURE IF EXISTS user.create_user_activity_log;

DELIMITER $$
CREATE PROCEDURE user.create_user_activity_log(OUT error_code INT
				       	,IN in_app_user_id BIGINT
				       	,IN in_activity_type VARCHAR(45)
					,IN in_activity_doc_pk_id BIGINT
					,IN in_activity_doc_num VARCHAR(100)
					,IN in_activity_detail TEXT
					,IN in_activity_dtm TIMESTAMP
                                       	,OUT out_user_activity_log_id BIGINT
                                        )
BEGIN

SET error_code=-2;

INSERT INTO user.user_activity_log
       ( 
        user_activity_log_id,
        user_id, 
        activity_type,
        activity_doc_pk_id,
        activity_doc_num,
        activity_detail,
        activity_dtm,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
       )
VALUES
       ( NULL,
        in_app_user_id, 
        in_activity_type,
        in_activity_doc_pk_id,
        in_activity_doc_num,
        in_activity_detail,
        in_activity_dtm,
        1,
        in_app_user_id,
	CURRENT_TIMESTAMP(),
        in_app_user_id,        
	CURRENT_TIMESTAMP()
       );
       
SET out_user_activity_log_id=LAST_INSERT_ID();


SET error_code=0;
 
END$$
DELIMITER ;

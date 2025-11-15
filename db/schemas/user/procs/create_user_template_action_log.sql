-- call user.create_user_template_data_doc(@err,0,2,3,'blob','2019-11-11','55555',@oacid);

DROP PROCEDURE IF EXISTS user.create_user_template_action_log;

DELIMITER $$
CREATE PROCEDURE user.create_user_template_action_log(OUT error_code INT,
                                                IN in_app_user_id BIGINT,
						IN in_user_template_docs_id BIGINT,
 						IN in_user_id BIGINT,
						IN in_user_template_data_doc BLOB,
						IN in_action_dtm TIMESTAMP,
        					IN in_action_by_id BIGINT, 
                                                OUT out_user_template_action_log_id BIGINT)

BEGIN


SET error_code = -2;


INSERT INTO user.user_template_action_log
(user_template_action_log_id,
		user_template_docs_id,
        user_id,
        user_template_data_doc,
        action_dtm,
        action_by_id,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
        )
        
VALUES
       (NULL,
	in_user_template_docs_id,
        in_user_id,
        in_user_template_data_doc,
        in_action_dtm,
        in_action_by_id,
        1,
        in_app_user_id,
        CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()
        );


SET out_user_template_action_log_id = LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;

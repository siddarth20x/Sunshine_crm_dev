-- call user.get_user_template_action_log(@err, 2, null);
-- call user.get_user_template_action_log(@err, null,3);

DROP PROCEDURE IF EXISTS user.get_user_template_action_log;

DELIMITER $$
CREATE PROCEDURE user.get_user_template_action_log(OUT error_code INT, 
                                       IN in_user_template_docs_id BIGINT,
                                       IN in_user_id BIGINT                                      
                                      )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT tal.user_template_action_log_id,
        tal.user_template_docs_id,
        tal.user_id, 
        tal.user_template_data_doc,
        tal.action_dtm,
        tal.action_by_id,
        tal.status,
        tal.created_id,
        tal.created_dtm,
        tal.modified_id,
        tal.modified_dtm
   FROM user.user_template_action_log tal
  WHERE tal.status = 1';

IF in_user_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND tal.user_id  = ', in_user_id);
END IF;

IF in_user_template_docs_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND tal.user_template_docs_id = ', in_user_template_docs_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;


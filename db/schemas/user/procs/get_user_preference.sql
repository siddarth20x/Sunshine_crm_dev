-- call user.get_user_preference(@err,null,null);
DELIMITER $$

DROP PROCEDURE IF EXISTS `user`.get_user_preference$$

CREATE  PROCEDURE `user`.get_user_preference(OUT error_code INT
                                   ,IN in_user_preference_id BIGINT
                                   ,IN in_user_id BIGINT
                                    )
BEGIN
SET error_code = -2;
SET @q = CONCAT('

SELECT up.user_preference_id, 
       up.user_id, 
       up.preferred_module_ids, 
       up.preferred_notification_type_ids, 
       up.status, 
       up.created_id, 
       up.created_dtm, 
       up.modified_id, 
       up.modified_dtm
  FROM user.user_preference up
 WHERE up.status = 1 ');
 

 IF in_user_preference_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND up.user_preference_id = ',in_user_preference_id);
 END IF;
 
 IF in_user_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND up.user_id = ',in_user_id);
 END IF;

 
 PREPARE stmt FROM @q;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
 
SET error_code = 0;
END$$

DELIMITER ;
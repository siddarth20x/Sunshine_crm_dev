-- call user.get_user_dashboard_count(@err,4);
DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_user_dashboard_count$$

CREATE  PROCEDURE user.get_user_dashboard_count(OUT error_code INT, 
                                              IN in_user_id BIGINT)
BEGIN

SET error_code = -2;

SELECT 'user_notification' AS count_type, COUNT(1) AS count
  FROM user.user_notification
 WHERE user_id = in_user_id;

SET error_code = 0;

END$$

DELIMITER ;

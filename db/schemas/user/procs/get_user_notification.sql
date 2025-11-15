-- call user.get_user_notification(@err,2,null,null,null,null,null,null);
-- call user.get_user_notification(@err,2,2,null,null,null,null,0);
DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_user_notification$$

CREATE  PROCEDURE user.get_user_notification(OUT error_code INT, 
                                              IN in_app_user_id BIGINT,
                                              IN in_user_notification_id BIGINT, 
                                              IN in_notification_type_id INT,
                                              IN in_notification_effective_from DATETIME,
                                              IN in_notification_effective_to DATETIME,                                              
                                              IN in_notification_acknowledged_on TIMESTAMP,
                                              IN in_is_notification_acknowledged TINYINT
                                              )
BEGIN

SET error_code = -2;

SET @q = CONCAT('
SELECT un.user_notification_id,
       un.user_id, 
       n.notification_type_id,
       REPLACE(n.notification_type_name,"_"," ") AS notification_type_name,
       n.notification_type_description,
       un.notification_name AS notification_value,
       un.notification_message,
       DATE_FORMAT(un.created_dtm, "%e/%c/%Y %h:%i:%s %p") AS created_on,
       DATE_FORMAT(un.notification_effective_from, "%e/%c/%Y %h:%i:%s %p") AS effective_from,
       DATE_FORMAT(un.notification_effective_to, "%e/%c/%Y %h:%i:%s %p") AS effective_to,
       un.notification_lifespan_days,
       un.notification_publish_flag,
       un.acknowledgment_required,
       un.notification_acknowledged_on
  FROM user.user_notification un,
       user.notification_type n
 WHERE un.notification_type_id = n.notification_type_id
   AND un.user_id = ',in_app_user_id);

IF in_user_notification_id IS NOT NULL THEN
   SET @q = CONCAT(@q,' AND un.user_notification_id = ', in_user_notification_id );
END IF;

IF in_notification_type_id IS NOT NULL THEN
   SET @q = CONCAT(@q,' AND un.notification_type_id = ', in_notification_type_id );
END IF;

IF in_notification_effective_from IS NOT NULL  THEN
SET @q = CONCAT(@q,' AND NOT ( un.notification_effective_from < "',in_notification_effective_from,'" AND un.notification_effective_to < "',in_notification_effective_from,'" )');
END IF; 
 
IF in_notification_effective_to IS NOT NULL THEN
SET @q = CONCAT(@q,' AND NOT ( un.notification_effective_from > "',in_notification_effective_to,'" AND un.notification_effective_to > "',in_notification_effective_to,'" )');
END IF;
 
IF in_notification_acknowledged_on IS NOT NULL THEN
   SET @q = CONCAT(@q,' AND un.notification_acknowledged_on = ','"',in_notification_acknowledged_on,'"');
END IF; 

IF in_is_notification_acknowledged IS NOT NULL THEN

   IF in_is_notification_acknowledged = 0 THEN
   SET @q = CONCAT(@q,' AND un.notification_acknowledged_on IS NULL ');
   END IF;
   
   IF in_is_notification_acknowledged = 1 THEN
   SET @q = CONCAT(@q,' AND un.notification_acknowledged_on IS NOT NULL ');
   END IF;
   
END IF; 

 
SET @q = CONCAT(@q,' AND n.status = 1 AND un.status = 1 ORDER BY un.created_dtm ASC ');

PREPARE stmt FROM @q;

EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$

DELIMITER ;

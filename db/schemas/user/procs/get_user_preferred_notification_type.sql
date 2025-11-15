-- call user.get_user_preferred_notification_type(@err,2);

DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_user_preferred_notification_type$$

CREATE  PROCEDURE user.get_user_preferred_notification_type(OUT error_code INT
							    ,IN in_user_id BIGINT)
BEGIN
DECLARE v_pref_notf_type_ids TEXT DEFAULT NULL;
SET error_code = -2;

SET @q='
SELECT urc.user_id,
       nt.notification_type_id,
       nt.company_id,
       comp.company_code,
       nt.module_id,
       nt.notification_type_name,
       nt.notification_type_description,
       up.user_preference_id,
       up.preferred_module_ids,
       up.preferred_notification_type_ids,
       IF(FIND_IN_SET(nt.notification_type_id,IFNULL(up.preferred_notification_type_ids,"")),TRUE,FALSE) AS is_preferred
 FROM user.user_role_company urc
 INNER JOIN user.notification_type nt
   ON ( ';
   
IF in_user_id IS NOT NULL THEN
SET @q=CONCAT(@q,' urc.user_id = ',in_user_id ,' AND ');
END IF;

SET @q=CONCAT(@q,'
  nt.company_id = urc.company_id
  AND nt.module_id = urc.module_id )
 INNER JOIN org.company comp
   ON (nt.company_id = comp.company_id)
  LEFT OUTER JOIN user.user_preference up
  ON ( up.user_id = urc.user_id )
  ORDER BY nt.company_id,nt.module_id;');

 -- SELECT @q;
 PREPARE stmt FROM @q;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
 
SET error_code = 0;
END$$

DELIMITER ;

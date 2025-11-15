
-- call user.get_notification_type(@err,null,null,null,NULL);

DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_notification_type$$

CREATE  PROCEDURE user.get_notification_type(OUT error_code INT
                                   ,IN in_notification_type_id INT
                                   ,IN in_company_id BIGINT
                                   ,IN in_module_id INT
                                   ,IN in_notification_type_name VARCHAR(45)
                                   )
BEGIN
SET error_code = -2;
SET @q = CONCAT('

select  notification_type_id,
        company_id,
        module_id, 
        role_mask,
        notification_type_name, 
        notification_type_description, 
        status,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
        
  FROM 
        user.notification_type n
     
 WHERE  1 = 1  ');
 
 IF in_notification_type_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND notification_type_id = ',in_notification_type_id);
 END IF;

IF in_company_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND company_id = ',in_company_id);
 END IF;

  IF in_module_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND module_id = ',in_module_id);
 END IF;
 
 IF in_notification_type_name IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND UPPER (notification_type_name) = ', "'",UPPER(in_notification_type_name),"'"); 
 END IF;
 
 SET @q = CONCAT(@q,' AND status = 1');
 -- SELECT @q;
 PREPARE stmt FROM @q;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
 
SET error_code = 0;
END$$

DELIMITER ;

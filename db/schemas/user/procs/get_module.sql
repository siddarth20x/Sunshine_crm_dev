-- call user.get_module(@err,1,null);

DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_module$$

CREATE  PROCEDURE user.get_module(OUT error_code INT
                                   ,IN in_module_id INT
                                   ,IN in_module_name VARCHAR(50)
                                   )
BEGIN
SET error_code = -2;
SET @q = CONCAT('

select  module_id, 
        module_name, 
        module_desc,
        module_bit,
        route_name,
        module_icon,
        module_type,
        module_alias,
        module_group,
        module_group_sort_order,
        module_sort_order,
        status,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
        
  FROM 
        user.module n
     
 WHERE  1 = 1  ');
 
 IF in_module_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND module_id = ',in_module_id);
 END IF;
 
 IF in_module_name IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND UPPER (module_name) = ', "'",UPPER(in_module_name),"'"); 
 END IF;
 
 SET @q = CONCAT(@q,' AND status = 1');
 -- SELECT @q;
 PREPARE stmt FROM @q;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
 
SET error_code = 0;
END$$

DELIMITER ;


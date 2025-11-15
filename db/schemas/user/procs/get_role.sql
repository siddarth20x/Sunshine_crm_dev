-- call user.get_role(@err,1,null);

DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_role$$

CREATE  PROCEDURE user.get_role(OUT error_code INT
                                   ,IN in_role_id INT
                                   ,IN in_role_name VARCHAR(50)
                                   )
BEGIN
SET error_code = -2;
SET @q = CONCAT('

select  role_id, 
        role_name, 
        role_desc,
        role_bit,
        status,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
        
  FROM 
        user.role n
     
 WHERE  1 = 1  ');
 
 IF in_role_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND role_id = ',in_role_id);
 END IF;
 
 IF in_role_name IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND UPPER (role_name) = ', "'",UPPER(in_role_name),"'"); 
 END IF;
 
 SET @q = CONCAT(@q,' AND status = 1');
 -- SELECT @q;
 PREPARE stmt FROM @q;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
 
SET error_code = 0;
END$$

DELIMITER ;

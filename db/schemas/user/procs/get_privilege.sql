-- call user.get_privilege(@err,1,null);

DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_privilege$$

CREATE  PROCEDURE user.get_privilege(OUT error_code INT
                                   ,IN in_privilege_id INT
                                   ,IN in_privilege_name VARCHAR(50)
                                   )
BEGIN
SET error_code = -2;
SET @q = CONCAT('

select  privilege_id, 
        privilege_name, 
        privilege_desc,
        privilege_bit,
        status,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
        
  FROM 
        user.privilege n
     
 WHERE  1 = 1  ');
 
 IF in_privilege_id IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND privilege_id = ',in_privilege_id);
 END IF;
 
 IF in_privilege_name IS NOT NULL THEN
 SET @q = CONCAT(@q,' AND UPPER (privilege_name) = ', "'",UPPER(in_privilege_name),"'"); 
 END IF;
 
 SET @q = CONCAT(@q,' AND status = 1');
 -- SELECT @q;
 PREPARE stmt FROM @q;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
 
SET error_code = 0;
END$$

DELIMITER ;

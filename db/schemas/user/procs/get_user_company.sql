-- call user.get_user_company(@err,2,null,null,null);
-- call user.get_user_company(@err,2,1,2,2);
DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_user_company$$

CREATE  PROCEDURE user.get_user_company(OUT error_code INT, 
                                              IN in_app_user_id BIGINT,
                                              IN in_user_company_id BIGINT, 
                                              IN in_user_id BIGINT,
                                              IN in_company_id BIGINT
                                              )
BEGIN

SET error_code = -2;

SET @q = CONCAT('
SELECT uc.user_company_id,
       uc.user_id,
       CONCAT(u.first_name, " ", u.last_name) as user_full_name,
       uc.company_id,
       c.company_name,
       uc.status,
       uc.created_id,
       uc.created_dtm,
       uc.modified_id,
       uc.modified_dtm
  FROM user.user_company uc
  JOIN user.user u
    ON uc.user_id = u.user_id 
  JOIN org.company c
    ON uc.company_id = c.company_id
 WHERE uc.status = 1 '
 );

IF in_user_company_id IS NOT NULL THEN
   SET @q = CONCAT(@q,' AND uc.user_company_id = ', in_user_company_id );
END IF;

IF in_user_id IS NOT NULL THEN
   SET @q = CONCAT(@q,' AND u.user_id = ', in_user_id );
END IF;

IF in_company_id IS NOT NULL THEN
   SET @q = CONCAT(@q,' AND c.company_id = ', in_company_id );
END IF;
 
PREPARE stmt FROM @q;

EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$

DELIMITER ;

-- call user.get_user_template_docs(@err,'wlc_email_to_user');
DELIMITER $$

DROP PROCEDURE IF EXISTS `user`.`get_user_template_docs`;

CREATE  PROCEDURE `user`.`get_user_template_docs`(OUT error_code INT,
							IN in_user_template_type_name VARCHAR(300)							
							)
BEGIN

SET error_code = -2;

SET @get_q = '
SELECT  user_template_docs_id
       ,user_template_type_name
       ,user_template_doc
       ,status
       ,created_id
       ,modified_id
       ,modified_dtm
       ,created_dtm
  
  FROM user.user_template_docs t
  WHERE 1 = 1' ;


IF in_user_template_type_name IS NOT NULL THEN
  SET @get_q = CONCAT(@get_q,'
   AND UPPER(t.user_template_type_name) =  ','"',UPPER(in_user_template_type_name),'"');

END IF;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$

DELIMITER ;



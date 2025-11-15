-- call stage.get_file_upload (@err,1,null,null,null,null);

DROP PROCEDURE IF EXISTS stage.get_file_upload;

DELIMITER $$
CREATE PROCEDURE stage.get_file_upload(OUT error_code INT, 
					IN in_app_user_id BIGINT,
					IN in_file_upload_id BIGINT,
					IN in_file_name VARCHAR(1000),
                                        IN in_file_url VARCHAR(1000),
                                        IN in_company_id BIGINT,
                                        IN in_start_dtm TIMESTAMP,
                                        IN in_end_dtm TIMESTAMP
                                      )
BEGIN
SET error_code = -2;

SET @get_q = '
SELECT f.file_upload_id,
       f.file_type,
       f.file_name,
       f.file_url,
       f.company_id,
       o.company_code AS bank_code,
       o.company_name AS bank_name,
       CONCAT(u.first_name, " ", u.last_name) AS user_name,
       u.email_address,
       f.status,
       f.created_id,
       f.created_dtm,
       f.modified_id,
       f.modified_dtm
  FROM stage.file_upload f
  JOIN org.company o
    ON f.company_id = o.company_id
  JOIN user.user u
    ON f.created_id = u.user_id
 WHERE 1=1 ';


IF in_file_upload_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND f.file_upload_id  = ', in_file_upload_id);
END IF;

IF in_file_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND f.file_name = ','"', in_file_name, '"');
END IF;

IF in_file_url IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND f.file_url = ','"', in_file_url, '"');
END IF;

IF in_company_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND f.company_id  = ', in_company_id);
END IF;

IF in_start_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND f.created_dtm >= ', '"', in_start_dtm, '"');
END IF; 

IF in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND f.created_dtm < ', '"', in_end_dtm, '"');
END IF; 

IF in_app_user_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND f.created_id  = ', in_app_user_id);
END IF;

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;
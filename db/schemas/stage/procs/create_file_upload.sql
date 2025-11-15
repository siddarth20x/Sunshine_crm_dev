-- call stage.create_file_upload (@err, 1, 'csv', 'some_upload', 'http://13323', 3, @oumt);


DROP PROCEDURE IF EXISTS stage.create_file_upload;

DELIMITER $$
CREATE PROCEDURE stage.create_file_upload(OUT error_code INT
				       ,IN in_app_user_id BIGINT
				       ,IN in_file_type VARCHAR(20)
				       ,IN in_file_name VARCHAR(1000)
				       ,IN in_file_url VARCHAR(1000)
                                       ,IN in_company_id BIGINT
                                       ,OUT out_file_upload_id BIGINT
                                        )
BEGIN

SET error_code=-2;

INSERT INTO stage.file_upload (
       file_upload_id,
       file_type,
       file_name,
       file_url,
       company_id,
       status,
       created_id,
       modified_id
       )
VALUES
       (NULL, 
       in_file_type,
       in_file_name,
       in_file_url,
       in_company_id,
       1,
       in_app_user_id,
       in_app_user_id        
       );
       
SET out_file_upload_id = LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;
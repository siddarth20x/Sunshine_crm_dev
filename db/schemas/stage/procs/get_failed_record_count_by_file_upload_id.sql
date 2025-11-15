-- call stage.get_failed_record_count_by_file_upload_id(@err,1);
DROP PROCEDURE IF EXISTS `stage`.`get_failed_record_count_by_file_upload_id`;

DELIMITER $$ 
CREATE PROCEDURE `stage`.`get_failed_record_count_by_file_upload_id`(
	 OUT error_code INT
	,IN in_file_upload_id BIGINT
)

BEGIN
SET error_code = -2;

SELECT COUNT(1) AS record_count
  FROM stage.lead_stage ls
  WHERE is_uploaded_flag IN ("N","E")
    AND file_upload_id = in_file_upload_id;

SET error_code = 0;

END$$ 
DELIMITER ;
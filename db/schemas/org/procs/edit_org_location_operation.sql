-- call org.edit_org_location_operation (@err, 123, 2, '2018-04-04', '2039-05-05','09:00', '20:30', 1);

DROP PROCEDURE IF EXISTS org.edit_org_location_operation;

DELIMITER $$
CREATE PROCEDURE org.edit_org_location_operation(OUT error_code INT
				       ,IN in_app_user_id BIGINT
                                       ,IN in_location_id BIGINT
                                       ,IN in_location_start_date DATETIME
                                       ,IN in_location_end_date DATETIME
                                       ,IN in_location_start_time TIME
                                       ,IN in_location_end_time TIME
                                       ,IN in_status TINYINT
)

BEGIN
SET error_code=-2;

UPDATE org.location_operation 
SET 
        location_start_date   = IFNULL(in_location_start_date, location_start_date),
        location_end_date     = IFNULL(in_location_end_date, location_end_date),
        location_start_time   = IFNULL(in_location_start_time, location_start_time),
        location_end_time     = IFNULL(in_location_end_time, location_end_time),
        modified_id           = in_app_user_id,
        status                = IFNULL(in_status, status)
WHERE
        location_id = in_location_id;
       
SET error_code=0;  

END$$
DELIMITER ;

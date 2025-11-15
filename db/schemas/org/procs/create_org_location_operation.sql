-- call org.create_org_location_operation (@err, 123, 2, '2019-1-1', '2999-02-02', '08:00', '20:00', @aid); 

DROP PROCEDURE IF EXISTS org.create_org_location_operation;

DELIMITER $$
CREATE PROCEDURE org.create_org_location_operation(OUT error_code INT
				       ,IN in_app_user_id BIGINT
                                       ,IN in_location_id BIGINT
                                       ,IN in_location_start_date DATETIME
                                       ,IN in_location_end_date DATETIME
                                       ,IN in_location_start_time TIME
                                       ,IN in_location_end_time TIME
                                       ,OUT out_location_operation BIGINT
                                        )
BEGIN

SET error_code=-2;

INSERT INTO org.location_operation 
       (location_operation_id, 
        location_id,
        location_start_date,
        location_end_date,
        location_start_time,
        location_end_time,
        status,
        created_id,
        modified_id
       )
VALUES
       (NULL, 
        in_location_id, 
        in_location_start_date,
        in_location_end_date,
        in_location_start_time,
        in_location_end_time,
        1,
        in_app_user_id,
        in_app_user_id        
       );
       
SET out_location_operation=LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;


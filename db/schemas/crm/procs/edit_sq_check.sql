--  call `crm`.edit_sq_check(@err,3,1,1,1,'NOT MET',6,'NOT MET',7,'NOT MET',8,1);
DROP PROCEDURE IF EXISTS crm.edit_sq_check; 

DELIMITER $$
CREATE PROCEDURE crm.edit_sq_check(OUT error_code INT,
			                      IN in_app_user_id BIGINT,
				                  IN in_sq_check_id BIGINT,
				                  IN in_lead_id BIGINT,
				                  IN in_task_id BIGINT,
				                  IN in_sq_parameter_type_id BIGINT,
				                  IN in_scoring1_status VARCHAR(10),
				                  IN in_scoring1 FLOAT,
                                  IN in_scoring2_status VARCHAR(10),
				                  IN in_scoring2 FLOAT,
                                  IN in_scoring3_status VARCHAR(10),
				                  IN in_scoring3 FLOAT,
                                  IN in_status TINYINT                                                
                                  )
                                                
BEGIN

SET error_code = -2;

UPDATE crm.sq_check
   SET sq_check_id = IFNULL(in_sq_check_id, sq_check_id),
       lead_id = IFNULL(in_lead_id, lead_id),
       task_id = IFNULL(in_task_id, task_id),
       sq_parameter_type_id = IFNULL(in_sq_parameter_type_id, sq_parameter_type_id),
       scoring1_status = IFNULL(in_scoring1_status, scoring1_status),
       scoring1 = IFNULL(in_scoring1, scoring1),
       scoring2_status = IFNULL(in_scoring2_status, scoring2_status),
       scoring2 = IFNULL(in_scoring2, scoring2),
       scoring3_status = IFNULL(in_scoring3_status, scoring3_status),
       scoring3 = IFNULL(in_scoring3, scoring3),
       status = IFNULL(in_status, status),
       modified_id = IFNULL(in_app_user_id, modified_id)
 WHERE sq_check_id = in_sq_check_id; 

SET error_code=0;

END$$
DELIMITER ;

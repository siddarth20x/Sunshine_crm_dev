-- call `crm`.create_sq_check(@err,3,1,1,'MET',5,'MET',6,'MET,7,@osqchkid);

DROP PROCEDURE IF EXISTS `crm`.create_sq_check;

DELIMITER $$
CREATE PROCEDURE `crm`.create_sq_check(OUT error_code INT,
			                  IN in_app_user_id BIGINT,
				           IN in_lead_id BIGINT,
                                       IN in_task_id BIGINT,
				           IN in_sq_parameter_type_id BIGINT,
				           IN in_scoring1_status VARCHAR(10),
				           IN in_scoring1 FLOAT,
                                       IN in_scoring2_status VARCHAR(10),
				           IN in_scoring2 FLOAT,
                                       IN in_scoring3_status VARCHAR(10),
				           IN in_scoring3 FLOAT,
				           OUT out_sq_check_id BIGINT
                                   )
BEGIN

SET error_code=-2;

INSERT INTO `crm`.sq_check(
        sq_check_id,              
        lead_id,         
        task_id,         
        sq_parameter_type_id,  
        scoring1_status,              
        scoring1,          
        scoring2_status,         
        scoring2,          
        scoring3_status,           
        scoring3,  
        status,               
        created_id,           
        created_dtm,          
        modified_id,
        modified_dtm
 
       )
VALUES
       (NULL,
        in_lead_id,         
        in_task_id,         
        in_sq_parameter_type_id,
        in_scoring1_status,
        in_scoring1,
        in_scoring2_status,
        in_scoring2,
        in_scoring3_status,
        in_scoring3,
        1,
        in_app_user_id,
	    CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()        
       );
       
SET out_sq_check_id=LAST_INSERT_ID();

COMMIT;

SET error_code=0;
 
END$$
DELIMITER ;

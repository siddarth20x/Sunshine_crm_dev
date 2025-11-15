-- call org.create_org_location(@err,
-- 2,2,1,'Malleswaram','CS1',
-- 'Codeswift Bank','CS Bank Address Line 1','',
-- '','Bangalore','Karnataka','India','560003',1,@olaid);

DROP PROCEDURE IF EXISTS org.create_org_location;

DELIMITER $$
CREATE PROCEDURE org.create_org_location(OUT error_code INT,
				          IN in_app_user_id BIGINT,
				          IN in_company_id BIGINT,
				          IN in_location_type_id MEDIUMINT,
                                          IN in_location_name VARCHAR(100), 
                                          IN in_location_code VARCHAR(10), 
                                          IN in_address_name VARCHAR(100), 
                                          IN in_address_line_1 VARCHAR(100), 
                                          IN in_address_line_2 VARCHAR(100), 
                                          IN in_address_line_3 VARCHAR(100), 
                                          IN in_city VARCHAR(100), 
                                          IN in_state VARCHAR(100), 
                                          IN in_country VARCHAR(100), 
                                          IN in_zipcode  VARCHAR(45), 
                                          IN in_address_type_id MEDIUMINT, 
                                         OUT out_location_address_id BIGINT
                                        )
BEGIN

DECLARE v_location_id BIGINT DEFAULT NULL;
DECLARE v_address_id BIGINT DEFAULT NULL;

SET error_code=-2;

INSERT INTO org.location 
       (location_id, 
        location_name,
        location_code,
        location_type_id,
        company_id,
        status,
        created_id,
        modified_id
       )
VALUES
       (NULL, 
        UPPER(in_location_name),
        UPPER(in_location_code),
        in_location_type_id, 
        in_company_id,
        1,
        in_app_user_id,
        in_app_user_id        
       );
       
SET v_location_id = LAST_INSERT_ID();

-- 2nd creating address entry

INSERT INTO org.address
       (location_id,
       address_name,
        address_type_id,
        address_line_1,
        address_line_2,
        address_line_3,
        city,
        state,
        country,
        zipcode,
        STATUS,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
        )
VALUES
       (v_location_id,
       UPPER(in_address_name),
        in_address_type_id,
        UPPER(in_address_line_1),
        UPPER(in_address_line_2),
        UPPER(in_address_line_3),
        UPPER(in_city),
        UPPER(in_state),
        UPPER(in_country),
        UPPER(in_zipcode),
        1, 
        in_app_user_id, 
        CURRENT_TIMESTAMP(),
        in_app_user_id, 
        CURRENT_TIMESTAMP()
        );
 

SET v_address_id = LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;

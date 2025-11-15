-- call org.upsert_org_location(@err,-2,1,1,'locname','ABC',1,'addname','addline1','addline2','addline3','city','state','country','560069',1);

DROP PROCEDURE IF EXISTS org.upsert_org_location;

DELIMITER $$ 

CREATE PROCEDURE org.upsert_org_location(OUT error_code INT,
				          IN in_app_user_id BIGINT,
				          IN in_company_id BIGINT,
				          IN in_location_type_id MEDIUMINT,
                                          IN in_location_name VARCHAR(100),
                                          IN in_location_code VARCHAR(10),
                                          IN in_address_type_id MEDIUMINT,
                                          IN in_address_name VARCHAR(100), 
                                          IN in_address_line_1 VARCHAR(100), 
                                          IN in_address_line_2 VARCHAR(100), 
                                          IN in_address_line_3 VARCHAR(100), 
                                          IN in_city VARCHAR(100), 
                                          IN in_state VARCHAR(100), 
                                          IN in_country VARCHAR(100), 
                                          IN in_zipcode  VARCHAR(45),  
                                          IN in_status TINYINT
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
          )
  ON DUPLICATE KEY UPDATE
        location_type_id        = IFNULL(in_location_type_id, location_type_id),
        location_code           = IFNULL(UPPER(in_location_code), location_code),
    	status                  = IFNULL(in_status,status),
       	modified_id 		= IFNULL(in_app_user_id,modified_id),
       	modified_dtm            = CURRENT_TIMESTAMP,
       	location_id             = LAST_INSERT_ID(location_id); 

  SET v_location_id  = LAST_INSERT_ID();
  
  -- Deactivating OLD address for the same location for the same type
  
  UPDATE org.address
     SET status = 0
   WHERE location_id = v_location_id
     AND address_type_id = in_address_type_id;
  
  -- 2nd creating address entry
  
  INSERT INTO org.address
         (address_id,
          location_id,
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
         (NULL,
          v_location_id,
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
          )
     ON DUPLICATE KEY UPDATE
          address_name          = IFNULL(UPPER(in_address_name), address_name),
          address_line_1        = IFNULL(UPPER(in_address_line_1), address_line_1),
          address_line_2        = IFNULL(UPPER(in_address_line_2), address_line_2),
          address_line_3        = IFNULL(UPPER(in_address_line_3), address_line_3),
          city                  = IFNULL(UPPER(in_city), city),
          state                 = IFNULL(UPPER(in_state), state),
          country               = IFNULL(UPPER(in_country), country),
          zipcode               = IFNULL(UPPER(in_zipcode), zipcode),
          status                = IFNULL(in_status, status),
       	  modified_id 		= IFNULL(in_app_user_id, modified_id),
       	  modified_dtm          = CURRENT_TIMESTAMP;
   
  
  SET v_address_id = LAST_INSERT_ID();
  
  SET error_code = 0;

END $$ 

DELIMITER ; 

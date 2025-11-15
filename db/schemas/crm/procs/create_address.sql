-- call `crm`.create_address(@err,3,45,'ADDRESS NAME','ADDRESS LINE 1','ADDRESS LINE 2','ADDRESS LINE 3','CITY','STATE','COUNTRY','ZIPCODE',1,@oaid);
DROP PROCEDURE IF EXISTS `crm`.create_address;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_address(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_lead_id BIGINT,
       IN in_task_id BIGINT,
       IN in_contact_mode_list VARCHAR(100),
       IN in_address_name VARCHAR(100),
       IN in_address_line_1 VARCHAR(500),
       IN in_address_line_2 VARCHAR(500),
       IN in_address_line_3 VARCHAR(500),
       IN in_city VARCHAR(100),
       IN in_state VARCHAR(100),
       IN in_country VARCHAR(100),
       IN in_zipcode VARCHAR(45),
       IN in_address_type VARCHAR(45),
       IN in_residence_type VARCHAR(45),
       IN in_living_status VARCHAR(45),
       IN in_photo VARCHAR(1000),
       IN in_current_location VARCHAR(100),
       IN in_is_primary TINYINT,
       -- New address-related columns added 15-Jan-2025
       IN in_office_address VARCHAR(500),
       -- End new columns
       OUT out_address_id BIGINT
) 
BEGIN
SET
       error_code = -2;

INSERT INTO
       `crm`.address(
              address_id,
              lead_id,
              task_id,
              contact_mode_list,
              address_name,
              address_line_1,
              address_line_2,
              address_line_3,
              city,
              state,
              country,
              zipcode,
              address_type,
              residence_type,
              living_status,
              photo,
              current_location,
              is_primary,
              -- New address-related columns added 15-Jan-2025
              office_address,
              -- End new columns
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_lead_id,
              in_task_id,
              in_contact_mode_list,
              IFNULL(in_address_name,""),
              IFNULL(in_address_line_1,""),
              in_address_line_2,
              in_address_line_3,
              IFNULL(in_city,""),
              in_state,
              in_country,
              IFNULL(in_zipcode,""),
              in_address_type,
              in_residence_type,
              in_living_status,
              in_photo,
              in_current_location,
              in_is_primary,
              -- New address-related columns added 15-Jan-2025
              in_office_address,
              -- End new columns
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       )ON DUPLICATE KEY
UPDATE
       status = IFNULL(1, status),
       modified_id = IFNULL(in_app_user_id, modified_id),
       modified_dtm = IFNULL(CURRENT_TIMESTAMP(), modified_dtm),
       address_id = LAST_INSERT_ID(address_id);
       
SET
       out_address_id = LAST_INSERT_ID();

COMMIT;

SET
       error_code = 0;

END $$ 
DELIMITER ;
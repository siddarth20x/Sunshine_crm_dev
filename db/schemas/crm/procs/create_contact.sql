-- call `crm`.create_contact(@err,3,45,'CALL','FIRST NAME','LAST NAME','EMAIL@EMAIL.COM','1234567890','+91','+12344567890','contact_name','relationship','1234567890',1,@ocid);
DROP PROCEDURE IF EXISTS `crm`.create_contact;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_contact(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_lead_id BIGINT,
       IN in_task_id BIGINT,
       IN in_contact_mode_list VARCHAR(100),
       IN in_customer_name VARCHAR(100),
       -- IN in_last_name VARCHAR(100),
       IN in_email VARCHAR(100),
       IN in_phone VARCHAR(20),
       IN in_phone_ext VARCHAR(10),
       IN in_alternate_phone VARCHAR(45),
       IN in_contact_name VARCHAR(45),
       IN in_relationship VARCHAR(20),
       IN in_contact_name_ph_no VARCHAR(20),
       IN in_employment_status VARCHAR(45),
       IN in_employment_type VARCHAR(45),
       IN in_photo VARCHAR(1000),
       IN in_is_primary TINYINT,
       -- New contact-related columns added 15-Jan-2025
       IN in_friend_residence_phone VARCHAR(100),
       IN in_monthly_income VARCHAR(100),
       -- End new columns
       OUT out_contact_id BIGINT
)

BEGIN

/* DECLARE exit handler for sqlexception BEGIN -- Handle SQL exceptions
-- ROLLBACK;
SET
       error_code = CONCAT('-2', ' ', SQLSTATE()) -- SELECT 'An error occurred: ' || SQLSTATE();
END;
*/
SET error_code = -2;

INSERT INTO
       `crm`.contact(
              contact_id,
              lead_id,
              task_id,
              contact_mode_list,
              customer_name,
              -- last_name,
              email,
              phone,
              phone_ext,
              alternate_phone,
              contact_name,
              relationship,
              contact_name_ph_no,
              employment_status,
              employment_type,
              photo,
              is_primary,
              -- New contact-related columns added 15-Jan-2025
              friend_residence_phone,
              monthly_income,
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
              IFNULL(in_customer_name,""),
              -- in_last_name,
              IFNULL(in_email,""),
              IFNULL(in_phone,""),
              in_phone_ext,
              in_alternate_phone,
              in_contact_name,
              in_relationship,
              in_contact_name_ph_no,
              in_employment_status,
              in_employment_type,
              in_photo,
              in_is_primary,
              -- New contact-related columns added 15-Jan-2025
              in_friend_residence_phone,
              in_monthly_income,
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
       contact_id = LAST_INSERT_ID(contact_id);

SET out_contact_id = LAST_INSERT_ID();

COMMIT;

SET error_code = 0;

END $$ 
DELIMITER ;
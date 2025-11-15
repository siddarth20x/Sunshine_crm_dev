-- call org.create_org_contact(@err,
-- 2,2,1,'1','Manager',
-- 'Mr.','Ravikiran','Prabhu','ravik@codeswift.in',
-- '9191919191','999','7979797979','8888888888');

DROP PROCEDURE IF EXISTS org.create_org_contact;

DELIMITER $$
CREATE PROCEDURE org.create_org_contact(OUT error_code INT,
                                                IN in_app_user_id BIGINT,
                                                IN in_company_id BIGINT, 
                                                IN in_contact_dept_type_id MEDIUMINT,
                                                IN in_contact_mode_list VARCHAR(1000), 
                                                IN in_designation VARCHAR(100),
                                                IN in_salutation VARCHAR(45), 
                                                IN in_first_name VARCHAR(100), 
                                                IN in_last_name VARCHAR(100), 
                                                IN in_email_address VARCHAR(100), 
                                                IN in_phone  VARCHAR(20), 
                                                IN in_phone_ext VARCHAR(10),
                                                IN in_alternate_phone VARCHAR(20),
                                                IN in_fax VARCHAR(20)
                                                )

BEGIN

DECLARE v_contact_id BIGINT DEFAULT NULL;

SET error_code = -2;

-- Creating a contact entry first

INSERT INTO org.contact 
       (contact_id,
        company_id,
        contact_dept_type_id,
        contact_mode_list,  
        designation,
        salutation,
        first_name, 
        last_name, 
        email, 
        phone, 
        phone_ext,
        alternate_phone,
        fax,
        STATUS,
        created_id,
        created_dtm,
        modified_id, 
        modified_dtm
        )
VALUES
       (NULL,
        in_company_id,
        in_contact_dept_type_id,
        in_contact_mode_list, 
        in_designation,
        in_salutation,
        in_first_name, 
        in_last_name, 
        in_email_address, 
        in_phone, 
        in_phone_ext,
        in_alternate_phone,
        in_fax,
        1, 
        in_app_user_id, 
        CURRENT_TIMESTAMP(),
        in_app_user_id, 
        CURRENT_TIMESTAMP()
        );

SET v_contact_id = LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;

-- call stage.upload_mapping_template (@err,'1','ACCOUNTS ADDRESS','ACCOUNTS-LOCATION','migrate_account_address', 'migrate_account_address.csv','INSERT INTO stage.migrate_account_address (customer_name,address_1,address_2,city,address_type) VALUES ?;','customer_name,address_1,address_2,city,address_type', '5', @oumt);


DROP PROCEDURE IF EXISTS stage.create_upload_mapping_template;

DELIMITER $$
CREATE PROCEDURE stage.create_upload_mapping_template(OUT error_code INT
				       ,IN in_app_user_id BIGINT
				       ,IN in_type_name VARCHAR(100)
				       ,IN in_module_name VARCHAR(100)
				       ,IN in_upload_mapping_table_name VARCHAR(100)
                                       ,IN in_upload_mapping_temp_name VARCHAR(100)
                                       ,IN in_query VARCHAR(500)
                                       ,IN in_field_list VARCHAR(500)
                                       ,IN in_field_count int(10)
                                       ,OUT out_upload_mapping_temp_id BIGINT
                                        )
BEGIN

SET error_code=-2;

INSERT INTO stage.upload_mapping_template 
       (upload_mapping_temp_id,
       type_name,
       module_name,
        upload_mapping_table_name,
        upload_mapping_temp_name,
        query,
        field_list,
        field_count,
        status,
        created_id,
        modified_id
       )
VALUES
       (NULL, 
       in_type_name,
       in_module_name,
        in_upload_mapping_table_name,
        in_upload_mapping_temp_name,
        in_query,
        in_field_list,
        in_field_count,
        1,
        in_app_user_id,
        in_app_user_id        
       );
       
SET out_upload_mapping_temp_id=LAST_INSERT_ID();

SET error_code=0;
 
END$$
DELIMITER ;
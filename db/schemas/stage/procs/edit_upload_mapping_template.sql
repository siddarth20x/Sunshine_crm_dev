-- call stage.edit_upload_mapping_template (@err, 1,1,'ACCOUNTS ADDRESS','ACCOUNTS-LOCATION','migrate_account_address', 'migrate_account_address.csv','INSERT INTO stage.migrate_account_address (customer_name,address_1,address_2,city,address_type) VALUES ?;','customer_name,address_1,address_2,city,address_type', '5', 1);

DROP PROCEDURE IF EXISTS stage.edit_upload_mapping_template;

DELIMITER $$
CREATE PROCEDURE stage.edit_upload_mapping_template(OUT error_code INT
                                     ,IN in_app_user_id BIGINT	
                                     ,IN in_upload_mapping_temp_id BIGINT
                                     ,IN in_type_name VARCHAR(100)
				     ,IN in_module_name VARCHAR(100)
                                     ,IN in_upload_mapping_table_name VARCHAR(100)
                                     ,IN in_upload_mapping_temp_name VARCHAR(100)
                                     ,IN in_query VARCHAR(500)
                                     ,IN in_field_list VARCHAR(500)
                                     ,IN in_field_count INT(10)
                                     ,IN in_status TINYINT
)

BEGIN
SET error_code=-2;

UPDATE stage.upload_mapping_template 
SET	
	type_name 			= IFNULL(in_type_name, type_name),
	module_name			= IFNULL(in_module_name, module_name),
        upload_mapping_table_name       = IFNULL(in_upload_mapping_table_name, upload_mapping_table_name), 
        upload_mapping_temp_name        = IFNULL(in_upload_mapping_temp_name, upload_mapping_temp_name),
        query			        = IFNULL(in_query, query),
        field_list                      = IFNULL(in_field_list, field_list), 
        field_count                     = IFNULL(in_field_count, field_count),  
        modified_id          		= in_app_user_id,
        status               		= IFNULL(in_status, status)
WHERE
        upload_mapping_temp_id 		= in_upload_mapping_temp_id;
       
SET error_code=0;  

END$$
DELIMITER ;

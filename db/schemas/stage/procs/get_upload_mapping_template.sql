-- call stage.get_upload_mapping_template (@err,null,null,null,null,null);

DROP PROCEDURE IF EXISTS stage.get_upload_mapping_template;

DELIMITER $$
CREATE PROCEDURE stage.get_upload_mapping_template(OUT error_code INT, 
					IN in_type_name VARCHAR(100),
					IN in_module_name VARCHAR(100),
                                       IN in_upload_mapping_template_id BIGINT,
                                       IN in_upload_mapping_table_name VARCHAR(100),
                                       IN in_upload_mapping_temp_name VARCHAR(100)
                                      )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT DISTINCT u.upload_mapping_temp_id,
 	u.type_name,
 	u.module_name,
	u.upload_mapping_table_name,
    u.upload_mapping_temp_name,
    u.query,
    u.field_list,
    u.field_count,
    u.checksum,
    u.status,
    u.created_id,
    u.created_dtm,
    u.modified_id,
    u.modified_dtm
   FROM stage.upload_mapping_template u 
  WHERE 1=1 ';


IF in_upload_mapping_template_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND u.upload_mapping_temp_id  = ', in_upload_mapping_template_id);
END IF;

IF in_type_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND upper(u.type_name)  like','"%', upper(in_type_name),'%"');
END IF;

IF in_module_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND upper(u.module_name) = ','"', upper(in_module_name),'"');
END IF;

IF in_upload_mapping_table_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND upper(u.upload_mapping_table_name)  like','"%', upper(in_upload_mapping_table_name),'%"');
END IF;

IF in_upload_mapping_temp_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND upper(u.upload_mapping_temp_name)  like','"%', upper(in_upload_mapping_temp_name),'%"');
END IF;

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;
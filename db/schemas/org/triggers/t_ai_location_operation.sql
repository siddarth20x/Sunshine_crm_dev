DELIMITER $$

DROP TRIGGER IF EXISTS org.t_ai_location_operation$$

CREATE TRIGGER org.t_ai_location_operation AFTER INSERT on org.location_operation 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'COMPANY_LOC_OPERATION_INSERT' AS activity_type,
       new.location_operation_id AS activity_doc_pk_id,
       new.location_id AS activity_doc_num,
       CONCAT(
                  CONCAT(' location_id value was created as ' ,new.location_id,';'),
		  CONCAT(' location_start_date value was created as ' ,new.location_start_date,';'),
		  CONCAT(' location_end_date value was created as ' ,new.location_end_date,';'),
		  CONCAT(' location_start_time value was created as ' ,new.location_start_time,';'),
		  CONCAT(' location_end_time value was created as ' ,new.location_end_time,';'),
                  CONCAT(' status value was created as ' ,new.status,';')
       ) AS activity_detail,
       CURRENT_TIMESTAMP AS activity_dtm 
  INTO v_app_user_id,
       v_activity_type,
       v_activity_doc_pk_id,
       v_activity_doc_num,
       v_activity_detail,
       v_activity_dtm
  FROM DUAL;

CALL org.create_user_activity_log (@err,v_app_user_id,v_activity_type,v_activity_doc_pk_id,v_activity_doc_num,v_activity_detail,v_activity_dtm,@osuid);


END;
$$

DELIMITER ;

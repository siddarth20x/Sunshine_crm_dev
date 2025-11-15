DELIMITER $$

DROP TRIGGER IF EXISTS org.t_au_location_operation$$

CREATE TRIGGER org.t_au_location_operation AFTER UPDATE on org.location_operation 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'COMPANY_LOC_OPERATION_UPDATE' AS activity_type,
       new.location_operation_id AS activity_doc_pk_id,
       new.location_id AS activity_doc_num,
       CONCAT(
                 IF( old.location_id<>new.location_id, CONCAT(' location_id value was modified from ' , old.location_id,' to ',new.location_id,';'), ""),
		 IF( old.location_start_date<>new.location_start_date, CONCAT(' location_start_date value was modified from ' , old.location_start_date,' to ',new.location_start_date,';'), ""),
		 IF( old.location_end_date<>new.location_end_date, CONCAT(' location_end_date value was modified from ' , old.location_end_date,' to ',new.location_end_date,';'), ""),
		 IF( old.location_start_time<>new.location_start_time, CONCAT(' location_start_time value was modified from ' , old.location_start_time,' to ',new.location_start_time,';'), ""),
		 IF( old.location_end_time<>new.location_end_time, CONCAT(' location_end_time value was modified from ' , old.location_end_time,' to ',new.location_end_time,';'), ""),
                 IF( old.status<>new.status, CONCAT(' status value was modified from ' , old.status,' to ',new.status,';'), "")
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


INSERT INTO org.location_operation_audit
(  	
        location_operation_id,
        location_id,
        location_start_date,
        location_end_date,
        location_start_time,
        location_end_time,
        status,
	created_id,
	created_dtm,
	modified_id,
	modified_dtm,
	audit_action,
	audit_dtm
)
VALUES
(  	
        old.location_operation_id,
        old.location_id,
        old.location_start_date,
        old.location_end_date,
        old.location_start_time,
        old.location_end_time,
	old.status,
        old.created_id,
        old.created_dtm,
        old.modified_id,
        old.modified_dtm,
	'AU',
	CURRENT_TIMESTAMP
);
END;
$$

DELIMITER ;

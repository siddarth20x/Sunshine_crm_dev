DELIMITER $$

DROP TRIGGER IF EXISTS `user`.`t_ai_user`$$

CREATE TRIGGER `user`.`t_ai_user` AFTER INSERT on `user`.`user` 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;  
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'USER_DATA_INSERT' AS activity_type,
       new.user_id AS activity_doc_pk_id,
       new.email_address AS activity_doc_num,
       CONCAT(		
          CONCAT(' designation value was created as ' ,new.designation,';'),
          CONCAT(' first_name value was created as ' ,new.first_name,';'),
		CONCAT(' last_name value was created as ' ,new.last_name,';'),
		CONCAT(' email_address value was created as ' ,new.email_address,';'),
		CONCAT(' phone value was created as ' ,new.phone,';'),
		CONCAT(' otp value was created as ' ,new.otp,';'),
		CONCAT(' mac_address value was created as ' ,new.mac_address,';'),
          CONCAT(' last_login value was created as ' ,new.last_login,';'),
		CONCAT(' is_admin value was created as ' ,new.is_admin,';'),
		CONCAT(' image_url value was created as ' ,new.image_url,';'),
		CONCAT(' reporting_to_id value was created as ' ,new.reporting_to_id,';'),
		CONCAT(' country value was created as ' ,new.country,';'),
		CONCAT(' state value was created as ' ,new.state,';'),
		CONCAT(' city value was created as ' ,new.city,';'),
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

CALL user.create_user_activity_log (@err,v_app_user_id,v_activity_type,v_activity_doc_pk_id,v_activity_doc_num,v_activity_detail,v_activity_dtm,@osuid);


END;
$$

DELIMITER ;

DELIMITER $$

DROP TRIGGER IF EXISTS `user`.`t_au_user`$$

CREATE TRIGGER `user`.`t_au_user` AFTER UPDATE on `user`.`user` 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;  
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = '';

IF IFNULL(old.last_login,"") <> IFNULL(new.last_login,"") THEN

SELECT new.modified_id AS app_user_id,
       'USER_LOGIN' AS activity_type,
       new.user_id AS activity_doc_pk_id,
       new.email_address AS activity_doc_num,
       new.last_login AS activity_detail,
       CURRENT_TIMESTAMP AS activity_dtm 
  INTO v_app_user_id,
       v_activity_type,
       v_activity_doc_pk_id,
       v_activity_doc_num,
       v_activity_detail,
       v_activity_dtm
  FROM DUAL;

CALL user.create_user_activity_log (@err,v_app_user_id,v_activity_type,v_activity_doc_pk_id,v_activity_doc_num,v_activity_detail,v_activity_dtm,@osuid);

END IF;

/* OLD CODE

SET v_activity_detail = CONCAT('','');


SELECT new.modified_id AS app_user_id,
       'USER_DATA_UPDATE' AS activity_type,
       new.user_id AS activity_doc_pk_id,
       new.email_address AS activity_doc_num,
       CONCAT(		
       	IF( old.designation<>new.designation, CONCAT(' designation value was modified from ' , old.designation,' to ',new.designation,';'), ""),
        IF( old.first_name<>new.first_name, CONCAT(' first_name value was modified from ' , old.first_name,' to ',new.first_name,';'), ""),
		IF( old.last_name<>new.last_name, CONCAT(' last_name value was modified from ' , old.last_name,' to ',new.last_name,';'), ""),
		IF( old.email_address<>new.email_address, CONCAT(' email_address value was modified from ' , old.email_address,' to ',new.email_address,';'), ""),
		IF( old.password<>new.password, CONCAT(' password value was modified from ' , old.password,' to ',new.password,';'), ""),
		IF( old.phone<>new.phone, CONCAT(' phone value was modified from ' , old.phone,' to ',new.phone,';'), ""),
		IF( old.otp<>new.otp, CONCAT(' otp value was modified from ' , old.otp,' to ',new.otp,';'), ""),
		IF( old.mac_address<>new.mac_address, CONCAT(' mac_address value was modified from ' , old.mac_address,' to ',new.mac_address,';'), ""),
		IF( old.allowed_ip<>new.allowed_ip, CONCAT(' allowed_ip value was modified from ' , old.allowed_ip,' to ',new.allowed_ip,';'), ""),
        IF( old.last_login<>new.last_login, CONCAT(' last_login value was modified from ' , old.last_login,' to ',new.last_login,';'), ""),
        IF( old.last_login_ip_address<>new.last_login_ip_address, CONCAT(' last_login_ip_address value was modified from ' , old.last_login_ip_address,' to ',new.last_login_ip_address,';'), ""),
		IF( old.is_admin<>new.is_admin, CONCAT(' is_admin value was modified from ' , old.is_admin,' to ',new.is_admin,';'), ""),
		IF( old.image_url<>new.image_url, CONCAT(' image_url value was modified from ' , old.image_url,' to ',new.image_url,';'), ""),
		IF( old.reporting_to_id<>new.reporting_to_id, CONCAT(' reporting_to_id value was modified from ' , old.reporting_to_id,' to ',new.reporting_to_id,';'), ""),
		IF( old.country<>new.country, CONCAT(' country value was modified from ' , old.country,' to ',new.country,';'), ""),
		IF( old.state<>new.state, CONCAT(' state value was modified from ' , old.state,' to ',new.state,';'), ""),
		IF( old.city<>new.city, CONCAT(' city value was modified from ' , old.city,' to ',new.city,';'), ""),
        IF( old.status<>new.status, CONCAT(' status value was modified from ' , old.status,' to ',new.status,';'), "")
        IF( old.token<>new.token, CONCAT(' token value was modified from ' , old.token,' to ',new.token,';'), "")
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

*/

INSERT INTO user.user_audit
(  	user_id,
    designation,
	first_name,             
	last_name,
	email_address,                
	password,   
	phone,
	otp,
	mac_address,
	allowed_ip,
	last_login,
	last_login_ip_address,
	is_admin,
	image_url,
	reporting_to_id,
	country,
    state,
    city,
	status,
	-- token,
	created_id,
	created_dtm,
	modified_id,
	modified_dtm,
	audit_action,
	audit_dtm
)
VALUES
(  	old.user_id, 
	old.designation,
	old.first_name,
	old.last_name, 
	old.email_address,                	
	old.password,              	
	old.phone,
	old.otp,
	old.mac_address,
	old.allowed_ip,
	old.last_login,	
	old.last_login_ip_address,	
	old.is_admin,
	old.image_url,
	old.reporting_to_id,
	old.country,
	old.state,
	old.city,
	old.status,
	-- old.token,
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

DELIMITER $$

DROP TRIGGER IF EXISTS org.`t_ai_company`$$

CREATE TRIGGER org.`t_ai_company` AFTER INSERT on `org`.`company` 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'COMPANY_INSERT' AS activity_type,
       new.company_id AS activity_doc_pk_id,
       new.company_name AS activity_doc_num,
       CONCAT(
             CONCAT(' company_type_id value was created as ' ,new.company_type_id,';'),
		   CONCAT(' company_code value was created as ' ,new.company_code,';'),
		   CONCAT(' company_name value was created as ' ,new.company_name,';'),
		   CONCAT(' company_desc value was created as ' ,new.company_desc,';'),
		   CONCAT(' company_logo_url value was created as ' ,new.company_logo_url,';'),
		   CONCAT(' website value was created as ' ,new.website,';'),
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

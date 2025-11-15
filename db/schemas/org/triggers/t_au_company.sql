DELIMITER $$

DROP TRIGGER IF EXISTS org.`t_au_company`$$

CREATE TRIGGER org.`t_au_company` AFTER UPDATE on `org`.`company` 
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_doc_num VARCHAR(100) DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

DECLARE v_notification_type_id BIGINT;
DECLARE v_notification_type_description VARCHAR(100);

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       'COMPANY_UPDATE' AS activity_type,
       new.company_id AS activity_doc_pk_id,
       new.company_name AS activity_doc_num,
       CONCAT(
                  IF( old.company_type_id<>new.company_type_id, CONCAT(' company_type_id value was modified from ' , old.company_type_id,' to ',new.company_type_id,';'), ""),
		  IF( old.company_code<>new.company_code, CONCAT(' company_code value was modified from ' , old.company_code,' to ',new.company_code,';'), ""),
		  IF( old.company_name<>new.company_name, CONCAT(' company_name value was modified from ' , old.company_name,' to ',new.company_name,';'), ""),
		  IF( old.company_desc<>new.company_desc, CONCAT(' company_desc value was modified from ' , old.company_desc,' to ',new.company_desc,';'), ""),
		  IF( old.company_logo_url<>new.company_logo_url, CONCAT(' company_logo_url value was modified from ' , old.company_logo_url,' to ',new.company_logo_url,';'), ""),
		  IF( old.website<>new.website, CONCAT(' website value was modified from ' , old.website,' to ',new.website,';'), ""),
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

/*
INSERT INTO org.company_audit
(  	
        company_id,
        company_type_id,
        company_name,
        company_code,
        company_desc,
        company_logo_url,
        website,
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
        old.company_id,
        old.company_type_id,
        old.company_name,
        old.company_code,
        old.company_desc,
        old.company_logo_url,
        old.website,
	old.status,
	old.created_id,
	old.created_dtm,
	old.modified_id,
	old.modified_dtm,
	'AU',
	CURRENT_TIMESTAMP
);
*/
-- Create User Notif When team_manager_id Changes
IF (old.team_manager_id<>new.team_manager_id) THEN 

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "CLIENT_MANAGER_ASSIGNMENT";
   
-- Send one notif to old assigned_by 
   CALL user.create_user_notification(@err,
                                       old.team_manager_id, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Team Manager Changed',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to new assigned_by
   CALL user.create_user_notification(@err,
                                       new.team_manager_id, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Team Manager Changed',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

END IF;


-- Create User Notif When assigned_to Changes
IF (old.team_lead_id<>new.team_lead_id) THEN 

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "CLIENT_LEAD_ASSIGNMENT";
   
-- Send one notif to old team_lead_id 
   CALL user.create_user_notification(@err,
                                       old.team_lead_id, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Team Lead Changed',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to new team_lead_id
   CALL user.create_user_notification(@err,
                                       new.team_lead_id, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Team Lead Changed',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

END IF;


END;
$$

DELIMITER ;

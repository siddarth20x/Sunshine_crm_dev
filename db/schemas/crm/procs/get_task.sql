-- call crm.get_task(@err,null,null,null,null,null);
-- call crm.get_task(@err,1,null,null,null,1);
-- call crm.get_task(@err,1,1,null,null,1,null,null);
-- call crm.get_task(@err,1,1,1,1,1,1,1);
-- call crm.get_task(@err,1,null,null,null,null,30,9,NULL);
-- call crm.get_task(@err,1,null,null,null,null,30,9,'TODAY');
-- call crm.get_task(@err,1,null,null,null,null,30,9,'ESCALATION');


DROP PROCEDURE IF EXISTS crm.get_task;

DELIMITER $$
CREATE PROCEDURE crm.get_task(OUT error_code INT, 
                              IN in_app_user_id BIGINT,
                              IN in_task_id BIGINT,
			                  IN in_task_type_id MEDIUMINT,
			                  IN in_disposition_code_id BIGINT,
			                  IN in_task_status_type_id MEDIUMINT,
			                  IN in_lead_id BIGINT,
                              IN in_company_id BIGINT,
                              IN in_task_category VARCHAR(20) -- Allowed values are NULL, 'TODAY', 'ESCALATION'
			                      )
BEGIN
DECLARE v_leads_id_list LONGTEXT;

SET error_code = -2;
SELECT user.fn_get_user_leads_id_list(in_app_user_id, in_company_id) INTO v_leads_id_list;

SET @get_q = '
SELECT * FROM (
SELECT t.task_id,      
       t.task_type_id, 
       tt.task_type_name, 
       t.disposition_code_id,  
       dc.stage,  
       dc.stage_status,  
       dc.stage_status_name,  
       dc.stage_status_code,  
       t.lead_id,     
       l.company_id,
       c.company_name AS bank_name,
       l.account_number,
       l.customer_name,
       l.customer_id,
       l.agreement_id,
       l.product_account_number,
       l.product_type,
       t.assigned_by,  
       u2.designation AS assigned_by_designation,
       CONCAT(u2.first_name, " ", u2.last_name) AS assigned_by_full_name,       
       t.assigned_dtm, 
       t.assigned_to,  
       u3.designation AS assigned_to_designation,
       CONCAT(u3.first_name, " ", u3.last_name) AS assigned_to_full_name,       
       t.target_dtm,
       -- TIMESTAMPADD(HOUR, 18, DATE(t.target_dtm)) AS eod_target_dtm,
       DATE_FORMAT(CONCAT(DATE(t.target_dtm), " 23:59:59"), "%Y-%m-%d %H:%i:%s") AS eod_target_dtm,
	   crm.fn_get_last_activity_dtm_for_tasks(t.assigned_to,NULL,t.task_id) AS last_task_update_dtm,
       t.task_status_type_id,  
       tst.task_status_type_name,
       t.document_url, 
       t.mode_of_contact, 
       t.status,       
       t.created_id,   
       t.created_dtm,  
       t.modified_id,
       t.modified_dtm
  FROM crm.task t
  JOIN crm.leads l 
    ON t.lead_id = l.lead_id
  JOIN org.company c
    ON l.company_id = c.company_id
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id
  JOIN crm.task_status_type tst
    ON t.task_status_type_id = tst.task_status_type_id
  LEFT OUTER JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
  LEFT OUTER JOIN user.user u2 -- For assigned by info
    ON t.assigned_by = u2.user_id
  LEFT OUTER JOIN user.user u3 -- For assigned to info
    ON t.assigned_to = u3.user_id
  
WHERE t.status = 1 

';

SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ")"); 

IF in_task_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND t.task_id  = ', in_task_id);
END IF; 

IF in_task_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND t.task_type_id  = ', in_task_type_id);
END IF; 

IF in_disposition_code_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND t.disposition_code_id  = ', in_disposition_code_id);
END IF; 

IF in_task_status_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND t.task_status_type_id  = ', in_task_status_type_id);
END IF; 

IF in_lead_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND t.lead_id  = ', in_lead_id);
END IF;

SET @get_q = CONCAT(@get_q, ' ) temp ' );

IF in_task_category = "TODAY" THEN
     SET @get_q = CONCAT(@get_q, ' WHERE DATE(temp.eod_target_dtm) = CURRENT_DATE ');
     SET @get_q = CONCAT(@get_q, ' AND temp.task_status_type_name IN ("IN PROGRESS","PENDING","COMPLETED")  ');
END IF;

IF in_task_category = "ESCALATION" THEN
	 SET @get_q = CONCAT(@get_q, ' WHERE DATE(temp.eod_target_dtm) = CURRENT_DATE ');
     SET @get_q = CONCAT(@get_q, ' AND temp.task_status_type_name IN ("IN PROGRESS","PENDING","COMPLETED")  ');
     SET @get_q = CONCAT(@get_q, ' AND DATE(eod_target_dtm) <> DATE(IFNULL(last_task_update_dtm,"2001-01-01")) ');
     -- SET @get_q = CONCAT(@get_q, ' AND DATE(eod_target_dtm) = CURRENT_DATE  '); 
     -- SET @get_q = CONCAT(@get_q, " AND CURRENT_TIMESTAMP BETWEEN IFNULL(last_task_update_dtm,CURRENT_TIMESTAMP) AND eod_target_dtm  ");
     -- SET @get_q = CONCAT(@get_q, ' AND temp.task_status_type_name IN ("IN PROGRESS","PENDING","COMPLETED")  ');
     -- SET @get_q = CONCAT(@get_q, ' AND temp.assigned_to = temp.modified_id' );
     -- SET @get_q = CONCAT(@get_q, ' AND temp.assigned_to = ', in_app_user_id );
END IF;

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

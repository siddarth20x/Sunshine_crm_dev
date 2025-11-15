-- call report.get_account_report_by_agent (@err,9,NULL,NULL,NULL,"2025-02-03","2025-02-04",NULL,NULL,NULL,NULL);
-- call report.get_account_report_by_agent (@err,9,NULL,NULL,NULL,NULL,NULL,"CONTACTED","UNG",NULL,NULL);
-- call report.get_account_report_by_agent (@err,2,1,2,1,"2024-07-01",CURRENT_TIMESTAMP,"CONTACTED",NULL,NULL,NULL); 
-- call report.get_account_report_by_agent (@err,2,19,NULL,NULL,"2024-07-01",CURRENT_TIMESTAMP,NULL,NULL,NULL,NULL); 
-- call report.get_account_report_by_agent (@err,9,NULL,NULL,NULL,NULL,NULL,"CONTACTED","UNG","CALL",NULL);
-- call report.get_account_report_by_agent (@err,9,NULL,NULL,NULL,"2025-02-01","2025-02-04",NULL,NULL,NULL,"daily-report");
-- call report.get_account_report_by_agent (@err,9,NULL,NULL,NULL,"2025-02-01","2025-02-04",NULL,NULL,NULL,"touched-untouched-report");

DROP PROCEDURE IF EXISTS report.get_account_report_by_agent;

DELIMITER $$
CREATE PROCEDURE report.get_account_report_by_agent ( OUT error_code INT, 
                                IN in_app_user_id BIGINT,
                                IN in_lead_id BIGINT,
                                IN in_agent_id BIGINT,
                                IN in_company_id BIGINT,
                                IN in_start_dtm TIMESTAMP,
                                IN in_end_dtm TIMESTAMP,
                                IN in_stage VARCHAR(100),
                                IN in_stage_status_code VARCHAR(1000),
                                IN in_contact_mode_list VARCHAR(1000),
                                IN in_report_name VARCHAR(100)
                              )
                                              
BEGIN
DECLARE v_leads_id_list LONGTEXT;
DECLARE v_leads_id_list_by_agent_id LONGTEXT;
DECLARE v_activity_leads_id_list LONGTEXT;
DECLARE v_end_dtm TIMESTAMP DEFAULT NULL;
-- DECLARE v_contact_address_log LONGTEXT DEFAULT NULL;
SET error_code = -2;

SELECT user.fn_get_user_leads_id_list(in_app_user_id, in_company_id) INTO v_leads_id_list;

IF in_agent_id IS NOT NULL THEN
SELECT user.fn_get_user_leads_id_list(in_agent_id, in_company_id) INTO v_leads_id_list_by_agent_id;
END IF;

-- SET @v_contact_address_log = NULL;

-- IF in_lead_id IS NOT NULL AND in_start_dtm IS NOT NULL AND in_end_dtm IS NOT NULL THEN
-- SELECT user.fn_get_lead_address_contact_log(in_lead_id, in_start_dtm, in_end_dtm)
--   INTO @v_contact_address_log;
-- END IF;
SET @v_start_dtm = NULL;
SET @v_end_dtm = NULL;
SET @v_start_dtm = in_start_dtm;
SET @v_end_dtm = DATE_ADD(in_end_dtm, INTERVAL 1 DAY);

IF in_start_dtm IS NOT NULL AND in_end_dtm IS NOT NULL THEN
SELECT user.fn_get_leads_list_from_activity_log(@v_start_dtm, @v_end_dtm, in_report_name)
  INTO v_activity_leads_id_list;
END IF;


SET @get_q = '
SELECT * FROM (
SELECT DISTINCT l.lead_id,
       l.company_id,
       comp.company_name,
       l.customer_id,
       l.customer_name,
       l.account_number,
       l.product_type,
       l.product_account_number,
	   l.agreement_id,
       l.allocation_status,
       nt.created_dtm AS notes_dtm,
       nt.note AS feedback,
       CASE WHEN tt.task_type_name = "FIELD VISIT"
            THEN nt.note 
            ELSE NULL
		END field_feedback,
       dc.stage,
       dc.stage_status_code,
       dc.stage_status_name,
       tst.tracing_source_type_name,
       wtd.traced_details,
       l.assigned_by,
       CONCAT(u1.first_name, " ", u1.last_name) AS assigned_by_full_name,
       l.assigned_dtm,
       l.assigned_to,
       CONCAT(u2.first_name, " ", u2.last_name) AS assigned_to_full_name,
       l.target_dtm,
       l.team_manager_id,
       CONCAT(u3.first_name, " ", u3.last_name) AS team_manager_full_name,  
       l.senior_manager_id,
       CONCAT(u4.first_name, " ", u4.last_name) AS senior_manager_full_name,  
       -- crm.fn_get_last_activity_dtm(l.assigned_to, l.lead_id) AS last_activity_dtm,
       user.fn_get_first_activity_after_upload(l.lead_id, @v_start_dtm, @v_end_dtm) AS last_activity_dtm,
       -- crm.fn_get_first_activity_dtm(l.assigned_to, l.lead_id) AS first_activity_dtm,
       crm.fn_get_first_activity_dtm(NULL, l.lead_id) AS first_activity_dtm,
       DATEDIFF(CURRENT_DATE, crm.fn_get_first_activity_dtm(l.assigned_to, l.lead_id)) AS no_of_allocation_days,
       vc.visa_status,
       vc.visa_company_name,
       vc.visa_expiry_date,
       vc.visa_contact_no,
       vc.visa_passport_no,
       mol.mol_status,
       mol.mol_company_name,
       mol.mol_expiry_date,
       mol.mol_salary,
       crm.fn_get_next_follow_up_dtm(NULL, l.lead_id) AS next_follow_up_dtm,
	   -- crm.fn_get_last_paid_amount(NULL, l.lead_id) AS last_paid_amount,
       lpl.last_paid_amount AS last_paid_amount,
       user.fn_get_lead_address_contact_log(l.lead_id, @v_start_dtm, @v_end_dtm) AS contact_address_log,
       cn.contact_mode_list AS contact_contact_mode,
       GROUP_CONCAT(cn.customer_name, cn.email, cn.phone, cn.alternate_phone, cn.contact_name, cn.relationship, cn.contact_name_ph_no) AS contact_info,
       ad.contact_mode_list AS address_contact_mode,
       GROUP_CONCAT(ad.address_name, ad.address_line_1, ad.address_line_2, ad.address_line_3, ad.city, ad.state, ad.country, ad.zipcode) AS address_info,
       crm.fn_get_total_outstanding_amount(NULL,l.lead_id) AS total_outstanding_amount
  FROM crm.leads l
  JOIN org.company comp
    ON l.company_id = comp.company_id
  JOIN user.user u1                     -- For assigned by info
    ON l.assigned_by = u1.user_id
  JOIN user.user u2                     -- For assigned to info
    ON l.assigned_to = u2.user_id
  JOIN user.user u3                     -- For team manager to info
    ON l.team_manager_id = u3.user_id  
  JOIN user.user u4                     -- For senior manager info
    ON l.senior_manager_id = u4.user_id
  JOIN crm.task t
    ON t.lead_id = l.lead_id
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id
  LEFT OUTER JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
  LEFT OUTER JOIN crm.web_tracing_details wtd
    ON l.lead_id = wtd.lead_id
   AND wtd.task_id = t.task_id
  LEFT OUTER JOIN crm.tracing_source_type tst
    ON wtd.tracing_source_type_id = tst.tracing_source_type_id
  LEFT OUTER JOIN crm.notes nt
    ON t.task_id = nt.task_id
  LEFT OUTER JOIN crm.leads_payment_ledger lpl
    ON lpl.lead_id = l.lead_id
   AND lpl.task_id = t.task_id
  LEFT OUTER JOIN crm.visa_check vc
	ON vc.lead_id = l.lead_id
   AND vc.task_id = t.task_id
  LEFT OUTER JOIN crm.mol_check mol
	ON mol.lead_id = l.lead_id
   AND mol.task_id = t.task_id
  LEFT OUTER JOIN crm.contact cn
    ON cn.lead_id = l.lead_id
   AND cn.task_id = t.task_id
  LEFT OUTER JOIN crm.address ad
    ON ad.lead_id = l.lead_id
   AND ad.task_id = t.task_id
 WHERE l.status = 1
 
 ';

SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list, '0'), "'", ")"); 

IF in_lead_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.lead_id = ', in_lead_id);
END IF; 

IF in_company_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.company_id = ', in_company_id);
END IF; 

-- IF in_agent_id IS NOT NULL THEN
--    SET @get_q = CONCAT(@get_q, '
--    AND l.assigned_to = ', in_agent_id);
-- END IF; 

IF in_agent_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list_by_agent_id, '0'), "'", ")");
END IF;

-- IF in_start_dtm IS NOT NULL THEN
--    SET @get_q = CONCAT(@get_q, '
--    AND l.assigned_dtm >= ', '"', in_start_dtm, '"');
-- END IF; 

-- IF in_end_dtm IS NOT NULL THEN
--    -- SET v_end_dtm = DATE_ADD(in_end_dtm, INTERVAL 1 DAY);
--    SET @get_q = CONCAT(@get_q, '
--    AND l.assigned_dtm < @v_end_dtm ');
-- END IF;

IF in_start_dtm IS NOT NULL AND in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_activity_leads_id_list, '0'), "'", ")");  
END IF;

IF in_stage IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND dc.stage = ', '"', in_stage, '"');
END IF; 

IF in_stage_status_code IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND FIND_IN_SET(dc.stage_status_code, ', '"', IFNULL(in_stage_status_code,""), '")');
END IF; 

IF in_contact_mode_list IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND FIND_IN_SET(cn.contact_mode_list, ', '"', IFNULL(in_contact_mode_list,""), '")');
END IF; 

SET @get_q = CONCAT(@get_q, '
GROUP BY l.lead_id,
       l.company_id,
       comp.company_name,
       l.customer_id,
       l.account_number,
       l.product_type,
       l.product_account_number,
	   l.agreement_id,
       l.allocation_status,
       nt.created_dtm,
       feedback,
       field_feedback,
       dc.stage,
       dc.stage_status_code,
       dc.stage_status_name,
	     tst.tracing_source_type_name,
       wtd.traced_details,
       l.assigned_by,
       assigned_by_full_name,
       l.assigned_dtm,
       l.assigned_to,
       assigned_to_full_name,
       l.target_dtm,
       l.team_manager_id,
       team_manager_full_name,  
       l.senior_manager_id,
       senior_manager_full_name,
       last_activity_dtm,
       first_activity_dtm,
       no_of_allocation_days,
       vc.visa_status,
       vc.visa_company_name,
       vc.visa_expiry_date,
       vc.visa_contact_no,
       vc.visa_passport_no,
       mol.mol_status,
       mol.mol_company_name,
       mol.mol_expiry_date,
       mol.mol_salary,
       next_follow_up_dtm,
       last_paid_amount,
       contact_address_log,
       contact_contact_mode,
       address_contact_mode

');

SET @get_q = CONCAT(@get_q, ' )temp; ');
   
-- SELECT @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET error_code=0;

END$$
DELIMITER ;

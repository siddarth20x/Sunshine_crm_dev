-- call crm.get_lead (@err,9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL); 
-- call crm.get_lead (@err,2,1,2,1,2,1,"1231","CC","3232"); 

DROP PROCEDURE IF EXISTS crm.get_lead;

DELIMITER $$
CREATE PROCEDURE crm.get_lead ( OUT error_code INT, 
                                IN in_app_user_id BIGINT,
                                IN in_lead_id BIGINT,
                                IN in_company_id BIGINT,
                                IN in_lead_status_type_id MEDIUMINT,
                                IN in_assigned_by BIGINT,
                                IN in_assigned_to BIGINT,
                                IN in_account_number VARCHAR(100),
                                IN in_product_type VARCHAR(100),
                                IN in_product_account_number VARCHAR(100)
                              )
                                              
BEGIN
DECLARE v_leads_id_list LONGTEXT;
SET error_code = -2;

SELECT user.fn_get_user_leads_id_list(in_app_user_id, in_company_id) INTO v_leads_id_list;

SET @get_q = '
SELECT l.lead_id,
       crm.fn_get_multiple_bank_list(l.lead_id) AS multiple_banks_list,
       CASE WHEN l.pli_status = "FILED"
            THEN 1
            ELSE 0
        END has_police_case,
       l.company_id,
       comp.company_name,
       l.lead_status_type_id,
       lst.lead_status_type_name,
       l.template_type_id,
       l.assigned_by,
       u2.designation AS assigned_by_designation,
       CONCAT(u2.first_name, " ", u2.last_name) AS assigned_by_full_name,       
       l.assigned_dtm,
       l.assigned_to,
       u3.designation AS assigned_to_designation,
       CONCAT(u3.first_name, " ", u3.last_name) AS assigned_to_full_name,       
       l.target_dtm,
       l.senior_manager_id,
       u4.designation AS senior_manager_designation,
       CONCAT(u4.first_name, " ", u4.last_name) AS senior_manager_full_name,       
       l.team_manager_id,
       u5.designation AS team_manager_designation,
       CONCAT(u5.first_name, " ", u5.last_name) AS team_manager_full_name,  
       l.account_number,
       l.product_type,
       l.product_account_number,
       l.agreement_id,
       l.finware_acn01,
       l.business_name,
       l.customer_name,
       l.allocation_status,
       l.customer_id,
       l.passport_number,
       l.date_of_birth,
       l.bucket_status,
       l.vintage,
       l.date_of_woff,
       l.nationality,
       l.emirates_id_number,
      --  l.credit_limit,
      --  l.total_outstanding_amount,
      --  l.principal_outstanding_amount,
       l.employer_details,
       l.designation,
       l.company_contact,
      --  l.home_country_number,
      --  l.mobile_number,
      --  l.email_id,
      --  l.minimum_payment,
      --  l.ghrc_offer_1,
      --  l.ghrc_offer_2,
      --  l.ghrc_offer_3,
       l.withdraw_date,
      --  l.home_country_address,
      --  l.city,
      --  l.pincode,
      --  l.state,
       l.father_name,
       l.mother_name,
       l.spouse_name,
      --  l.last_paid_amount,
      --  l.last_paid_date,
       l.pli_status,
       l.execution_status,
       l.overdue,
       l.banker_name,
      -- l.visa_status,
      -- l.mol_status,
       l.is_visit_required,
       l.settlement_status,
       l.allocation_type,
       -- New columns added 15-Jan-2025
       l.fresh_stab,
       l.cycle_statement,
       l.card_auth,
       l.dpd_r,
       l.mindue_manual,
       l.rb_amount,
       l.overdue_amount,
       l.due_since_date,
       l.monthly_income,
       l.office_address,
       l.friend_residence_phone,
       l.last_month_paid_unpaid,
       l.last_usage_date,
       l.dpd_string,
       l.dcore_id,
       -- End new columns
       -- Disposition code information from the latest task
       latest_task.disposition_code_id,
       latest_task.stage AS disposition_stage,
       latest_task.stage_status AS disposition_status,
       latest_task.stage_status_name AS disposition_status_name,
       latest_task.stage_status_code AS disposition_code,
       l.status,
       l.created_id,
       l.created_dtm,
       l.modified_id,
       l.modified_dtm
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON (l.lead_status_type_id = lst.lead_status_type_id AND lst.lead_status_type_name != "STOP FOLLOW UP")
  JOIN org.company comp
    ON l.company_id = comp.company_id
  JOIN user.user u2 -- For assigned by info
    ON l.assigned_by = u2.user_id
  JOIN user.user u3 -- For assigned to info
    ON l.assigned_to = u3.user_id
  JOIN user.user u4 -- For senior manager info
   ON l.senior_manager_id = u4.user_id
  JOIN user.user u5 -- For team manager to info
   ON l.team_manager_id = u5.user_id
  LEFT OUTER JOIN (
    -- Get disposition code from PRELIMINARY CHECKS task
    -- Fetch all preliminary checks tasks, even if disposition_code_id is NULL
    -- This ensures accounts uploaded without disposition fields still show the task
    SELECT 
      t.lead_id,
      t.disposition_code_id,
      dc.stage,
      dc.stage_status,
      dc.stage_status_name,
      dc.stage_status_code,
      ROW_NUMBER() OVER (PARTITION BY t.lead_id ORDER BY t.modified_dtm DESC) as rn
    FROM crm.task t
    JOIN crm.task_type tt ON t.task_type_id = tt.task_type_id
    LEFT OUTER JOIN crm.disposition_code dc ON t.disposition_code_id = dc.disposition_code_id
    WHERE t.status = 1 
      AND tt.task_type_name = ''PRELIMINARY CHECKS''
  ) latest_task ON l.lead_id = latest_task.lead_id AND latest_task.rn = 1  
      
 WHERE l.status = 1 ';

-- SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ")"); 

SET @get_q = CONCAT(@get_q, " AND l.lead_id IN ( ", IFNULL(v_leads_id_list,""), ")"); 


IF in_lead_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.lead_id = ', in_lead_id);
END IF; 

IF in_company_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.company_id = ', in_company_id);
END IF; 

IF in_lead_status_type_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.lead_status_type_id = ', in_lead_status_type_id);
END IF; 

IF in_assigned_by IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.assigned_by = ', in_assigned_by);
END IF; 

IF in_assigned_to IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.assigned_to = ', in_assigned_to);
END IF; 

IF in_account_number IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.account_number) like ', '"%', UPPER(in_account_number), '%"');
END IF;

IF in_product_type IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.product_type) like ', '"%', UPPER(in_product_type), '%"');
END IF;

IF in_product_account_number IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.product_account_number) like ', '"%', UPPER(in_product_account_number), '%"');
END IF;


-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET error_code=0;

END$$
DELIMITER ;

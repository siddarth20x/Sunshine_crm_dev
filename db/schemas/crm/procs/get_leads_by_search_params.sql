-- call crm.get_leads_by_search_params (@err,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL); 
-- call crm.get_leads_by_search_params (@err,2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);  
-- call crm.get_leads_by_search_params (@err,14,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);  
-- call crm.get_leads_by_search_params (@err,14,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,"652,698,708,709,711,712,714");  

DROP PROCEDURE IF EXISTS crm.get_leads_by_search_params;

DELIMITER $$
CREATE PROCEDURE crm.get_leads_by_search_params (OUT error_code INT, 
                                IN in_app_user_id BIGINT,
                                IN in_company_id BIGINT,
                                IN in_account_number VARCHAR(100),
                                IN in_product_account_number VARCHAR(100),
                                IN in_agreement_id VARCHAR(100),
                                IN in_customer_name VARCHAR(1000),
                                IN in_customer_id VARCHAR(100),
                                IN in_passport_number VARCHAR(100),
                                IN in_emirates_id_number VARCHAR(100),
                                IN in_state VARCHAR(100),
                                IN in_lead_id_list LONGTEXT
                                              )
                                              
BEGIN
DECLARE v_leads_id_list LONGTEXT;
DECLARE v_input_leads_id_list LONGTEXT;

SET error_code = -2;

SELECT user.fn_get_user_leads_id_list(in_app_user_id, in_company_id) INTO v_leads_id_list;

SET v_input_leads_id_list = in_lead_id_list;

SET @get_q = '
SELECT l.lead_id,
       crm.fn_get_multiple_bank_list(l.lead_id) AS multiple_banks_list,
       CASE WHEN l.execution_status IS NOT NULL
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
       u4.designation AS senior_manager_designation,
       CONCAT(u4.first_name, " ", u4.last_name) AS senior_manager_full_name,       
       l.team_manager_id,
       u5.designation AS team_manager_designation,
       CONCAT(u5.first_name, " ", u5.last_name) AS team_manager_full_name,  
       l.target_dtm,
       l.account_number,
       l.product_type,
       l.product_account_number,
       l.agreement_id,
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
       l.banker_name,
       -- New columns added 15-Jan-2025
       l.finware_acn01,
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
       l.status,
       l.created_id,
       l.created_dtm,
       l.modified_id,
       l.modified_dtm
  FROM crm.leads l
  JOIN crm.lead_status_type lst
    ON (l.lead_status_type_id = lst.lead_status_type_id 
        AND lst.lead_status_type_name != "STOP FOLLOW UP"
        AND lst.lead_status_type_name NOT IN ("DEFERRED", "CANCELLED"))
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
      
 WHERE l.status = 1 
   AND l.allocation_type IN ("monthly", "existing") ';

SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ")");  

IF in_lead_id_list IS NOT NULL THEN
SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_input_leads_id_list,""), "'", ")");  
ELSE
SET @get_q = CONCAT(@get_q, " AND FIND_IN_SET( l.lead_id, ","'", IFNULL(v_leads_id_list,""), "'", ")");  
END IF;

IF in_company_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.company_id = ', in_company_id);
END IF; 

IF in_account_number IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.account_number) like ', '"%', UPPER(in_account_number), '%"');
END IF;

IF in_product_account_number IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.product_account_number) like ', '"%', UPPER(in_product_account_number), '%"');
END IF;

IF in_agreement_id IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.agreement_id) like ', '"%', UPPER(in_agreement_id), '%"');
END IF;

IF in_customer_name IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.customer_name) like ', '"%', UPPER(in_customer_name), '%"');
END IF;

IF in_customer_id IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.customer_id) like ', '"%', UPPER(in_customer_id), '%"');
END IF;

IF in_passport_number IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.passport_number) like ', '"%', UPPER(in_passport_number), '%"');
END IF;

IF in_emirates_id_number IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.emirates_id_number) like ', '"%', UPPER(in_emirates_id_number), '%"');
END IF;

IF in_state IS NOT NULL THEN 
  SET @get_q = CONCAT(@get_q,'
    AND UPPER(l.state) like ', '"%', UPPER(in_state), '%"');
END IF;

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET error_code=0;

END$$
DELIMITER ;

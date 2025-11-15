-- call stage.upload_leads(@err, 3, 3);
DROP PROCEDURE IF EXISTS `stage`.`upload_leads`;

DELIMITER $$ 
CREATE PROCEDURE `stage`.`upload_leads`(
  OUT error_code INT,
  IN in_app_user_id BIGINT,
  IN in_company_id BIGINT
) 
BEGIN DECLARE v_finished INTEGER DEFAULT 0;

DECLARE v_lead_stage_id BIGINT(20);
DECLARE v_company_id BIGINT(20);
DECLARE v_senior_manager_email_id VARCHAR(100);
DECLARE v_team_manager_email_id VARCHAR(100);
DECLARE v_team_lead_email_id VARCHAR(100);
DECLARE v_assigned_to_email_id VARCHAR(100);
DECLARE v_team_manager_id BIGINT;
DECLARE v_team_lead_id BIGINT;
DECLARE v_assigned_to_id BIGINT;
DECLARE v_senior_manager_id BIGINT;
DECLARE v_lead_status_type_id_pending MEDIUMINT(9);
DECLARE v_lead_status_type_id_stop_follow_up MEDIUMINT(9);
DECLARE v_template_type_id MEDIUMINT(9);
-- DECLARE v_assigned_by	BIGINT(20);
DECLARE v_assigned_dtm TIMESTAMP;
-- DECLARE v_assigned_to	BIGINT(20);
DECLARE v_target_dtm TIMESTAMP;
DECLARE v_account_number VARCHAR(100);
DECLARE v_product_type VARCHAR(100);
DECLARE v_product_account_number VARCHAR(100);
DECLARE v_agreement_id VARCHAR(100);
DECLARE v_finware_acn01 VARCHAR(100);
DECLARE v_business_name VARCHAR(1000);
DECLARE v_customer_name VARCHAR(1000);
DECLARE v_allocation_status VARCHAR(100);
DECLARE v_allocation_type VARCHAR(100); -- Added declaration for allocation type
DECLARE v_customer_id VARCHAR(100);
DECLARE v_passport_number VARCHAR(100);
DECLARE v_date_of_birth VARCHAR(100);
DECLARE v_bucket_status VARCHAR(100);
DECLARE v_vintage VARCHAR(100);
DECLARE v_date_of_woff VARCHAR(100);
DECLARE v_nationality VARCHAR(100);
DECLARE v_emirates_id_number VARCHAR(100);
DECLARE v_employer_details VARCHAR(200);
DECLARE v_designation VARCHAR(200);
DECLARE v_company_contact VARCHAR(100);
DECLARE v_withdraw_date VARCHAR(100);
DECLARE v_father_name VARCHAR(100);
DECLARE v_mother_name VARCHAR(100);
DECLARE v_spouse_name VARCHAR(100);
DECLARE v_pli_status VARCHAR(100);
DECLARE v_execution_status VARCHAR(100);
DECLARE v_overdue VARCHAR(100);
DECLARE v_banker_name VARCHAR(200);
-- DECLARE v_visa_status	VARCHAR(50) DEFAULT NULL;
-- DECLARE v_mol_status	VARCHAR(50) DEFAULT NULL;
DECLARE v_is_visit_required VARCHAR(10) DEFAULT NULL;
DECLARE v_settlement_status VARCHAR(45) DEFAULT NULL;
DECLARE v_status tinyint(4);
DECLARE v_created_id BIGINT(20);
DECLARE v_created_dtm TIMESTAMP;
DECLARE v_modified_id BIGINT(20);
DECLARE v_modified_dtm TIMESTAMP;

DECLARE v_out_lead_id BIGINT DEFAULT NULL;
DECLARE v_out_contact_id BIGINT DEFAULT NULL;
DECLARE v_out_address_id BIGINT DEFAULT NULL;
DECLARE v_out_lpl_id BIGINT DEFAULT NULL;
DECLARE v_out_vchk_id BIGINT DEFAULT NULL;
DECLARE v_out_mchk_id BIGINT DEFAULT NULL;


-- Payment Ledger
DECLARE v_credit_limit VARCHAR(100);
DECLARE v_total_outstanding_amount VARCHAR(100);
DECLARE v_principal_outstanding_amount VARCHAR(100);
DECLARE v_minimum_payment VARCHAR(100);
DECLARE v_ghrc_offer_1 VARCHAR(100);
DECLARE v_ghrc_offer_2 VARCHAR(100);
DECLARE v_ghrc_offer_3 VARCHAR(100);
DECLARE v_last_paid_amount VARCHAR(100);
DECLARE v_last_paid_date DATE;

-- Contact
DECLARE v_home_country_number VARCHAR(100);
DECLARE v_mobile_number VARCHAR(100);
DECLARE v_email_id VARCHAR(100);

-- Address
DECLARE v_home_country_address VARCHAR(500);
DECLARE v_city VARCHAR(100);
DECLARE v_pincode VARCHAR(100);
DECLARE v_state VARCHAR(100);
DECLARE v_notification_type_id BIGINT;
DECLARE v_notification_type_description VARCHAR(100);
DECLARE v_task_type_id_pc MEDIUMINT;
DECLARE v_task_type_id_fu MEDIUMINT;
DECLARE v_task_type_id_cr MEDIUMINT;
DECLARE v_task_type_id_payc MEDIUMINT;
DECLARE v_task_status_type_id MEDIUMINT;
DECLARE v_do_not_follow_flag CHAR(1);

-- Start
-- New Fields Added to lead_stage and in template csv
-- 13-May-2025 - Ravikiran Prabhu

DECLARE v_feedback TEXT;
DECLARE v_feedback_auto TEXT;
-- DECLARE v_final_feedback TEXT;
DECLARE v_contactable_non_contactable VARCHAR(100);
DECLARE v_disposition_status VARCHAR(100);
DECLARE v_disposition_status_name VARCHAR(100);
DECLARE v_disposition_code VARCHAR(100);
DECLARE v_traced_source VARCHAR(500);
DECLARE v_traced_details VARCHAR(500);
DECLARE v_visa_status VARCHAR(100);
DECLARE v_mol_status VARCHAR(100);
DECLARE v_contact_info VARCHAR(500);
DECLARE v_mol_passport_no VARCHAR(100);
DECLARE v_mol_expiry_date VARCHAR(100);
DECLARE v_mol_work_permit_no VARCHAR(45);
DECLARE v_salary_in_mol VARCHAR(45);
DECLARE v_company_name_in_mol VARCHAR(100);
DECLARE v_sql_details TEXT;
DECLARE v_company_trade_license_details TEXT;
DECLARE v_additional_details TEXT;
DECLARE v_visa_passport_no VARCHAR(45);
DECLARE v_visa_expiry_date VARCHAR(45);
DECLARE v_visa_file_number VARCHAR(45);
DECLARE v_visa_emirates VARCHAR(45);
DECLARE v_company_name_in_visa VARCHAR(100);
DECLARE v_designation_in_visa VARCHAR(45);
DECLARE v_contact_number_in_visa VARCHAR(45);
DECLARE v_visa_emirates_id VARCHAR(45);
DECLARE v_unified_number VARCHAR(45);

-- New columns added 15-Jan-2025
DECLARE v_fresh_stab VARCHAR(100);
DECLARE v_cycle_statement VARCHAR(100);
DECLARE v_card_auth VARCHAR(100);
DECLARE v_dpd_r VARCHAR(100);
DECLARE v_mindue_manual VARCHAR(100);
DECLARE v_rb_amount VARCHAR(100);
DECLARE v_overdue_amount VARCHAR(100);
DECLARE v_due_since_date VARCHAR(100);
DECLARE v_monthly_income VARCHAR(100);
DECLARE v_office_address VARCHAR(500);
DECLARE v_friend_residence_phone VARCHAR(100);
DECLARE v_last_month_paid_unpaid VARCHAR(100);
DECLARE v_last_usage_date VARCHAR(100);
DECLARE v_dpd_string VARCHAR(100);
DECLARE v_dcore_id VARCHAR(100);

-- End added new fields

-- Variables to assign task_id for automated tasks
DECLARE v_task_id_pc BIGINT;
DECLARE v_task_id_payc BIGINT;

-- Variable for notes
DECLARE v_note_id BIGINT;

-- Variable for disposition code
DECLARE v_disp_code_id BIGINT;

-- Variable for tracing source type if
DECLARE v_tracing_source_type_id BIGINT;
DECLARE v_web_tracing_details_id BIGINT;
DECLARE v_tracing_details_id BIGINT;


-- Automated task creation check
DECLARE v_is_automated_task_created TINYINT DEFAULT 0;

-- 02-Dec-2024: TAIGA-CR #157 : adding below CASE WHEN clauses within SELECT Statements only if either of below columns length <=0 and replacing it with NULL
-- 10-Dec-2024: adding below CASE WHEN clauses within SELECT Statements for all columns length <=0 and replacing it with NULL

DECLARE stage_cursor CURSOR FOR
SELECT
  ls.lead_stage_id,
  comp.company_id,
  CASE WHEN LENGTH((TRIM(ls.senior_manager_id))) <= 0 THEN NULL ELSE (TRIM(ls.senior_manager_id)) END AS senior_manager_email_id,
  CASE WHEN LENGTH((TRIM(ls.team_manager_id))) <= 0 THEN NULL ELSE (TRIM(ls.team_manager_id)) END AS team_manager_email_id,
  CASE WHEN LENGTH((TRIM(ls.team_lead_id))) <= 0 THEN NULL ELSE (TRIM(ls.team_lead_id)) END AS team_lead_email_id,
  CASE WHEN LENGTH((TRIM(ls.assigned_to))) <= 0 THEN NULL ELSE (TRIM(ls.assigned_to)) END AS assigned_to_email_id,
  CASE WHEN LENGTH((TRIM(ls.account_number))) <= 0 THEN NULL ELSE (TRIM(ls.account_number)) END AS account_number,
  CASE WHEN LENGTH((TRIM(ls.product_type))) <= 0 THEN NULL ELSE (TRIM(ls.product_type)) END AS product_type,
  CASE WHEN LENGTH((TRIM(ls.product_account_number))) <= 0 THEN NULL ELSE (TRIM(ls.product_account_number)) END AS product_account_number,
  CASE WHEN LENGTH(UPPER(TRIM(ls.agreement_id))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.agreement_id)) END AS agreement_id,
  CASE WHEN LENGTH(UPPER(TRIM(ls.finware_acn01))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.finware_acn01)) END AS finware_acn01,
  CASE WHEN LENGTH(UPPER(TRIM(ls.business_name))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.business_name)) END AS business_name,
  CASE WHEN LENGTH(UPPER(TRIM(ls.customer_name))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.customer_name)) END AS customer_name,
  CASE WHEN LENGTH(UPPER(TRIM(ls.allocation_status))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.allocation_status)) END AS allocation_status,
  CASE WHEN LENGTH((TRIM(ls.customer_id))) <= 0 THEN NULL ELSE (TRIM(ls.customer_id)) END AS customer_id,
  CASE WHEN LENGTH(UPPER(TRIM(ls.passport_number))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.passport_number)) END AS passport_number,
  CASE WHEN LENGTH(UPPER(
    TRIM(DATE_FORMAT(STR_TO_DATE(ls.date_of_birth, '%d-%b-%Y'), '%Y-%m-%d')
  ))) <= 0 THEN NULL ELSE UPPER(
    TRIM(DATE_FORMAT(STR_TO_DATE(ls.date_of_birth, '%d-%b-%Y'), '%Y-%m-%d')
  )) END AS date_of_birth,
  CASE WHEN LENGTH(UPPER(TRIM(ls.bucket_status))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.bucket_status)) END AS bucket_status,
  CASE WHEN LENGTH(TRIM(ls.card_auth)) <= 0 THEN NULL ELSE TRIM(ls.card_auth) END AS card_auth,
  CASE WHEN LENGTH(TRIM(ls.dpd_r)) <= 0 THEN NULL ELSE TRIM(ls.dpd_r) END AS dpd_r,
  CASE WHEN LENGTH(TRIM(ls.mindue_manual)) <= 0 THEN NULL ELSE TRIM(ls.mindue_manual) END AS mindue_manual,
  CASE WHEN LENGTH(TRIM(ls.rb_amount)) <= 0 THEN NULL ELSE TRIM(ls.rb_amount) END AS rb_amount,
  CASE WHEN LENGTH(TRIM(ls.overdue_amount)) <= 0 THEN NULL ELSE TRIM(ls.overdue_amount) END AS overdue_amount,
  CASE WHEN LENGTH(UPPER(TRIM(ls.vintage))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.vintage)) END AS vintage,
  CASE WHEN LENGTH(UPPER(
    TRIM(DATE_FORMAT(STR_TO_DATE(ls.date_of_woff, '%d-%b-%Y'), '%Y-%m-%d')
  ))) <= 0 THEN NULL ELSE UPPER(
    TRIM(DATE_FORMAT(STR_TO_DATE(ls.date_of_woff, '%d-%b-%Y'), '%Y-%m-%d')
  ))END AS date_of_woff,
  CASE WHEN LENGTH(UPPER(TRIM(ls.nationality))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.nationality)) END AS nationality,
  CASE WHEN LENGTH(UPPER(TRIM(ls.emirates_id_number))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.emirates_id_number)) END AS emirates_id_number,
  CASE WHEN LENGTH(TRIM(ls.due_since_date)) <= 0 THEN NULL ELSE TRIM(ls.due_since_date) END AS due_since_date,
  CASE WHEN LENGTH(TRIM(ls.credit_limit)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.credit_limit)) END AS credit_limit,
  CASE WHEN LENGTH(TRIM(ls.total_outstanding_amount)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.total_outstanding_amount)) END AS total_outstanding_amount,
  CASE WHEN LENGTH(TRIM(ls.principal_outstanding_amount)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.principal_outstanding_amount)) END AS principal_outstanding_amount,
  CASE WHEN LENGTH(TRIM(ls.fresh_stab)) <= 0 THEN NULL ELSE TRIM(ls.fresh_stab) END AS fresh_stab,
  CASE WHEN LENGTH(TRIM(ls.cycle_statement)) <= 0 THEN NULL ELSE TRIM(ls.cycle_statement) END AS cycle_statement,
  CASE WHEN LENGTH(UPPER(TRIM(ls.employer_details))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.employer_details)) END AS employer_details,
  CASE WHEN LENGTH(UPPER(TRIM(ls.designation))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.designation)) END AS designation,
  CASE WHEN LENGTH(UPPER(TRIM(ls.company_contact))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.company_contact)) END AS company_contact,
  CASE WHEN LENGTH(TRIM(ls.office_address)) <= 0 THEN NULL ELSE TRIM(ls.office_address) END AS office_address,
  CASE WHEN LENGTH(UPPER(TRIM(ls.home_country_number))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.home_country_number)) END AS home_country_number,
  CASE WHEN LENGTH(TRIM(ls.friend_residence_phone)) <= 0 THEN NULL ELSE TRIM(ls.friend_residence_phone) END AS friend_residence_phone,
  CASE WHEN LENGTH(UPPER(TRIM(ls.mobile_number))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.mobile_number)) END AS mobile_number,
  CASE WHEN LENGTH(UPPER(TRIM(ls.email_id))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.email_id)) END AS email_id,
  CASE WHEN LENGTH(TRIM(ls.monthly_income)) <= 0 THEN NULL ELSE TRIM(ls.monthly_income) END AS monthly_income,
  CASE WHEN LENGTH(TRIM(ls.minimum_payment)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.minimum_payment)) END AS minimum_payment,
  CASE WHEN LENGTH(TRIM(ls.ghrc_offer_1)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.ghrc_offer_1)) END AS ghrc_offer_1,
  CASE WHEN LENGTH(TRIM(ls.ghrc_offer_2)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.ghrc_offer_2)) END AS ghrc_offer_2,
  CASE WHEN LENGTH(TRIM(ls.ghrc_offer_3)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.ghrc_offer_3)) END AS ghrc_offer_3,
  CASE WHEN LENGTH(UPPER(
    TRIM(DATE_FORMAT(STR_TO_DATE(ls.withdraw_date, '%d-%b-%Y'), '%Y-%m-%d %H:%i:%s')
  ))) <= 0 THEN NULL ELSE UPPER(
    TRIM(DATE_FORMAT(STR_TO_DATE(ls.withdraw_date, '%d-%b-%Y'), '%Y-%m-%d %H:%i:%s')
  )) END AS withdraw_date,
  CASE WHEN LENGTH(UPPER(TRIM(ls.home_country_address))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.home_country_address)) END AS home_country_address,
  CASE WHEN LENGTH(UPPER(TRIM(ls.city))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.city)) END AS city,
  CASE WHEN LENGTH(UPPER(TRIM(ls.pincode))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.pincode)) END AS pincode,
  CASE WHEN LENGTH(UPPER(TRIM(ls.state))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.state)) END AS state,
  CASE WHEN LENGTH(UPPER(TRIM(ls.father_name))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.father_name)) END AS father_name,
  CASE WHEN LENGTH(UPPER(TRIM(ls.mother_name))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.mother_name)) END AS mother_name,
  CASE WHEN LENGTH(UPPER(TRIM(ls.spouse_name))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.spouse_name)) END AS spouse_name,
  CASE WHEN LENGTH(TRIM(ls.last_paid_amount)) <= 0 THEN NULL ELSE UPPER(TRIM(ls.last_paid_amount)) END AS last_paid_amount,
  CASE WHEN LENGTH(TRIM(ls.last_paid_date)) <= 0 THEN NULL ELSE UPPER(TRIM(DATE_FORMAT(STR_TO_DATE(ls.last_paid_date, '%d-%b-%Y'), '%Y-%m-%d %H:%i:%s'))) END AS last_paid_date,
  CASE WHEN LENGTH(TRIM(ls.last_month_paid_unpaid)) <= 0 THEN NULL ELSE TRIM(ls.last_month_paid_unpaid) END AS last_month_paid_unpaid,
  CASE WHEN LENGTH(TRIM(ls.last_usage_date)) <= 0 THEN NULL ELSE TRIM(ls.last_usage_date) END AS last_usage_date,
  CASE WHEN LENGTH(TRIM(ls.dpd_string)) <= 0 THEN NULL ELSE TRIM(ls.dpd_string) END AS dpd_string,
  CASE WHEN LENGTH(UPPER(TRIM(ls.pli_status))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.pli_status)) END AS pli_status,
  CASE WHEN LENGTH(UPPER(TRIM(ls.execution_status))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.execution_status)) END AS execution_status,
  CASE WHEN LENGTH(TRIM(ls.overdue)) <= 0 THEN NULL ELSE TRIM(ls.overdue) END AS overdue,
  CASE WHEN LENGTH(UPPER(TRIM(ls.banker_name))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.banker_name)) END AS banker_name,
  CASE WHEN LENGTH(UPPER(TRIM(ls.do_not_follow_flag))) <= 0 THEN NULL ELSE UPPER(TRIM(ls.do_not_follow_flag)) END AS do_not_follow_flag,
 -- Start 
 -- Adding new fields from csv template into lead_stage table and then the cursor
  CASE WHEN LENGTH(TRIM(ls.feedback)) <= 0 THEN NULL ELSE TRIM(ls.feedback) END AS feedback,
 -- CASE WHEN LENGTH(TRIM(ls.final_feedback)) <= 0 THEN NULL ELSE TRIM(ls.final_feedback) END AS final_feedback,
  CASE WHEN LENGTH(TRIM(ls.contactable_non_contactable)) <= 0 THEN "" ELSE TRIM(ls.contactable_non_contactable) END AS contactable_non_contactable,
  CASE WHEN LENGTH(TRIM(ls.disposition_status)) <= 0 THEN "" ELSE TRIM(ls.disposition_status) END AS disposition_status,
  CASE WHEN LENGTH(TRIM(ls.disposition_status_name)) <= 0 THEN "" ELSE TRIM(ls.disposition_status_name) END AS disposition_status_name,
  CASE WHEN LENGTH(TRIM(ls.disposition_code)) <= 0 THEN "" ELSE TRIM(ls.disposition_code) END AS disposition_code,
  CASE WHEN LENGTH(TRIM(ls.traced_source)) <= 0 THEN NULL ELSE TRIM(ls.traced_source) END AS traced_source,
  CASE WHEN LENGTH(TRIM(ls.traced_details)) <= 0 THEN NULL ELSE TRIM(ls.traced_details) END AS traced_details,
  CASE WHEN LENGTH(TRIM(ls.visa_status)) <= 0 THEN NULL ELSE TRIM(ls.visa_status) END AS visa_status,
  CASE WHEN LENGTH(TRIM(ls.mol_status)) <= 0 THEN NULL ELSE TRIM(ls.mol_status) END AS mol_status,
  CASE WHEN LENGTH(TRIM(ls.contact_info)) <= 0 THEN NULL ELSE TRIM(ls.contact_info) END AS contact_info,
  CASE WHEN LENGTH(TRIM(ls.mol_passport_no)) <= 0 THEN NULL ELSE TRIM(ls.mol_passport_no) END AS mol_passport_no,
  CASE WHEN LENGTH(TRIM(ls.mol_expiry_date)) <= 0 THEN NULL ELSE UPPER(TRIM(DATE_FORMAT(STR_TO_DATE(ls.mol_expiry_date, '%d-%b-%Y'), '%Y-%m-%d %H:%i:%s'))) END AS mol_expiry_date,
  CASE WHEN LENGTH(TRIM(ls.mol_work_permit_no)) <= 0 THEN NULL ELSE TRIM(ls.mol_work_permit_no) END AS mol_work_permit_no,
  CASE WHEN LENGTH(TRIM(ls.salary_in_mol)) <= 0 THEN NULL ELSE TRIM(ls.salary_in_mol) END AS salary_in_mol,
  CASE WHEN LENGTH(TRIM(ls.company_name_in_mol)) <= 0 THEN NULL ELSE TRIM(ls.company_name_in_mol) END AS company_name_in_mol,
  CASE WHEN LENGTH(TRIM(ls.sql_details)) <= 0 THEN NULL ELSE TRIM(ls.sql_details) END AS sql_details,
  CASE WHEN LENGTH(TRIM(ls.company_trade_license_details)) <= 0 THEN NULL ELSE TRIM(ls.company_trade_license_details) END AS company_trade_license_details,
  CASE WHEN LENGTH(TRIM(ls.additional_details)) <= 0 THEN NULL ELSE TRIM(ls.additional_details) END AS additional_details,
  CASE WHEN LENGTH(TRIM(ls.dcore_id)) <= 0 THEN NULL ELSE TRIM(ls.dcore_id) END AS dcore_id,
  CASE WHEN LENGTH(TRIM(ls.visa_passport_no)) <= 0 THEN NULL ELSE TRIM(ls.visa_passport_no) END AS visa_passport_no,
  CASE WHEN LENGTH(TRIM(ls.visa_expiry_date)) <= 0 THEN NULL ELSE UPPER(TRIM(DATE_FORMAT(STR_TO_DATE(ls.visa_expiry_date, '%d-%b-%Y'), '%Y-%m-%d %H:%i:%s'))) END AS visa_expiry_date,
  CASE WHEN LENGTH(TRIM(ls.visa_file_number)) <= 0 THEN NULL ELSE TRIM(ls.visa_file_number) END AS visa_file_number,
  CASE WHEN LENGTH(TRIM(ls.visa_emirates)) <= 0 THEN NULL ELSE TRIM(ls.visa_emirates) END AS visa_emirates,
  CASE WHEN LENGTH(TRIM(ls.company_name_in_visa)) <= 0 THEN NULL ELSE TRIM(ls.company_name_in_visa) END AS company_name_in_visa,
  CASE WHEN LENGTH(TRIM(ls.designation_in_visa)) <= 0 THEN NULL ELSE TRIM(ls.designation_in_visa) END AS designation_in_visa,
  CASE WHEN LENGTH(TRIM(ls.contact_number_in_visa)) <= 0 THEN NULL ELSE TRIM(ls.contact_number_in_visa) END AS contact_number_in_visa,
  CASE WHEN LENGTH(TRIM(ls.unified_number)) <= 0 THEN NULL ELSE TRIM(ls.unified_number) END AS unified_number,
  CASE WHEN LENGTH(TRIM(ls.visa_emirates_id)) <= 0 THEN NULL ELSE TRIM(ls.visa_emirates_id) END AS visa_emirates_id,
  CASE WHEN LENGTH(TRIM(ls.allocation_type)) <= 0 THEN NULL ELSE TRIM(ls.allocation_type) END AS allocation_type,
 -- End
  ls.created_id
  FROM stage.lead_stage ls
  JOIN org.company comp ON ls.company_id = comp.company_id
   AND ls.company_id = in_company_id
 WHERE ls.is_uploaded_flag = "N" 
   AND ls.reason IS NULL
 ORDER BY ls.lead_stage_id;
  
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @err_sqlstate = RETURNED_SQLSTATE,
        @err_message = MESSAGE_TEXT,
        @err_num = MYSQL_ERRNO;
    END;

DECLARE CONTINUE HANDLER FOR NOT FOUND
SET v_finished = 1;

OPEN stage_cursor;

do_upload: LOOP 

SET v_finished = 0; -- Reset before new fetch

/*SELECT v_lead_stage_id,
v_company_id,
v_senior_manager_email_id,
v_team_manager_email_id,
v_team_lead_email_id,
v_assigned_to_email_id,
v_account_number,
v_product_type,
v_product_account_number,
v_agreement_id,
v_business_name,
v_customer_name,
v_allocation_status,
v_customer_id,
v_passport_number,
v_date_of_birth,
v_bucket_status,
v_vintage,
v_date_of_woff,
v_nationality,
v_emirates_id_number,
v_credit_limit,
v_total_outstanding_amount,
v_principal_outstanding_amount,
v_employer_details,
v_designation,
v_company_contact,
v_home_country_number,
v_mobile_number,
v_email_id,
v_minimum_payment,
v_ghrc_offer_1,
v_ghrc_offer_2,
v_ghrc_offer_3,
v_withdraw_date,
v_home_country_address,
v_city,
v_pincode,
v_state,
v_father_name,
v_mother_name,
v_spouse_name,
v_last_paid_amount,
v_last_paid_date,
v_pli_status,
v_execution_status,
v_banker_name,
v_do_not_follow_flag,
v_feedback,
v_contactable_non_contactable,
v_disposition_status,
v_disposition_status_name,
v_disposition_code,
v_traced_source,
v_traced_details,
v_visa_status,
v_mol_status,
v_contact_info,
v_mol_passport_no,
v_mol_expiry_date,
v_mol_work_permit_no,
v_salary_in_mol,
v_company_name_in_mol,
v_sql_details,
v_company_trade_license_details,
v_additional_details,
v_visa_passport_no,
v_visa_expiry_date,
v_visa_file_number,
v_visa_emirates,
v_company_name_in_visa,
v_designation_in_visa,
v_contact_number_in_visa,
v_unified_number,
v_visa_emirates_id,
v_allocation_type,
v_created_id; */

FETCH stage_cursor INTO 
v_lead_stage_id,
v_company_id,
v_senior_manager_email_id,
v_team_manager_email_id,
v_team_lead_email_id,
v_assigned_to_email_id,
v_account_number,
v_product_type,
v_product_account_number,
v_agreement_id,
v_finware_acn01,
v_business_name,
v_customer_name,
v_allocation_status,
v_customer_id,
v_passport_number,
v_date_of_birth,
v_bucket_status,
v_card_auth,
v_dpd_r,
v_mindue_manual,
v_rb_amount,
v_overdue_amount,
v_vintage,
v_date_of_woff,
v_nationality,
v_emirates_id_number,
v_due_since_date,
v_credit_limit,
v_total_outstanding_amount,
v_principal_outstanding_amount,
v_fresh_stab,
v_cycle_statement,
v_employer_details,
v_designation,
v_company_contact,
v_office_address,
v_home_country_number,
v_friend_residence_phone,
v_mobile_number,
v_email_id,
v_monthly_income,
v_minimum_payment,
v_ghrc_offer_1,
v_ghrc_offer_2,
v_ghrc_offer_3,
v_withdraw_date,
v_home_country_address,
v_city,
v_pincode,
v_state,
v_father_name,
v_mother_name,
v_spouse_name,
v_last_paid_amount,
v_last_paid_date,
v_last_month_paid_unpaid,
v_last_usage_date,
v_dpd_string,
v_pli_status,
v_execution_status,
v_overdue,
v_banker_name,
v_do_not_follow_flag,
-- Start 
-- Adding new fields from csv template into lead_stage table and then the cursor
v_feedback,
-- v_final_feedback,
v_contactable_non_contactable,
v_disposition_status,
v_disposition_status_name,
v_disposition_code,
v_traced_source,
v_traced_details,
v_visa_status,
v_mol_status,
v_contact_info,
v_mol_passport_no,
v_mol_expiry_date,
v_mol_work_permit_no,
v_salary_in_mol,
v_company_name_in_mol,
v_sql_details,
v_company_trade_license_details,
v_additional_details,
v_dcore_id,
v_visa_passport_no,
v_visa_expiry_date,
v_visa_file_number,
v_visa_emirates,
v_company_name_in_visa,
v_designation_in_visa,
v_contact_number_in_visa,
v_unified_number,
v_visa_emirates_id,
v_allocation_type,
-- End
v_created_id;

IF v_finished = 1 THEN LEAVE do_upload;
END IF;

SET v_senior_manager_id = NULL;
SET v_team_manager_id = NULL;
SET v_team_lead_id = NULL;
SET v_assigned_to_id = NULL;


-- IF v_do_not_follow_flag = '0' THEN
SELECT lead_status_type_id 
  INTO v_lead_status_type_id_pending
  FROM crm.lead_status_type
 WHERE lead_status_type_name = "PENDING";
-- END IF ;

-- IF v_do_not_follow_flag = '1' THEN
SELECT lead_status_type_id 
  INTO v_lead_status_type_id_stop_follow_up
  FROM crm.lead_status_type
 WHERE lead_status_type_name = "STOP FOLLOW UP";
-- END IF ;

SELECT template_type_id
 INTO v_template_type_id 
 FROM crm.template_type
WHERE template_name = 'DEFAULT';

SELECT u1.user_id AS team_manager_id
  INTO v_team_manager_id 
  FROM user.user u1
 WHERE u1.email_address = v_team_manager_email_id;
   
SELECT u2.user_id AS team_lead_id
  INTO v_team_lead_id
  FROM user.user u2
 WHERE u2.email_address = v_team_lead_email_id;

SELECT u3.user_id AS assigned_to_id
  INTO v_assigned_to_id
  FROM user.user u3
 WHERE u3.email_address = v_assigned_to_email_id;
 
SELECT u4.user_id AS senior_manager_id,
       CURRENT_TIMESTAMP AS assigned_dtm,
       NULL AS target_dtm
  INTO v_senior_manager_id , 
       v_assigned_dtm , 
       v_target_dtm 
  FROM user.user u4
 WHERE u4.email_address = v_senior_manager_email_id;

-- SELECT v_lead_stage_id, v_team_manager_email_id, v_team_lead_email_id, v_assigned_to_email_id, v_senior_manager_email_id;
-- SELECT v_team_manager_id , v_team_lead_id , v_assigned_to_id , v_senior_manager_id;
-- SELECT v_lead_stage_id, v_do_not_follow_flag, v_lead_status_type_id_pending, v_lead_status_type_id_stop_follow_up;


-- 10-Dec-2024: fix: added if-clause to check if not null

-- Reset ALL Variables
SET v_out_lead_id = NULL; 
SET v_out_contact_id = NULL;
SET v_out_address_id = NULL;
SET v_out_lpl_id = NULL;
SET v_out_vchk_id = NULL;
SET v_out_mchk_id = NULL;

-- Validate allocation_type - must be 'monthly' or 'existing'
-- Added: Oct 2025 - Fix for data corruption issue
IF v_allocation_type IS NULL OR TRIM(v_allocation_type) = '' THEN
  -- If empty, default to 'monthly'
  SET v_allocation_type = 'monthly';
ELSEIF UPPER(TRIM(v_allocation_type)) NOT IN ('MONTHLY', 'EXISTING') THEN
  -- If invalid value, reject the upload
  UPDATE stage.lead_stage 
     SET is_uploaded_flag = "E",
         reason = CONCAT('Invalid allocation_type: "', v_allocation_type, '". Must be "monthly" or "existing"')
   WHERE lead_stage_id = v_lead_stage_id
     AND is_uploaded_flag <> "E";
  -- Skip creating the lead
  ITERATE do_upload;
ELSE
  -- Normalize to lowercase
  SET v_allocation_type = LOWER(TRIM(v_allocation_type));
END IF;

IF( v_senior_manager_id IS NOT NULL
  AND v_team_manager_id IS NOT NULL
  AND v_team_lead_id IS NOT NULL
  AND v_assigned_to_id IS NOT NULL
) THEN
-- SELECT v_lead_stage_id, "CREATE LEAD START" FROM DUAL;
-- SELECT v_product_type, v_product_account_number, v_company_id, v_customer_id;
-- SELECT v_created_id,
--   v_company_id,
--   CASE WHEN v_do_not_follow_flag = '0' 
--        THEN v_lead_status_type_id_pending
--        ELSE v_lead_status_type_id_stop_follow_up
--    END,
--   v_template_type_id,
--   v_senior_manager_id,
--   v_team_manager_id,
--   v_team_lead_id,
--   v_assigned_dtm,
--   v_assigned_to_id,
--   v_target_dtm,
--   v_account_number,
--   v_product_type,
--   v_product_account_number,
--   v_agreement_id,
--   v_business_name,
--   v_customer_name,
--   v_allocation_status,
--   v_customer_id,
--   v_passport_number,
--   v_date_of_birth,
--   v_bucket_status,
--   v_vintage,
--   v_date_of_woff,
--   v_nationality,
--   v_emirates_id_number,
--   v_employer_details,
--   v_designation,
--   v_company_contact,
--   v_withdraw_date,
--   v_father_name,
--   v_mother_name,
--   v_spouse_name,
--   v_pli_status,
--   v_execution_status,
--   v_overdue,
--   v_banker_name,
--   v_is_visit_required,
--   v_settlement_status;

CALL crm.create_lead(
  @err_cl,
  v_created_id,
  v_company_id,
  CASE WHEN v_do_not_follow_flag = '0' 
       THEN v_lead_status_type_id_pending
       ELSE v_lead_status_type_id_stop_follow_up
   END,
  v_template_type_id,
  v_senior_manager_id,
  v_team_manager_id,
  v_team_lead_id,
  v_assigned_dtm,
  v_assigned_to_id,
  v_target_dtm,
  v_account_number,
  v_product_type,
  v_product_account_number,
  v_agreement_id,
  v_finware_acn01,
  v_business_name,
  v_customer_name,
  v_allocation_status,
  v_customer_id,
  v_passport_number,
  v_date_of_birth,
  v_bucket_status,
  v_vintage,
  v_date_of_woff,
  v_nationality,
  v_emirates_id_number,
  v_employer_details,
  v_designation,
  v_company_contact,
  v_withdraw_date,
  v_father_name,
  v_mother_name,
  v_spouse_name,
  v_pli_status,
  v_execution_status,
  v_overdue,
  v_banker_name,
  v_is_visit_required,
  v_settlement_status,
  v_allocation_type,
  1, -- is_uploaded_recorded flag
  -- New columns added 15-Jan-2025
  v_fresh_stab,
  v_cycle_statement,
  v_card_auth,
  v_dpd_r,
  v_mindue_manual,
  v_rb_amount,
  v_overdue_amount,
  v_due_since_date,
  v_monthly_income,
  v_office_address,
  v_friend_residence_phone,
  v_last_month_paid_unpaid,
  v_last_usage_date,
  v_dpd_string,
  v_dcore_id,
  -- End new columns
  v_out_lead_id        
);
-- SELECT v_out_lead_id;

-- Fallback: if lead id not returned, try to resolve by available identifiers
IF v_out_lead_id IS NULL THEN
  SELECT lead_id
    INTO v_out_lead_id
    FROM crm.leads
   WHERE company_id = v_company_id
     AND (
       (v_customer_id IS NOT NULL AND customer_id = v_customer_id)
       OR (v_customer_id IS NULL AND v_customer_name IS NOT NULL AND customer_name = v_customer_name)
     )
   ORDER BY modified_dtm DESC
   LIMIT 1;
END IF;
END IF;

-- SELECT v_lead_stage_id, "CREATE TASK" FROM DUAL;
-- 10-Dec-2024: fix: added if-clause to check if v_team_lead_id and v_assigned_to_id are not null
-- Added clause to not make new entries for deallocate and reallocate scenarios
-- Also check if there are existing automated tasks for this lead

SELECT COUNT(1)
  INTO v_is_automated_task_created
  FROM crm.task
 WHERE lead_id = v_out_lead_id  
   AND is_automated = 1;

IF(
  v_team_lead_id IS NOT NULL
  AND v_assigned_to_id IS NOT NULL
  AND v_out_lead_id IS NOT NULL
  AND v_do_not_follow_flag = '0'
  -- AND v_is_automated_task_created = 0 -- Changed since there is ON DUP KEY NOW
)
THEN

-- SELECT "BASE_VARIABLES", v_is_automated_task_created, v_team_lead_id, 
-- v_assigned_to_id, v_out_lead_id, v_do_not_follow_flag,
-- v_assigned_dtm, v_target_dtm, v_created_id;

-- SELECT "DISP_VARIABLES", v_contactable_non_contactable, 
-- v_disposition_status, v_disposition_status_name, v_disposition_code;

INSERT INTO crm.task (
        task_id,              
        task_type_id,         
        disposition_code_id,  
        lead_id,              
        assigned_by,          
        assigned_dtm,         
        assigned_to,          
        target_dtm,           
        task_status_type_id,  
        document_url,      
        mode_of_contact,   
        is_automated,
        is_uploaded_record,
        status,               
        created_id,           
        created_dtm,          
        modified_id,
        modified_dtm
       )
SELECT NULL AS task_id,              
	   tt.task_type_id,         
	   CASE WHEN tt.task_type_name = "PRELIMINARY CHECKS" 
          THEN dc.disposition_code_id 
          ELSE NULL 
		  END disposition_code_id,  -- changed to avoid secondary update below	   
     v_out_lead_id AS lead_id,              
	   v_team_lead_id AS assigned_by,          
	   v_assigned_dtm AS assigned_dtm,         
	   v_assigned_to_id AS assigned_to,          
	   v_target_dtm AS target_dtm,           
	   ttyp.task_status_type_id AS task_status_type_id,  
	   NULL AS document_url,      
	   NULL AS mode_of_contact,   
	   1 AS is_automated,
     1 AS is_uploaded_record,
	   1 AS status,               
       v_created_id AS created_id,           
       CURRENT_TIMESTAMP AS created_dtm,          
	     v_created_id AS modified_id,
       CURRENT_TIMESTAMP AS modified_dtm
   FROM crm.task_type tt
   JOIN crm.task_status_type ttyp
     ON ( tt.task_type_name IN ('PRELIMINARY CHECKS', 'FOLLOW UP', 'CALL REMINDER', 'PAYMENT COLLECTION')
    AND ttyp.task_status_type_name = 'PENDING' )
   -- Avoiding secondary update of crm.task
   LEFT OUTER JOIN 
        crm.disposition_code dc 
     ON ( stage = UPPER(TRIM(v_contactable_non_contactable))
    AND stage_status = UPPER(TRIM(v_disposition_status))
    AND stage_status_name = UPPER(TRIM(v_disposition_status_name))
    AND (stage_status_code = UPPER(TRIM(v_disposition_code)) OR (v_disposition_code IS NULL OR v_disposition_code = '')) )
  
  ON DUPLICATE KEY UPDATE 
         disposition_code_id = IF(tt.task_type_name = "PRELIMINARY CHECKS", dc.disposition_code_id, NULL),
         assigned_by = assigned_by,
         assigned_dtm = assigned_dtm,
         -- assigned_to = assigned_to, -- Part of UK
         target_dtm = target_dtm,
         -- task_status_type_id = ttyp.task_status_type_id, -- Part of UK
         document_url = document_url,
         mode_of_contact = mode_of_contact,         
         status = 1,
         modified_id = v_created_id,
         modified_dtm = CURRENT_TIMESTAMP,
         task_id = LAST_INSERT_ID(task_id);  
END IF;


-- Fetch Task Id for Preliminary Checks
SELECT MAX(task_id)
  INTO v_task_id_pc 
  FROM crm.task t
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id 
   AND tt.task_type_name = 'PRELIMINARY CHECKS'
 WHERE t.lead_id = v_out_lead_id
   AND t.is_automated = 1;
   
-- Fetch Task Id for Payment Collection
SELECT MAX(task_id)
  INTO v_task_id_payc 
  FROM crm.task t
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id 
   AND tt.task_type_name = 'PAYMENT COLLECTION'
 WHERE t.lead_id = v_out_lead_id
   AND t.is_automated = 1;
   
/*
## Start Create notes for tasks
*/

SELECT note_id
  INTO v_note_id
  FROM crm.notes
 WHERE task_id = v_task_id_pc;
 
IF v_feedback IS NOT NULL THEN

	IF v_note_id IS NOT NULL THEN

	CALL crm.edit_note(@err,
			   v_created_id,
			   v_note_id,
			   v_feedback,
			   1);

	ELSE

  -- Hack to capture only auto created notes and thereby is_upload_record = 1 logic inside
  -- create_note
  SET v_feedback_auto = CONCAT(v_feedback, "$###$");

	CALL crm.create_note(@err,
			     v_created_id,
			     v_task_id_pc,
			     v_feedback_auto,
			     @onid);
	END IF;
END IF;

/*
## End Create notes for tasks
*/

/*
## Start Disp code update for tasks
*/

-- SELECT MIN(disposition_code_id)
--   INTO v_disp_code_id
--   FROM crm.disposition_code
--  WHERE stage = UPPER(v_contactable_non_contactable)
--    AND stage_status = UPPER(v_disposition_status)
--    AND stage_status_name = UPPER(v_disposition_status_name)
--    AND stage_status_code = UPPER(v_disposition_code);

-- UPDATE crm.task
--    SET disposition_code_id = v_disp_code_id
--  WHERE task_id = v_task_id_pc;

/*
## End Disp code update for tasks
*/


/*
## Start web tracing source and details update
*/

SELECT tracing_source_type_id
  INTO v_tracing_source_type_id
  FROM crm.tracing_source_type
 WHERE tracing_source_type_name = UPPER(IFNULL(v_traced_source,""));
 
SELECT web_tracing_details_id
  INTO v_web_tracing_details_id
  FROM crm.web_tracing_details
 WHERE lead_id = v_out_lead_id
   AND task_id = v_task_id_pc
   AND tracing_source_type_id = IFNULL(v_tracing_source_type_id,0);


IF v_web_tracing_details_id IS NULL THEN 
CALL `crm`.create_web_tracing_details(@err,
									  v_created_id,
                                      v_out_lead_id,
                                      v_task_id_pc,
                                      v_tracing_source_type_id,
                                      v_traced_details,
                                      @owtdid);

UPDATE crm.web_tracing_details
   SET is_uploaded_record = 1 
 WHERE web_tracing_details_id = @owtdid;

ELSE 
UPDATE crm.web_tracing_details
   SET traced_details = v_traced_details 
 WHERE web_tracing_details_id = v_web_tracing_details_id;
END IF;
/*
## End web tracing source and details update
*/

/*
## Start web tracing source and details update
*/
 
SELECT MIN(traced_details_id)
  INTO v_tracing_details_id
  FROM crm.tracing_details
 WHERE lead_id = v_out_lead_id
   AND task_id = v_task_id_pc;
   
-- SELECT v_created_id,v_tracing_details_id,
--                                       v_out_lead_id,
--                                       v_task_id_pc,
--                                       v_sql_details,
--                                       v_company_trade_license_details,
--                                       v_additional_details FROM DUAL;

IF LENGTH(TRIM(v_sql_details)) > 0 AND LENGTH(TRIM(v_company_trade_license_details)) > 0 AND LENGTH(TRIM(v_additional_details)) > 0 THEN
CALL `crm`.create_tracing_details(@err,
									  v_created_id,
                                      v_out_lead_id,
                                      v_task_id_pc,
                                      v_sql_details,
                                      v_company_trade_license_details,
                                      v_additional_details,
                                      @otdid);

UPDATE crm.tracing_details
   SET is_uploaded_record = 1 
 WHERE traced_details_id = @otdid;

END IF;
-- Changed as discussed with Ranjima 
-- IF v_tracing_details_id IS NULL THEN 
-- CALL `crm`.create_tracing_details(@err,
-- 									  v_created_id,
--                                       v_out_lead_id,
--                                       v_task_id_pc,
--                                       v_sql_details,
--                                       v_company_trade_license_details,
--                                       v_additional_details,
--                                       @otdid);
-- ELSE 
-- UPDATE crm.tracing_details
--    SET sql_details = v_sql_details,
--        company_trade_license_details = v_company_trade_license_details,
--        additional_details = v_additional_details
--  WHERE traced_details_id = v_tracing_details_id;
-- END IF;
/*
## End web tracing source and details update
*/

-- SELECT * FROM crm.tracing_details;
-- sql_details
-- company_trade_license_details
-- additional_details

-- IF v_customer_name IS NOT NULL
-- 02-Dec-2024: TAIGA-CR #157 : adding below if clauses to call sp only if either of below columns has the data
IF (v_email_id IS NOT NULL
   OR v_home_country_number IS NOT NULL
   OR v_mobile_number IS NOT NULL ) 
   AND v_out_lead_id IS NOT NULL THEN
   
-- SELECT v_lead_stage_id, "CREATE CONTACT" FROM DUAL;

   CALL crm.create_contact(
      @err_cc,
      v_created_id,
      v_out_lead_id,
      v_task_id_pc,
      NULL,
      v_customer_name,
      v_email_id,
      v_home_country_number,
      NULL,
      v_mobile_number,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      1,
      v_friend_residence_phone,
      v_monthly_income,
      v_out_contact_id
   );

UPDATE crm.contact
   SET is_uploaded_record = 1 
 WHERE contact_id = v_out_contact_id;

END IF;

-- IF v_customer_name IS NOT NULL
-- 02-Dec-2024: TAIGA-CR #157 :  adding below if clauses to call sp only if either of below columns has the data
IF (v_home_country_address IS NOT NULL
   OR v_city IS NOT NULL
   OR v_state IS NOT NULL
   OR v_pincode IS NOT NULL)
   AND v_out_lead_id IS NOT NULL THEN

-- SELECT v_lead_stage_id, "CREATE ADDRESS" FROM DUAL;

    CALL crm.create_address(
    @err_ca,
    v_created_id,
    v_out_lead_id,
    v_task_id_pc,
    NULL,
    v_customer_name,
    v_home_country_address,
    NULL,
    NULL,
    v_city,
    v_state,
    NULL,
    v_pincode,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    1,
    v_office_address,
    v_out_address_id
  );

UPDATE crm.address
   SET is_uploaded_record = 1 
 WHERE address_id = v_out_address_id;

END IF ;

-- 02-Dec-2024: TAIGA-CR #157 :  adding below if clauses to call sp only if either of below columns has the data
-- 03-Dec-2024- fix: validate data under 'v_last_paid_amount' and 'v_last_paid_date' and make sp call
-- Updated: Simplified to only check TOS amount - no other dependencies required
IF (
    v_total_outstanding_amount IS NOT NULL
    ) 
    AND v_out_lead_id IS NOT NULL THEN

-- SELECT v_lead_stage_id, "CREATE PAYMENT" FROM DUAL;

CALL crm.create_leads_payment_ledger(
  @err_lpl,
  v_created_id,
  v_out_lead_id,
  v_task_id_payc,
  v_last_paid_amount,
  v_last_paid_date,
  v_credit_limit,
  v_principal_outstanding_amount,
  v_total_outstanding_amount,
  v_minimum_payment,
  v_ghrc_offer_1,
  v_ghrc_offer_2,
  v_ghrc_offer_3,
  v_fresh_stab,
  v_cycle_statement,
  v_card_auth,
  v_dpd_r,
  v_mindue_manual,
  v_rb_amount,
  v_overdue_amount,
  v_due_since_date,
  v_last_month_paid_unpaid,
  v_last_usage_date,
  v_dpd_string,
  v_out_lpl_id
);

UPDATE crm.leads_payment_ledger
   SET is_uploaded_record = 1 
 WHERE lead_payment_ledger_id = v_out_lpl_id;

END IF ;

-- Before calling crm.create_visa_check, sanitize v_visa_status
-- SET v_visa_status = CASE UPPER(TRIM(v_visa_status))
--   WHEN 'ACTIVE' THEN 'ACTIVE'
--   WHEN 'VOILATED' THEN 'VOILATED'
--   WHEN 'CANCELLED' THEN 'CANCELLED'
--   WHEN 'NEARLY EXPIRED' THEN 'NEARLY EXPIRED'
--   WHEN 'NO RECORD FOUND' THEN 'NO RECORD FOUND'
--   ELSE ''
-- END;

-- SELECT v_visa_passport_no;
-- SELECT v_visa_emirates;
-- SELECT v_out_lead_id; 

IF (
    v_visa_status IS NOT NULL
    -- v_visa_passport_no IS NOT NULL OR 
    -- v_visa_emirates IS NOT NULL
    ) 
   AND v_out_lead_id IS NOT NULL  THEN

-- SELECT v_lead_stage_id, "CREATE VISA CHECK" FROM DUAL;

-- SELECT  v_created_id,
--    v_out_lead_id,
--   v_task_id_pc,
--   NULL,
--   v_visa_passport_no, -- v_passport_number, changed as per new template
--   v_visa_status,
--   v_visa_expiry_date,
--   v_visa_file_number,
--   v_visa_emirates,
--   v_company_name_in_visa,
--   v_designation_in_visa,
--   v_contact_number_in_visa,
--   NULL,
--   v_visa_emirates_id,
--   v_unified_number,
--   v_out_vchk_id ; 

CALL crm.create_visa_check(
  @err_vc,
  v_created_id,
  v_out_lead_id,
  v_task_id_pc,
  NULL,
  v_visa_passport_no, -- v_passport_number, changed as per new template
  v_visa_status,
  v_visa_expiry_date,
  v_visa_file_number,
  v_visa_emirates,
  v_company_name_in_visa,
  v_designation_in_visa,
  v_contact_number_in_visa,
  NULL,
  v_visa_emirates_id,
  v_unified_number,
  v_out_vchk_id
);
-- SELECT @err_vc;

UPDATE crm.visa_check
   SET is_uploaded_record = 1 
 WHERE visa_check_id = v_out_vchk_id;

END IF ;

IF (v_mol_status IS NOT NULL) 
   AND v_out_lead_id IS NOT NULL  THEN

--     SELECT 			     v_created_id,
-- 			     v_task_id_pc,
--                  v_out_lead_id,
-- 			     v_mol_status FROM DUAL;

CALL crm.create_mol_check(
  @err_mlc,
  v_created_id,
  v_out_lead_id,
  v_task_id_pc,
  NULL,
  v_mol_status,
  v_mol_work_permit_no,
  v_company_name_in_mol,
  v_mol_expiry_date,
  v_salary_in_mol,
  v_mol_passport_no,
  v_out_mchk_id
);

UPDATE crm.mol_check
   SET is_uploaded_record = 1 
 WHERE mol_check_id = v_out_mchk_id;

END IF ;

-- Create Tracing Details (SQL, Company Trade License, Additional Details)
IF (v_sql_details IS NOT NULL 
    OR v_company_trade_license_details IS NOT NULL 
    OR v_additional_details IS NOT NULL)
   AND v_out_lead_id IS NOT NULL THEN

CALL crm.create_tracing_details(
  @err_td,
  v_created_id,
  v_out_lead_id,
  v_task_id_pc,
  v_sql_details,
  v_company_trade_license_details,
  v_additional_details,
  v_tracing_details_id
);

UPDATE crm.tracing_details
   SET is_uploaded_record = 1 
 WHERE traced_details_id = v_tracing_details_id;

END IF ;

-- Create Web Tracing Details (Traced Source and Details)
IF (v_traced_source IS NOT NULL OR v_traced_details IS NOT NULL)
   AND v_out_lead_id IS NOT NULL THEN

-- First get or create the tracing source type
SELECT tracing_source_type_id 
  INTO v_tracing_source_type_id
  FROM crm.tracing_source_type
 WHERE tracing_source_type_name = v_traced_source
 LIMIT 1;

-- Only create if we have a valid tracing source type
IF v_tracing_source_type_id IS NOT NULL THEN
  CALL crm.create_web_tracing_details(
    @err_wtd,
    v_created_id,
    v_out_lead_id,
    v_task_id_pc,
    v_tracing_source_type_id,
    v_traced_details,
    v_web_tracing_details_id
  );

  UPDATE crm.web_tracing_details
     SET is_uploaded_record = 1 
   WHERE web_tracing_details_id = v_web_tracing_details_id;
END IF;

END IF ;

-- Conditional Error Marking

-- IF v_email_id = "" THEN
-- UPDATE stage.lead_stage
--    SET is_uploaded_flag = "E",
--        reason = "Email ID Missing"
--  WHERE lead_stage_id = v_lead_stage_id;

IF ( v_senior_manager_id IS NULL
     OR v_team_manager_id IS NULL
     OR v_team_lead_id IS NULL
     OR v_assigned_to_id IS NULL) THEN
UPDATE stage.lead_stage 
   SET is_uploaded_flag = "E",
       reason = "No User Email Data Available"
 WHERE lead_stage_id = v_lead_stage_id;
END IF;

IF @err_cl < 0 THEN
UPDATE stage.lead_stage
  SET is_uploaded_flag = "E",
      reason =  CONCAT (' crm.leads ',@err_cl, ' lead_id-', IFNULL(v_out_lead_id,""))
WHERE lead_stage_id = v_lead_stage_id
  AND is_uploaded_flag <> "E";
ELSEIF @err_cc < 0 THEN
UPDATE stage.lead_stage
   SET is_uploaded_flag = "E",
       reason = CONCAT (' crm.contact ',@err_cc,  ' contact_id-', IFNULL(v_out_contact_id,""))
 WHERE lead_stage_id = v_lead_stage_id
   AND is_uploaded_flag <> "E";
ELSEIF @err_ca < 0 THEN
UPDATE stage.lead_stage
   SET is_uploaded_flag = "E",
       reason = CONCAT (' crm.address ',@err_ca,  ' address_id-', IFNULL(v_out_address_id,""))
 WHERE lead_stage_id = v_lead_stage_id
   AND is_uploaded_flag <> "E";
ELSEIF @err_lpl < 0 THEN
UPDATE stage.lead_stage
   SET is_uploaded_flag = "E",
       reason = CONCAT (' crm.lpl ',@err_lpl,  ' lpl_id-', IFNULL(v_out_lpl_id,""))
 WHERE lead_stage_id = v_lead_stage_id
   AND is_uploaded_flag <> "E";
ELSEIF @err_vc < 0 THEN
UPDATE stage.lead_stage
   SET is_uploaded_flag = "E",
       reason = CONCAT (' crm.vc ',@err_vc,  ' vc_id-', IFNULL(v_out_vchk_id,""))
 WHERE lead_stage_id = v_lead_stage_id
   AND is_uploaded_flag <> "E";
ELSEIF @err_mlc < 0 THEN
UPDATE stage.lead_stage
   SET is_uploaded_flag = "E",
       reason = CONCAT (' crm.mol_chk ',@err_mlc,  ' vc_id-', IFNULL(v_out_mchk_id,""))
 WHERE lead_stage_id = v_lead_stage_id
   AND is_uploaded_flag <> "E";
ELSEIF v_out_lead_id IS NULL AND v_out_contact_id IS NULL AND v_out_address_id IS NULL AND v_out_lpl_id IS NULL AND v_out_vchk_id IS NULL AND v_out_mchk_id IS NULL THEN
UPDATE stage.lead_stage 
   SET is_uploaded_flag = "E",
       reason = "No Data Available"
 WHERE lead_stage_id = v_lead_stage_id
   AND is_uploaded_flag <> "E";
ELSE
-- SELECT v_lead_stage_id, "Upload Success" FROM DUAL; 
UPDATE stage.lead_stage 
   SET is_uploaded_flag = 'Y',
       reason = CONCAT( 'Uploaded Successfully', ' lead_id-', IFNULL(v_out_lead_id,""), ' contact_id-', IFNULL(v_out_contact_id,""), ' address_id-', IFNULL(v_out_address_id,""), ' lpl_id-', IFNULL(v_out_lpl_id,""), ' vc_id-', IFNULL(v_out_vchk_id,""), ' mlc_id-', IFNULL(v_out_mchk_id,""))
 WHERE lead_stage_id = v_lead_stage_id;

 
/* START NOTIFICATIONS */
SELECT notification_type_id, notification_type_description
  INTO v_notification_type_id , v_notification_type_description 
  FROM user.notification_type
 WHERE notification_type_name = 'ACCOUNTS_UPLOAD';

-- Send one Notif to Senior Manager
-- SELECT v_lead_stage_id, "SR MGR NOTIF" FROM DUAL;
CALL user.create_user_notification(
  @err,
  v_senior_manager_id,
  -- Notif recipient Bank Manager
  v_notification_type_id,
  v_notification_type_description,
  -- Notif Name
  'New Accounts Data File Uploaded. Please review and reassign',
  CURRENT_TIMESTAMP,
  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
  5,
  1,
  1,
  NULL,
  1,
  @out_id
);

-- Send one Notif to Team Manager
-- SELECT v_lead_stage_id, "TEAM MGR NOTIF" FROM DUAL;
CALL user.create_user_notification(
  @err,
  v_team_manager_id,
  -- Notif recipient Bank Manager
  v_notification_type_id,
  v_notification_type_description,
  -- Notif Name
  'New Accounts Data File Uploaded. Please review and reassign',
  CURRENT_TIMESTAMP,
  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
  5,
  1,
  1,
  NULL,
  1,
  @out_id
);

-- Send one Notif to Team Lead
-- SELECT v_lead_stage_id, "TL NOTIF" FROM DUAL;
CALL user.create_user_notification(
  @err,
  v_team_lead_id,
  -- Notif recipient Bank Team Lead
  v_notification_type_id,
  v_notification_type_description,
  -- Notif Name
  'New Accounts Data File Uploaded. Please review and reassign',
  CURRENT_TIMESTAMP,
  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
  5,
  1,
  1,
  NULL,
  1,
  @out_id
);

-- Send one Notif to Assigned To
-- SELECT v_lead_stage_id, "ASSIGNEE NOTIF" FROM DUAL;
CALL user.create_user_notification(
  @err,
  v_assigned_to_id,
  -- Notif recipient Assigned To
  v_notification_type_id,
  v_notification_type_description,
  -- Notif Name
  'New Accounts Data Assigned. Please review',
  CURRENT_TIMESTAMP,
  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
  5,
  1,
  1,
  NULL,
  1,
  @out_id
);

/* END NOTIFICATIONS */

END IF ;



END LOOP do_upload;

CLOSE stage_cursor;

SET error_code = 0;

END $$ 
DELIMITER ;
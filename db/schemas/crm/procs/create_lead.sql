-- call `crm`.create_lead(@err,1,1,1,1,2,1,1,"2024-05-15 00:00:00",3,NULL,4444444,"AL","23424242435900000","23424242435900000","Business Name 1","ROHIT SHARMA  1","SAME",245470,"E2192657","2024-05-15 00:00:00","BKT Status","H_MORE THAN 10 YR","2024-05-15 00:00:00","INDIA","784197918648516 ",740000,123,123,"PRODUCTION SERVICES NETWORK EMIRATE","Designation",26519800,"911234567890 ",503276140,"HAREESHGS12@GMAIL.COM",456,123,123,123,"2016-04-01","Home Country Address","City","560001","KA","Father Name","Mother Name","Spouse Name",123,"2024-05-15 00:00:00","PLI Status","Execution Status","SBI",@olid);
-- CALL crm.create_lead(@err,8, 6, 2, 1, 3, 4, 5, '2024-12-13 05:52:16', 6, '2024-12-13 05:52:16', 5, 'qwerty', 
-- 5,NULL,NULL, 'DECIMAL NO ERROR 5', 'YES 5', 5,NULL ,NULL ,NULL ,NULL ,NULL ,NULL ,NULL ,NULL ,NULL ,NULL ,
-- NULL ,NULL ,NULL ,NULL ,NULL ,NULL ,NULL , 'DECIMAL NO ERROR BANKER NAME 5',NULL,NULL, @olid);
DROP PROCEDURE IF EXISTS `crm`.create_lead;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_lead(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_company_id BIGINT(20),
       IN in_lead_status_type_id MEDIUMINT(9),
       IN in_template_type_id MEDIUMINT(9),
       IN in_senior_manager_id BIGINT(20),
       IN in_team_manager_id BIGINT(20),
       IN in_assigned_by BIGINT(20),
       IN in_assigned_dtm TIMESTAMP,
       IN in_assigned_to BIGINT(20),
       IN in_target_dtm TIMESTAMP,
       IN in_account_number VARCHAR(100),
       IN in_product_type VARCHAR(100),
       IN in_product_account_number VARCHAR(100),
       IN in_agreement_id VARCHAR(100),
       IN in_finware_acn01 VARCHAR(100),
       IN in_business_name VARCHAR(1000),
       IN in_customer_name VARCHAR(1000),
       IN in_allocation_status VARCHAR(100),
       IN in_customer_id VARCHAR(100),
       IN in_passport_number VARCHAR(100),
       IN in_date_of_birth VARCHAR(100),
       IN in_bucket_status VARCHAR(100),
       IN in_vintage VARCHAR(100),
       IN in_date_of_woff VARCHAR(100),
       IN in_nationality VARCHAR(100),
       IN in_emirates_id_number VARCHAR(100),
       IN in_employer_details VARCHAR(200),
       IN in_designation VARCHAR(200),
       IN in_company_contact VARCHAR(100),
       IN in_withdraw_date VARCHAR(100),
       IN in_father_name VARCHAR(100),
       IN in_mother_name VARCHAR(100),
       IN in_spouse_name VARCHAR(100),
       IN in_pli_status VARCHAR(100),
       IN in_execution_status VARCHAR(100),
       IN in_overdue VARCHAR(100),
       IN in_banker_name VARCHAR(200),
       IN in_is_visit_required VARCHAR(10),
       IN in_settlement_status VARCHAR(45),
       IN in_allocation_type VARCHAR(10),
       IN in_is_uploaded_record TINYINT,
       -- New columns added 15-Jan-2025
       IN in_fresh_stab VARCHAR(100),
       IN in_cycle_statement VARCHAR(100),
       IN in_card_auth VARCHAR(100),
       IN in_dpd_r VARCHAR(100),
       IN in_mindue_manual VARCHAR(100),
       IN in_rb_amount VARCHAR(100),
       IN in_overdue_amount VARCHAR(100),
       IN in_due_since_date VARCHAR(100),
       IN in_monthly_income VARCHAR(100),
       IN in_office_address VARCHAR(500),
       IN in_friend_residence_phone VARCHAR(100),
       IN in_last_month_paid_unpaid VARCHAR(100),
       IN in_last_usage_date VARCHAR(100),
       IN in_dpd_string VARCHAR(100),
       IN in_dcore_id VARCHAR(100),
       -- End new columns
       OUT out_lead_id BIGINT
) 
BEGIN
DECLARE v_existing_lead_id BIGINT DEFAULT NULL;

SET error_code = -2;

-- Check if a lead already exists for this company/customer/product combination
SELECT lead_id INTO v_existing_lead_id
FROM crm.leads
WHERE company_id = in_company_id
  AND customer_id = in_customer_id
  AND product_type = in_product_type
LIMIT 1;

-- If lead exists, UPDATE it
IF v_existing_lead_id IS NOT NULL THEN
  UPDATE `crm`.leads
  SET
    lead_status_type_id = IFNULL(in_lead_status_type_id, lead_status_type_id),
    template_type_id = IFNULL(in_template_type_id, template_type_id),
    senior_manager_id = IFNULL(in_senior_manager_id, senior_manager_id),
    team_manager_id = IFNULL(in_team_manager_id, team_manager_id),
    assigned_by = IFNULL(in_assigned_by, assigned_by),
    assigned_dtm = IFNULL(in_assigned_dtm, assigned_dtm),
    assigned_to = IFNULL(in_assigned_to, assigned_to),
    target_dtm = IFNULL(in_target_dtm, target_dtm),
    account_number = in_account_number,  -- Always update (allow clearing to NULL)
    product_account_number = in_product_account_number,  -- Always update (allow clearing to NULL)
    agreement_id = IFNULL(in_agreement_id, agreement_id),
    finware_acn01 = IFNULL(in_finware_acn01, finware_acn01),
    business_name = IFNULL(in_business_name, business_name),
    customer_name = IFNULL(in_customer_name, customer_name),
    allocation_status = IFNULL(in_allocation_status, allocation_status),
    passport_number = IFNULL(in_passport_number, passport_number),
    date_of_birth = IFNULL(in_date_of_birth, date_of_birth),
    bucket_status = IFNULL(in_bucket_status, bucket_status),
    vintage = IFNULL(in_vintage, vintage),
    date_of_woff = IFNULL(in_date_of_woff, date_of_woff),
    nationality = IFNULL(in_nationality, nationality),
    emirates_id_number = IFNULL(in_emirates_id_number, emirates_id_number),
    employer_details = IFNULL(in_employer_details, employer_details),
    designation = IFNULL(in_designation, designation),
    company_contact = IFNULL(in_company_contact, company_contact),
    withdraw_date = IFNULL(in_withdraw_date, withdraw_date),
    father_name = IFNULL(in_father_name, father_name),
    mother_name = IFNULL(in_mother_name, mother_name),
    spouse_name = IFNULL(in_spouse_name, spouse_name),
    pli_status = IFNULL(in_pli_status, pli_status),
    execution_status = IFNULL(in_execution_status, execution_status),
    overdue = IFNULL(in_overdue, overdue),
    banker_name = IFNULL(in_banker_name, banker_name),
    is_visit_required = IFNULL(in_is_visit_required, is_visit_required),
    settlement_status = IFNULL(in_settlement_status, settlement_status),
    allocation_type = IFNULL(in_allocation_type, allocation_type),
    fresh_stab = IFNULL(in_fresh_stab, fresh_stab),
    cycle_statement = IFNULL(in_cycle_statement, cycle_statement),
    card_auth = IFNULL(in_card_auth, card_auth),
    dpd_r = IFNULL(in_dpd_r, dpd_r),
    mindue_manual = IFNULL(in_mindue_manual, mindue_manual),
    rb_amount = IFNULL(in_rb_amount, rb_amount),
    overdue_amount = IFNULL(in_overdue_amount, overdue_amount),
    due_since_date = IFNULL(in_due_since_date, due_since_date),
    monthly_income = IFNULL(in_monthly_income, monthly_income),
    office_address = IFNULL(in_office_address, office_address),
    friend_residence_phone = IFNULL(in_friend_residence_phone, friend_residence_phone),
    last_month_paid_unpaid = IFNULL(in_last_month_paid_unpaid, last_month_paid_unpaid),
    last_usage_date = IFNULL(in_last_usage_date, last_usage_date),
    dpd_string = IFNULL(in_dpd_string, dpd_string),
    dcore_id = IFNULL(in_dcore_id, dcore_id),
    status = 1,
    modified_id = IFNULL(in_app_user_id, modified_id),
    modified_dtm = CURRENT_TIMESTAMP
  WHERE lead_id = v_existing_lead_id;
  
  SET out_lead_id = v_existing_lead_id;
  
ELSE
  -- If lead doesn't exist, INSERT new one
  INSERT INTO
       `crm`.leads(
              lead_id,
              company_id,
              lead_status_type_id,
              template_type_id,
              senior_manager_id,
              team_manager_id,
              assigned_by,
              assigned_dtm,
              assigned_to,
              target_dtm,
              account_number,
              product_type,
              product_account_number,
              agreement_id,
              finware_acn01,
              business_name,
              customer_name,
              allocation_status,
              customer_id,
              passport_number,
              date_of_birth,
              bucket_status,
              vintage,
              date_of_woff,
              nationality,
              emirates_id_number,
              employer_details,
              designation,
              company_contact,
              withdraw_date,
              father_name,
              mother_name,
              spouse_name,
              pli_status,
              execution_status,
              overdue,
              banker_name,
              is_visit_required,
              settlement_status,
              allocation_type,
              is_uploaded_record,
              -- New columns added 15-Jan-2025
              fresh_stab,
              cycle_statement,
              card_auth,
              dpd_r,
              mindue_manual,
              rb_amount,
              overdue_amount,
              due_since_date,
              monthly_income,
              office_address,
              friend_residence_phone,
              last_month_paid_unpaid,
              last_usage_date,
              dpd_string,
              dcore_id,
              -- End new columns
              status,
              created_id,
              created_dtm,
              modified_id,
              modified_dtm
       )
VALUES
       (
              NULL,
              in_company_id,
              in_lead_status_type_id,
              in_template_type_id,
              in_senior_manager_id,
              in_team_manager_id,
              in_assigned_by,
              in_assigned_dtm,
              in_assigned_to,
              in_target_dtm,
              in_account_number,
              in_product_type,
              in_product_account_number,
              in_agreement_id,
              in_finware_acn01,
              in_business_name,
              in_customer_name,
              in_allocation_status,
              in_customer_id,
              in_passport_number,
              -- IFNULL (in_date_of_birth,'1970-01-01'),
              in_date_of_birth,
              in_bucket_status,
              in_vintage,
              in_date_of_woff,
              in_nationality,
              in_emirates_id_number,
              in_employer_details,
              in_designation,
              in_company_contact,
              in_withdraw_date,
              in_father_name,
              in_mother_name,
              in_spouse_name,
              in_pli_status,
              in_execution_status,
              in_overdue,
              in_banker_name,
              in_is_visit_required,
              in_settlement_status,
              in_allocation_type,
              IFNULL(in_is_uploaded_record, 0),
              -- New columns added 15-Jan-2025
              in_fresh_stab,
              in_cycle_statement,
              in_card_auth,
              in_dpd_r,
              in_mindue_manual,
              in_rb_amount,
              in_overdue_amount,
              in_due_since_date,
              in_monthly_income,
              in_office_address,
              in_friend_residence_phone,
              in_last_month_paid_unpaid,
              in_last_usage_date,
              in_dpd_string,
              in_dcore_id,
              -- End new columns
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       );
  
  -- Get the newly inserted lead_id
  SET out_lead_id = LAST_INSERT_ID();
  
END IF;  -- Close the IF-ELSE block

COMMIT;

SET
       error_code = 0;

END $$ 
DELIMITER ;
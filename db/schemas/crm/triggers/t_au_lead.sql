DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_au_lead$$

CREATE TRIGGER crm.t_au_lead AFTER UPDATE on crm.leads
FOR EACH ROW BEGIN

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_lead_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_type CHAR(1) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

DECLARE v_notification_type_id BIGINT;
DECLARE v_notification_type_description VARCHAR(100);

DECLARE v_lead_status_type_old VARCHAR(100);
DECLARE v_template_type_old VARCHAR(100);
DECLARE v_senior_manager_id_old VARCHAR(500);
DECLARE v_team_manager_id_old VARCHAR(500);
DECLARE v_assigned_by_old VARCHAR(500);
DECLARE v_assigned_to_old VARCHAR(500);

DECLARE v_lead_status_type_new VARCHAR(100);
DECLARE v_template_type_new VARCHAR(100);
DECLARE v_senior_manager_id_new VARCHAR(500);
DECLARE v_team_manager_id_new VARCHAR(500);
DECLARE v_assigned_by_new VARCHAR(500);
DECLARE v_assigned_to_new VARCHAR(500);

DECLARE v_is_touched TINYINT DEFAULT 0;

SELECT lead_status_type_name
  INTO v_lead_status_type_old
  FROM crm.lead_status_type
 WHERE lead_status_type_id = old.lead_status_type_id;

SELECT lead_status_type_name
  INTO v_lead_status_type_new
  FROM crm.lead_status_type
 WHERE lead_status_type_id = new.lead_status_type_id;
 
 SELECT template_name
  INTO v_template_type_old
  FROM crm.template_type
 WHERE template_type_id = old.template_type_id;

SELECT template_name
  INTO v_template_type_new
  FROM crm.template_type
 WHERE template_type_id = new.template_type_id;

 SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_senior_manager_id_old
  FROM user.user u
 WHERE user_id = old.senior_manager_id;

  SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_senior_manager_id_new
  FROM user.user u
 WHERE user_id = old.senior_manager_id;

 SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_team_manager_id_old
  FROM user.user u
 WHERE user_id = old.team_manager_id;

  SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_team_manager_id_new
  FROM user.user u
 WHERE user_id = old.team_manager_id;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_by_old
  FROM user.user u
 WHERE user_id = old.assigned_by;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_by_new
  FROM user.user u
 WHERE user_id = new.assigned_by;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_to_old
  FROM user.user u
 WHERE user_id = old.assigned_to;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_to_new
  FROM user.user u
 WHERE user_id = new.assigned_to;
 
SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       old.lead_id,
       'ACCOUNT_UPDATE' AS activity_type,
       "L" AS activity_doc_type,
       old.lead_id AS activity_doc_pk_id,       
       CONCAT(
		IF(IFNULL(old.lead_status_type_id, '') <> IFNULL(new.lead_status_type_id, ''), CONCAT(' lead_status_type was modified from ', IFNULL(v_lead_status_type_old, ''),' to ', IFNULL(v_lead_status_type_new, ''), ';'),''),
		IF(IFNULL(old.template_type_id, '') <> IFNULL(new.template_type_id, ''), CONCAT(' template_type was modified from ', IFNULL(v_template_type_old, ''),' to ', IFNULL(v_template_type_new, ''), ';'),''),
		IF(IFNULL(old.senior_manager_id, '') <> IFNULL(new.senior_manager_id, ''), CONCAT(' senior_manager_id was modified from ', IFNULL(v_senior_manager_id_old, ''),' to ', IFNULL(v_senior_manager_id_new, ''), ';'),''),
		IF(IFNULL(old.team_manager_id, '') <> IFNULL(new.team_manager_id, ''), CONCAT(' team_manager_id was modified from ', IFNULL(v_team_manager_id_old, ''),' to ', IFNULL(v_team_manager_id_new, ''), ';'),''),
		IF(IFNULL(old.assigned_by, '') <> IFNULL(new.assigned_by, ''), CONCAT(' assigned_by was modified from ', IFNULL(v_assigned_by_old, ''),' to ', IFNULL(v_assigned_by_new, ''), ';'),''),
		IF(IFNULL(old.assigned_dtm, '') <> IFNULL(new.assigned_dtm, ''), CONCAT(' assigned_dtm was modified from ', IFNULL(old.assigned_dtm, ''),' to ', IFNULL(new.assigned_dtm, ''), ';'),''),
		IF(IFNULL(old.assigned_to, '') <> IFNULL(new.assigned_to, ''), CONCAT(' assigned_to was modified from ', IFNULL(v_assigned_to_old, ''),' to ', IFNULL(v_assigned_to_new, ''), ';'),''),
		IF(IFNULL(old.target_dtm, '') <> IFNULL(new.target_dtm, ''), CONCAT(' target_dtm was modified from ', IFNULL(old.target_dtm, ''),' to ', IFNULL(new.target_dtm, ''), ';'),''),
		IF(IFNULL(old.account_number, '') <> IFNULL(new.account_number, ''), CONCAT(' account_number was modified from ', IFNULL(old.account_number, ''),' to ', IFNULL(new.account_number, ''), ';'),''),
		IF(IFNULL(old.product_type, '') <> IFNULL(new.product_type, ''), CONCAT(' product_type was modified from ', IFNULL(old.product_type, ''),' to ', IFNULL(new.product_type, ''), ';'),''),
		IF(IFNULL(old.product_account_number, '') <> IFNULL(new.product_account_number, ''), CONCAT(' product_account_number was modified from ', IFNULL(old.product_account_number, ''),' to ', IFNULL(new.product_account_number, ''), ';'),''),
		IF(IFNULL(old.agreement_id, '') <> IFNULL(new.agreement_id, ''), CONCAT(' agreement_id was modified from ', IFNULL(old.agreement_id, ''),' to ', IFNULL(new.agreement_id, ''), ';'),''),
		IF(IFNULL(old.business_name, '') <> IFNULL(new.business_name, ''), CONCAT(' business_name was modified from ', IFNULL(old.business_name, ''),' to ', IFNULL(new.business_name, ''), ';'),''),
		IF(IFNULL(old.customer_name, '') <> IFNULL(new.customer_name, ''), CONCAT(' customer_name was modified from ', IFNULL(old.customer_name, ''),' to ', IFNULL(new.customer_name, ''), ';'),''),
		IF(IFNULL(old.allocation_status, '') <> IFNULL(new.allocation_status, ''), CONCAT(' allocation_status was modified from ', IFNULL(old.allocation_status, ''),' to ', IFNULL(new.allocation_status, ''), ';'),''),
		IF(IFNULL(old.customer_id, '') <> IFNULL(new.customer_id, ''), CONCAT(' customer_id was modified from ', IFNULL(old.customer_id, ''),' to ', IFNULL(new.customer_id, ''), ';'),''),
		IF(IFNULL(old.passport_number, '') <> IFNULL(new.passport_number, ''), CONCAT(' passport_number was modified from ', IFNULL(old.passport_number, ''),' to ', IFNULL(new.passport_number, ''), ';'),''),
		IF(IFNULL(old.date_of_birth, '') <> IFNULL(new.date_of_birth, ''), CONCAT(' date_of_birth was modified from ', IFNULL(old.date_of_birth, ''),' to ', IFNULL(new.date_of_birth, ''), ';'),''),
		IF(IFNULL(old.bucket_status, '') <> IFNULL(new.bucket_status, ''), CONCAT(' bucket_status was modified from ', IFNULL(old.bucket_status, ''),' to ', IFNULL(new.bucket_status, ''), ';'),''),
		IF(IFNULL(old.vintage, '') <> IFNULL(new.vintage, ''), CONCAT(' vintage was modified from ', IFNULL(old.vintage, ''),' to ', IFNULL(new.vintage, ''), ';'),''),
		IF(IFNULL(old.date_of_woff, '') <> IFNULL(new.date_of_woff, ''), CONCAT(' date_of_woff was modified from ', IFNULL(old.date_of_woff, ''),' to ', IFNULL(new.date_of_woff, ''), ';'),''),
		IF(IFNULL(old.nationality, '') <> IFNULL(new.nationality, ''), CONCAT(' nationality was modified from ', IFNULL(old.nationality, ''),' to ', IFNULL(new.nationality, ''), ';'),''),
		IF(IFNULL(old.emirates_id_number, '') <> IFNULL(new.emirates_id_number, ''), CONCAT(' emirates_id_number was modified from ', IFNULL(old.emirates_id_number, ''),' to ', IFNULL(new.emirates_id_number, ''), ';'),''),
		-- IF(old.credit_limit<>new.credit_limit, CONCAT(' credit_limit was modified from ', IFNULL(old.credit_limit, ''),' to ', IFNULL(new.credit_limit, ''), ';'),''),
		-- IF(old.total_outstanding_amount<>new.total_outstanding_amount, CONCAT(' total_outstanding_amount was modified from ', IFNULL(old.total_outstanding_amount, ''),' to ', IFNULL(new.total_outstanding_amount, ''), ';'),''),
		-- IF(old.principal_outstanding_amount<>new.principal_outstanding_amount, CONCAT(' principal_outstanding_amount was modified from ', IFNULL(old.principal_outstanding_amount, ''),' to ', IFNULL(new.principal_outstanding_amount, ''), ';'),''),
		IF(IFNULL(old.employer_details, '') <> IFNULL(new.employer_details, ''), CONCAT(' employer_details was modified from ', IFNULL(old.employer_details, ''),' to ', IFNULL(new.employer_details, ''), ';'),''),
		IF(IFNULL(old.designation, '') <> IFNULL(new.designation, ''), CONCAT(' designation was modified from ', IFNULL(old.designation, ''),' to ', IFNULL(new.designation, ''), ';'),''),
		IF(IFNULL(old.company_contact, '') <> IFNULL(new.company_contact, ''), CONCAT(' company_contact was modified from ', IFNULL(old.company_contact, ''),' to ', IFNULL(new.company_contact, ''), ';'),''),
		-- IF(old.home_country_number<>new.home_country_number, CONCAT(' home_country_number was modified from ', IFNULL(old.home_country_number, ''),' to ', IFNULL(new.home_country_number, ''), ';'),''),
		-- IF(old.mobile_number<>new.mobile_number, CONCAT(' mobile_number was modified from ', IFNULL(old.mobile_number, ''),' to ', IFNULL(new.mobile_number, ''), ';'),''),
		-- IF(old.email_id<>new.email_id, CONCAT(' email_id was modified from ', IFNULL(old.email_id, ''),' to ', IFNULL(new.email_id, ''), ';'),''),
		-- IF(old.minimum_payment<>new.minimum_payment, CONCAT(' minimum_payment was modified from ', IFNULL(old.minimum_payment, ''),' to ', IFNULL(new.minimum_payment, ''), ';'),''),
		-- IF(old.ghrc_offer_1<>new.ghrc_offer_1, CONCAT(' ghrc_offer_1 was modified from ', IFNULL(old.ghrc_offer_1, ''),' to ', IFNULL(new.ghrc_offer_1, ''), ';'),''),
		-- IF(old.ghrc_offer_2<>new.ghrc_offer_2, CONCAT(' ghrc_offer_2 was modified from ', IFNULL(old.ghrc_offer_2, ''),' to ', IFNULL(new.ghrc_offer_2, ''), ';'),''),
		-- IF(old.ghrc_offer_3<>new.ghrc_offer_3, CONCAT(' ghrc_offer_3 was modified from ', IFNULL(old.ghrc_offer_3, ''),' to ', IFNULL(new.ghrc_offer_3, ''), ';'),''),
		IF(IFNULL(old.withdraw_date, '') <> IFNULL(new.withdraw_date, ''), CONCAT(' withdraw_date was modified from ', IFNULL(old.withdraw_date, ''),' to ', IFNULL(new.withdraw_date, ''), ';'),''),
		-- IF(old.home_country_address<>new.home_country_address, CONCAT(' home_country_address was modified from ', IFNULL(old.home_country_address, ''),' to ', IFNULL(new.home_country_address, ''), ';'),''),
		-- IF(old.city<>new.city, CONCAT(' city was modified from ', IFNULL(old.city, ''),' to ', IFNULL(new.city, ''), ';'),''),
		-- IF(old.pincode<>new.pincode, CONCAT(' pincode was modified from ', IFNULL(old.pincode, ''),' to ', IFNULL(new.pincode, ''), ';'),''),
		-- IF(old.state<>new.state, CONCAT(' state was modified from ', IFNULL(old.state, ''),' to ', IFNULL(new.state, ''), ';'),''),
		IF(IFNULL(old.father_name, '') <> IFNULL(new.father_name, ''), CONCAT(' father_name was modified from ', IFNULL(old.father_name, ''),' to ', IFNULL(new.father_name, ''), ';'),''),
		IF(IFNULL(old.mother_name, '') <> IFNULL(new.mother_name, ''), CONCAT(' mother_name was modified from ', IFNULL(old.mother_name, ''),' to ', IFNULL(new.mother_name, ''), ';'),''),
		IF(IFNULL(old.spouse_name, '') <> IFNULL(new.spouse_name, ''), CONCAT(' spouse_name was modified from ', IFNULL(old.spouse_name, ''),' to ', IFNULL(new.spouse_name, ''), ';'),''),
		-- IF(old.last_paid_amount<>new.last_paid_amount, CONCAT(' last_paid_amount was modified from ', IFNULL(old.last_paid_amount, ''),' to ', IFNULL(new.last_paid_amount, ''), ';'),''),
		-- IF(old.last_paid_date<>new.last_paid_date, CONCAT(' last_paid_date was modified from ', IFNULL(old.last_paid_date, ''),' to ', IFNULL(new.last_paid_date, ''), ';'),''),
		IF(IFNULL(old.pli_status, '') <> IFNULL(new.pli_status, ''), CONCAT(' pli_status was modified from ', IFNULL(old.pli_status, ''),' to ', IFNULL(new.pli_status, ''), ';'),''),
		IF(IFNULL(old.execution_status, '') <> IFNULL(new.execution_status, ''), CONCAT(' execution_status was modified from ', IFNULL(old.execution_status, ''),' to ', IFNULL(new.execution_status, ''), ';'),''),
		IF(IFNULL(old.banker_name, '') <> IFNULL(new.banker_name, ''), CONCAT(' banker_name was modified from ', IFNULL(old.banker_name, ''),' to ', IFNULL(new.banker_name, ''), ';'),''),
		-- IF(old.visa_status<>new.visa_status, CONCAT(' visa_status was modified from ', IFNULL(old.visa_status, ''),' to ', IFNULL(new.visa_status, ''), ';'),''),
		-- IF(old.mol_status<>new.mol_status, CONCAT(' mol_status was modified from ', IFNULL(old.mol_status, ''),' to ', IFNULL(new.mol_status, ''), ';'),''),
		IF(IFNULL(old.is_visit_required, '') <> IFNULL(new.is_visit_required, ''), CONCAT(' is_visit_required was modified from ', IFNULL(old.is_visit_required, ''),' to ', IFNULL(new.is_visit_required, ''), ';'),''),
		IF(IFNULL(old.settlement_status, '') <> IFNULL(new.settlement_status, ''), CONCAT(' settlement_status was modified from ', IFNULL(old.settlement_status, ''),' to ', IFNULL(new.settlement_status, ''), ';'),''),
		IF(IFNULL(old.allocation_type, '') <> IFNULL(new.allocation_type, ''), CONCAT(' allocation_type was modified from ', IFNULL(old.allocation_type, ''),' to ', IFNULL(new.allocation_type, ''), ';'),''),
		IF(IFNULL(old.is_uploaded_record, '') <> IFNULL(new.is_uploaded_record, ''), CONCAT(' is_uploaded_record was modified from ', IFNULL(old.is_uploaded_record, ''),' to ', IFNULL(new.is_uploaded_record, ''), ';'),''),
		-- New columns added 15-Jan-2025
		IF(IFNULL(old.fresh_stab, '') <> IFNULL(new.fresh_stab, ''), CONCAT(' fresh_stab was modified from ', IFNULL(old.fresh_stab, ''),' to ', IFNULL(new.fresh_stab, ''), ';'),''),
		IF(IFNULL(old.cycle_statement, '') <> IFNULL(new.cycle_statement, ''), CONCAT(' cycle_statement was modified from ', IFNULL(old.cycle_statement, ''),' to ', IFNULL(new.cycle_statement, ''), ';'),''),
		IF(IFNULL(old.card_auth, '') <> IFNULL(new.card_auth, ''), CONCAT(' card_auth was modified from ', IFNULL(old.card_auth, ''),' to ', IFNULL(new.card_auth, ''), ';'),''),
		IF(IFNULL(old.dpd_r, '') <> IFNULL(new.dpd_r, ''), CONCAT(' dpd_r was modified from ', IFNULL(old.dpd_r, ''),' to ', IFNULL(new.dpd_r, ''), ';'),''),
		IF(IFNULL(old.mindue_manual, '') <> IFNULL(new.mindue_manual, ''), CONCAT(' mindue_manual was modified from ', IFNULL(old.mindue_manual, ''),' to ', IFNULL(new.mindue_manual, ''), ';'),''),
		IF(IFNULL(old.rb_amount, '') <> IFNULL(new.rb_amount, ''), CONCAT(' rb_amount was modified from ', IFNULL(old.rb_amount, ''),' to ', IFNULL(new.rb_amount, ''), ';'),''),
		IF(IFNULL(old.overdue_amount, '') <> IFNULL(new.overdue_amount, ''), CONCAT(' overdue_amount was modified from ', IFNULL(old.overdue_amount, ''),' to ', IFNULL(new.overdue_amount, ''), ';'),''),
		IF(IFNULL(old.due_since_date, '') <> IFNULL(new.due_since_date, ''), CONCAT(' due_since_date was modified from ', IFNULL(old.due_since_date, ''),' to ', IFNULL(new.due_since_date, ''), ';'),''),
		IF(IFNULL(old.monthly_income, '') <> IFNULL(new.monthly_income, ''), CONCAT(' monthly_income was modified from ', IFNULL(old.monthly_income, ''),' to ', IFNULL(new.monthly_income, ''), ';'),''),
		IF(IFNULL(old.office_address, '') <> IFNULL(new.office_address, ''), CONCAT(' office_address was modified from ', IFNULL(old.office_address, ''),' to ', IFNULL(new.office_address, ''), ';'),''),
		IF(IFNULL(old.friend_residence_phone, '') <> IFNULL(new.friend_residence_phone, ''), CONCAT(' friend_residence_phone was modified from ', IFNULL(old.friend_residence_phone, ''),' to ', IFNULL(new.friend_residence_phone, ''), ';'),''),
		IF(IFNULL(old.last_month_paid_unpaid, '') <> IFNULL(new.last_month_paid_unpaid, ''), CONCAT(' last_month_paid_unpaid was modified from ', IFNULL(old.last_month_paid_unpaid, ''),' to ', IFNULL(new.last_month_paid_unpaid, ''), ';'),''),
		IF(IFNULL(old.last_usage_date, '') <> IFNULL(new.last_usage_date, ''), CONCAT(' last_usage_date was modified from ', IFNULL(old.last_usage_date, ''),' to ', IFNULL(new.last_usage_date, ''), ';'),''),
		IF(IFNULL(old.dpd_string, '') <> IFNULL(new.dpd_string, ''), CONCAT(' dpd_string was modified from ', IFNULL(old.dpd_string, ''),' to ', IFNULL(new.dpd_string, ''), ';'),''),
		IF(IFNULL(old.dcore_id, '') <> IFNULL(new.dcore_id, ''), CONCAT(' dcore_id was modified from ', IFNULL(old.dcore_id, ''),' to ', IFNULL(new.dcore_id, ''), ';'),''),
		-- End new columns
		IF(IFNULL(old.status, '') <> IFNULL(new.status, ''), CONCAT(' status was modified from ', IFNULL(old.status, ''),' to ', IFNULL(new.status, ''), ';'),'')
       ) AS activity_detail,
       CURRENT_TIMESTAMP AS activity_dtm 
  INTO v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,       
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm
  FROM DUAL;

-- Lead updates should NOT mark accounts as touched
-- Only disposition field changes on tasks should mark as touched
CALL crm.create_activity_log (@err,
       v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       v_lead_status_type_new,
       0, -- new.is_uploaded_record,   
       0, -- v_is_touched - Always 0 for lead updates
       @osuid);


INSERT INTO crm.leads_audit(  	
       leads_audit_id,
       leads_audit_dtm,
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
     --   credit_limit,
     --   total_outstanding_amount,
     --   principal_outstanding_amount,
       employer_details,
       designation,
       company_contact,
     --   home_country_number,
     --   mobile_number,
     --   email_id,
     --   minimum_payment,
     --   ghrc_offer_1,
     --   ghrc_offer_2,
     --   ghrc_offer_3,
       withdraw_date,
     --   home_country_address,
     --   city,
     --   pincode,
     --   state,
       father_name,
       mother_name,
       spouse_name,
     --   last_paid_amount,
     --   last_paid_date,
       pli_status,
       execution_status,
       banker_name,
      -- visa_status,
      -- mol_status,
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
       CURRENT_TIMESTAMP,
       old.lead_id,
       old.company_id,
       old.lead_status_type_id,
       old.template_type_id,
       old.senior_manager_id,
       old.team_manager_id,
       old.assigned_by,
       old.assigned_dtm,
       old.assigned_to,
       old.target_dtm,
       old.account_number,
       old.product_type,
       old.product_account_number,
       old.agreement_id,
       old.business_name,
       old.customer_name,
       old.allocation_status,
       old.customer_id,
       old.passport_number,
       old.date_of_birth,
       old.bucket_status,
       old.vintage,
       old.date_of_woff,
       old.nationality,
       old.emirates_id_number,
     --   old.credit_limit,
     --   old.total_outstanding_amount,
     --   old.principal_outstanding_amount,
       old.employer_details,
       old.designation,
       old.company_contact,
     --   old.home_country_number,
     --   old.mobile_number,
     --   old.email_id,
     --   old.minimum_payment,
     --   old.ghrc_offer_1,
     --   old.ghrc_offer_2,
     --   old.ghrc_offer_3,
       old.withdraw_date,
     --   old.home_country_address,
     --   old.city,
     --   old.pincode,
     --   old.state,
       old.father_name,
       old.mother_name,
       old.spouse_name,
     --   old.last_paid_amount,
     --   old.last_paid_date,
       old.pli_status,
       old.execution_status,
       old.banker_name,
      -- old.visa_status,
      -- old.mol_status,
       old.is_visit_required,
       old.settlement_status,
       old.allocation_type,
       old.is_uploaded_record,
       -- New columns added 15-Jan-2025
       old.fresh_stab,
       old.cycle_statement,
       old.card_auth,
       old.dpd_r,
       old.mindue_manual,
       old.rb_amount,
       old.overdue_amount,
       old.due_since_date,
       old.monthly_income,
       old.office_address,
       old.friend_residence_phone,
       old.last_month_paid_unpaid,
       old.last_usage_date,
       old.dpd_string,
       old.dcore_id,
       -- End new columns
       old.status,
       old.created_id,
       old.created_dtm,
       old.modified_id,
       old.modified_dtm
);

-- Create User Notif When assigned_by Changes
IF (old.assigned_by<>new.assigned_by) THEN 

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "ACCOUNTS_ASSIGNED_BY_REASSIGN";
   
-- Send one notif to old assigned_by 
   CALL user.create_user_notification(@err,
                                       old.assigned_by, -- Notif recipient Old assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Account Unassigned',
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
                                       new.assigned_by, -- Notif recipient New Assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Account Assigned',
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
IF (old.assigned_to<>new.assigned_to) THEN 

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "ACCOUNTS_ASSIGNED_TO_REASSIGN";
   
-- Send one notif to old assigned_to 
   CALL user.create_user_notification(@err,
                                       old.assigned_to, -- Notif recipient Old assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Account Unassigned',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to new assigned_to
   CALL user.create_user_notification(@err,
                                       new.assigned_to, -- Notif recipient New Assignee
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'Account Assigned',
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

DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_ai_lead$$

CREATE TRIGGER crm.t_ai_lead AFTER INSERT on crm.leads
FOR EACH ROW BEGIN 

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_lead_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_type CHAR(1) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

DECLARE v_lead_status_type_new VARCHAR(100);
DECLARE v_template_type_new VARCHAR(100);
DECLARE v_senior_manager_id_new VARCHAR(500);
DECLARE v_team_manager_id_new VARCHAR(500);
DECLARE v_assigned_by_new VARCHAR(500);
DECLARE v_assigned_to_new VARCHAR(500);

DECLARE v_is_touched TINYINT DEFAULT 0;

SELECT lead_status_type_name
  INTO v_lead_status_type_new
  FROM crm.lead_status_type
 WHERE lead_status_type_id = new.lead_status_type_id;

SELECT template_name
  INTO v_template_type_new
  FROM crm.template_type
 WHERE template_type_id = new.template_type_id;

SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_senior_manager_id_new
  FROM user.user u
 WHERE user_id = new.senior_manager_id;

SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_team_manager_id_new
  FROM user.user u
 WHERE user_id = new.team_manager_id;

SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_by_new
  FROM user.user u
 WHERE user_id = new.assigned_by;
 
SELECT CONCAT(u.first_name, " ", u.last_name)
  INTO v_assigned_to_new
  FROM user.user u
 WHERE user_id = new.assigned_to;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       new.lead_id,
       "NEW_ACCOUNT" AS activity_type,
       "L" AS activity_doc_type,
       new.lead_id AS activity_doc_pk_id,
       CONCAT(
        CONCAT(' lead_status_type was created as ', IFNULL(v_lead_status_type_new, ''), ';'),
		CONCAT(' template_type was created as ', IFNULL(v_template_type_new, ''), ';'),
		CONCAT(' senior_manager_id was ', IFNULL(v_senior_manager_id_new, ''), ';'),
		CONCAT(' team_manager_id was ', IFNULL(v_team_manager_id_new, ''), ';'),
		CONCAT(' assigned_by was ', IFNULL(v_assigned_by_new, ''), ';'),
		CONCAT(' assigned_dtm was created as ', IFNULL(new.assigned_dtm, ''), ';'),
		CONCAT(' assigned_to was ', IFNULL(v_assigned_to_new, ''), ';'),
		CONCAT(' target_dtm was created as ', IFNULL(new.target_dtm, ''), ';'),
		CONCAT(' agreement_id was created as ', IFNULL(new.agreement_id, ''), ';'),
		CONCAT(' business_name was created as ', IFNULL(new.business_name, ''), ';'),
		CONCAT(' customer_name was created as ', IFNULL(new.customer_name, ''), ';'),
		CONCAT(' allocation_status was created as ', IFNULL(new.allocation_status, ''), ';'),
		CONCAT(' customer_id was created as ', IFNULL(new.customer_id, ''), ';'),
		CONCAT(' passport_number was created as ', IFNULL(new.passport_number, ''), ';'),
		CONCAT(' date_of_birth was created as ', IFNULL(new.date_of_birth, ''), ';'),
		CONCAT(' bucket_status was created as ', IFNULL(new.bucket_status, ''), ';'),
		CONCAT(' vintage was created as ', IFNULL(new.vintage, ''), ';'),
		CONCAT(' date_of_woff was created as ', IFNULL(new.date_of_woff, ''), ';'),
		CONCAT(' nationality was created as ', IFNULL(new.nationality, ''), ';'),
		CONCAT(' emirates_id_number was created as ', IFNULL(new.emirates_id_number, ''), ';'),
		-- CONCAT(' credit_limit was created as ', IFNULL(new.credit_limit, ''), ';'),
		-- CONCAT(' total_outstanding_amount was created as ', IFNULL(new.total_outstanding_amount, ''), ';'),
		-- CONCAT(' principal_outstanding_amount was created as ', IFNULL(new.principal_outstanding_amount, ''), ';'),
		CONCAT(' employer_details was created as ', IFNULL(new.employer_details, ''), ';'),
		CONCAT(' designation was created as ', IFNULL(new.designation, ''), ';'),
		CONCAT(' company_contact was created as ', IFNULL(new.company_contact, ''), ';'),
		-- CONCAT(' home_country_number was created as ', IFNULL(new.home_country_number, ''), ';'),
		-- CONCAT(' mobile_number was created as ', IFNULL(new.mobile_number, ''), ';'),
		-- CONCAT(' email_id was created as ', IFNULL(new.email_id, ''), ';'),
		-- CONCAT(' minimum_payment was created as ', IFNULL(new.minimum_payment, ''), ';'),
		-- CONCAT(' ghrc_offer_1 was created as ', IFNULL(new.ghrc_offer_1, ''), ';'),
		-- CONCAT(' ghrc_offer_2 was created as ', IFNULL(new.ghrc_offer_2, ''), ';'),
		-- CONCAT(' ghrc_offer_3 was created as ', IFNULL(new.ghrc_offer_3, ''), ';'),
		CONCAT(' withdraw_date was created as ', IFNULL(new.withdraw_date, ''), ';'),
		-- CONCAT(' home_country_address was created as ', IFNULL(new.home_country_address, ''), ';'),
		-- CONCAT(' city was created as ', IFNULL(new.city, ''), ';'),
		-- CONCAT(' pincode was created as ', IFNULL(new.pincode, ''), ';'),
		-- CONCAT(' state was created as ', IFNULL(new.state, ''), ';'),
		CONCAT(' father_name was created as ', IFNULL(new.father_name, ''), ';'),
		CONCAT(' mother_name was created as ', IFNULL(new.mother_name, ''), ';'),
		CONCAT(' spouse_name was created as ', IFNULL(new.spouse_name, ''), ';'),
		-- CONCAT(' last_paid_amount was created as ', IFNULL(new.last_paid_amount, ''), ';'),
		-- CONCAT(' last_paid_date was created as ', IFNULL(new.last_paid_date, ''), ';'),
		CONCAT(' pli_status was created as ', IFNULL(new.pli_status, ''), ';'),
		CONCAT(' execution_status was created as ', IFNULL(new.execution_status, ''), ';'),
		CONCAT(' banker_name was created as ', IFNULL(new.banker_name, ''), ';'),
		-- CONCAT(' visa_status was created as ', IFNULL(new.visa_status, ''), ';'),
		-- CONCAT(' mol_status was created as ', IFNULL(new.mol_status, ''), ';'),
		CONCAT(' is_visit_required was created as ', IFNULL(new.is_visit_required, ''), ';'),
		CONCAT(' settlement_status was created as ', IFNULL(new.settlement_status, ''), ';'),
		CONCAT(' allocation_type was created as ', IFNULL(new.allocation_type, ''), ';'),
        CONCAT(' is uploaded record was created as ', IFNULL(new.is_uploaded_record, ''), ';'),
		-- New columns added 15-Jan-2025
		CONCAT(' fresh_stab was created as ', IFNULL(new.fresh_stab, ''), ';'),
		CONCAT(' cycle_statement was created as ', IFNULL(new.cycle_statement, ''), ';'),
		CONCAT(' card_auth was created as ', IFNULL(new.card_auth, ''), ';'),
		CONCAT(' dpd_r was created as ', IFNULL(new.dpd_r, ''), ';'),
		CONCAT(' mindue_manual was created as ', IFNULL(new.mindue_manual, ''), ';'),
		CONCAT(' rb_amount was created as ', IFNULL(new.rb_amount, ''), ';'),
		CONCAT(' overdue_amount was created as ', IFNULL(new.overdue_amount, ''), ';'),
		CONCAT(' due_since_date was created as ', IFNULL(new.due_since_date, ''), ';'),
		CONCAT(' monthly_income was created as ', IFNULL(new.monthly_income, ''), ';'),
		CONCAT(' office_address was created as ', IFNULL(new.office_address, ''), ';'),
		CONCAT(' friend_residence_phone was created as ', IFNULL(new.friend_residence_phone, ''), ';'),
		CONCAT(' last_month_paid_unpaid was created as ', IFNULL(new.last_month_paid_unpaid, ''), ';'),
		CONCAT(' last_usage_date was created as ', IFNULL(new.last_usage_date, ''), ';'),
		CONCAT(' dpd_string was created as ', IFNULL(new.dpd_string, ''), ';'),
		CONCAT(' dcore_id was created as ', IFNULL(new.dcore_id, ''), ';'),
		-- End new columns
		CONCAT(' status was created as ', IFNULL(new.status, ''), ';')        
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
       1, -- new.is_uploaded_record,
	   v_is_touched,
       @osuid);


END;
$$

DELIMITER ;

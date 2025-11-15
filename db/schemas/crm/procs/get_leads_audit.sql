-- call crm.get_leads_audit (@err,NULL,NULL); 
-- call crm.get_leads_audit (@err,2,1); 

DROP PROCEDURE IF EXISTS crm.get_leads_audit;

DELIMITER $$
CREATE PROCEDURE crm.get_leads_audit (OUT error_code INT, 
                                IN in_app_user_id BIGINT,
                                IN in_lead_id BIGINT
                                              )
                                              
BEGIN
SET error_code = -2;

SET @get_q = '
SELECT l.leads_audit_id,
       l.leads_audit_dtm,
       l.lead_id,
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
       l.credit_limit,
       l.total_outstanding_amount,
       l.principal_outstanding_amount,
       l.employer_details,
       l.designation,
       l.company_contact,
       l.home_country_number,
       l.mobile_number,
       l.email_id,
       l.minimum_payment,
       l.ghrc_offer_1,
       l.ghrc_offer_2,
       l.ghrc_offer_3,
       l.withdraw_date,
       l.home_country_address,
       l.city,
       l.pincode,
       l.state,
       l.father_name,
       l.mother_name,
       l.spouse_name,
       l.last_paid_amount,
       l.last_paid_date,
       l.pli_status,
       l.execution_status,
       l.banker_name,
      -- l.visa_status,
      -- l.mol_status,
       l.is_visit_required,
       l.settlement_status,
       l.status,
       l.created_id,
       l.created_dtm,
       l.modified_id,
       l.modified_dtm
  FROM crm.leads_audit l
  JOIN crm.lead_status_type lst
    ON l.lead_status_type_id = lst.lead_status_type_id
  JOIN org.company comp
    ON l.company_id = comp.company_id
  JOIN user.user u2 -- For assigned by info
    ON l.assigned_by = u2.user_id
  JOIN user.user u3 -- For assigned to info
    ON l.assigned_to = u3.user_id  
      
 WHERE l.status = 1 ';

IF in_lead_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND l.lead_id = ', in_lead_id);
END IF; 


-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET error_code=0;

END$$
DELIMITER ;

-- CALL crm.generate_daily_reports(@err, 14,3,null)
DROP PROCEDURE IF EXISTS `crm`.generate_daily_reports;

DELIMITER $$ 
CREATE PROCEDURE crm.generate_daily_reports(
    OUT error_code INT,
    IN in_agent_id BIGINT,
    IN in_company_id BIGINT,
    IN in_date TIMESTAMP
) 
BEGIN
SET
       error_code = -2;

SELECT
    CURRENT_DATE,
    l.senior_manager_id AS senior_manager_id,
    u1.email_address AS senior_manager_email,
    l.team_manager_id AS manager_id,
    u2.email_address AS team_manager_email,
    l.assigned_by AS team_leader_id,
    u3.email_address AS assigned_by_email,
    l.assigned_to AS agent_id,
    u4.email_address AS assigned_to_email,
    l.agreement_id AS agreement_no,
    l.customer_id AS cust_id,
    l.customer_id AS relationship_no,
    l.product_type AS product,
    l.customer_name AS customer_name,
    p.total_outstanding_amount AS outstanding,
    "Naukri India" AS naukri_india,
    "Naukri Gulf" AS naukri_gulf,
    "Facebook" AS facebook,
    "LinkedIn" AS linkedin,
    "Google" AS google,
    vc.visa_status AS visa_status,
    mc.mol_status AS mol_status,
    n.note AS feedback,
    n.note AS field_feedback,
    dc.disposition_code_id AS disposition_code
    -- t.Contactable_non_contactable,
    -- l.Admin_id
FROM
    crm.leads l
    LEFT JOIN crm.leads_payment_ledger p ON l.lead_id = p.lead_id 
    -- LEFT JOIN crm.web_tracing_details w ON l.lead_id = w.lead_id
    LEFT JOIN crm.visa_check vc ON l.lead_id = vc.lead_id
    LEFT JOIN crm.mol_check mc ON l.lead_id = mc.lead_id
    LEFT JOIN crm.task t ON l.lead_id = t.lead_id
    LEFT JOIN crm.notes n ON t.task_id = n.task_id
    LEFT JOIN crm.disposition_code dc ON t.disposition_code_id = dc.disposition_code_id
    LEFT JOIN 
        user.user u1 ON l.senior_manager_id = u1.user_id
    LEFT JOIN 
        user.user u2 ON l.team_manager_id = u2.user_id
    LEFT JOIN 
        user.user u3 ON l.assigned_by = u3.user_id    
    LEFT JOIN 
        user.user u4 ON l.assigned_to = u4.user_id    
WHERE
    l.assigned_to = in_agent_id
    AND l.company_id = in_company_id;
    -- AND CAST(Date AS DATE) = in_date;
SET
    error_code = 0;

END $$ 
DELIMITER ;
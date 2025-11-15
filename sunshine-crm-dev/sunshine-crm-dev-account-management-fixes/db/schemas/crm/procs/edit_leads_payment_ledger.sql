--  call `crm`.edit_leads_payment_ledger(@err,181,2,1,1,1,1,1,CURRENT_TIMESTAMP,2,CURRENT_TIMESTAMP,1,"www.newdoc.com",1);
--  call `crm`.edit_leads_payment_ledger(@err,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
DROP PROCEDURE IF EXISTS crm.edit_leads_payment_ledger;

DELIMITER $$ 
CREATE PROCEDURE crm.edit_leads_payment_ledger (
    OUT error_code INT,
    IN in_lead_payment_ledger_id BIGINT,
    IN in_app_user_id BIGINT,
    IN in_lead_id BIGINT,
    IN in_task_id BIGINT,
    IN in_last_paid_amount FLOAT,
    IN in_last_paid_date DATE,
    IN in_credit_limit FLOAT,
    IN in_principal_outstanding_amount FLOAT,
    IN in_total_outstanding_amount FLOAT,
    IN in_minimum_payment VARCHAR(100),
    IN in_ghrc_offer_1 VARCHAR(100),
    IN in_ghrc_offer_2 VARCHAR(100),
    IN in_ghrc_offer_3 VARCHAR(100),
    -- New payment-related columns added 15-Jan-2025
    IN in_fresh_stab VARCHAR(100),
    IN in_cycle_statement VARCHAR(100),
    IN in_card_auth VARCHAR(100),
    IN in_dpd_r VARCHAR(100),
    IN in_mindue_manual VARCHAR(100),
    IN in_rb_amount VARCHAR(100),
    IN in_overdue_amount VARCHAR(100),
    IN in_due_since_date VARCHAR(100),
    IN in_last_month_paid_unpaid VARCHAR(100),
    IN in_last_usage_date VARCHAR(100),
    IN in_dpd_string VARCHAR(100),
    IN in_status TINYINT
) 
BEGIN
SET
    error_code = -2;

UPDATE
    crm.leads_payment_ledger
SET
    lead_payment_ledger_id = IFNULL(in_lead_payment_ledger_id, lead_payment_ledger_id),
    lead_id = IFNULL(in_lead_id, lead_id),
    task_id = IFNULL(in_task_id, task_id),
    last_paid_amount = IFNULL(in_last_paid_amount, last_paid_amount),
    last_paid_date = IFNULL(in_last_paid_date, last_paid_date),
    credit_limit = IFNULL(in_credit_limit, credit_limit),
    principal_outstanding_amount = IFNULL(in_principal_outstanding_amount, principal_outstanding_amount),
    total_outstanding_amount = IFNULL(in_total_outstanding_amount, total_outstanding_amount),
    minimum_payment = IFNULL(in_minimum_payment, minimum_payment),
    ghrc_offer_1 = IFNULL(in_ghrc_offer_1, ghrc_offer_1),
    ghrc_offer_2 = IFNULL(in_ghrc_offer_2, ghrc_offer_2),
    ghrc_offer_3 = IFNULL(in_ghrc_offer_3, ghrc_offer_3),
    -- New payment-related columns added 15-Jan-2025
    fresh_stab = IFNULL(in_fresh_stab, fresh_stab),
    cycle_statement = IFNULL(in_cycle_statement, cycle_statement),
    card_auth = IFNULL(in_card_auth, card_auth),
    dpd_r = IFNULL(in_dpd_r, dpd_r),
    mindue_manual = IFNULL(in_mindue_manual, mindue_manual),
    rb_amount = IFNULL(in_rb_amount, rb_amount),
    overdue_amount = IFNULL(in_overdue_amount, overdue_amount),
    due_since_date = IFNULL(in_due_since_date, due_since_date),
    last_month_paid_unpaid = IFNULL(in_last_month_paid_unpaid, last_month_paid_unpaid),
    last_usage_date = IFNULL(in_last_usage_date, last_usage_date),
    dpd_string = IFNULL(in_dpd_string, dpd_string),
    status = IFNULL(in_status, status),
    modified_id = IFNULL(in_app_user_id, modified_id)
WHERE
    lead_payment_ledger_id = in_lead_payment_ledger_id;

SET
    error_code = 0;

END $$ 
DELIMITER ;
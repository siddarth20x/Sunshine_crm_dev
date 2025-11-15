-- call `crm`.create_leads_payment_ledger(@err,3,1,1,CURRENT_TIMESTAMP,5,1,6,1,7,7,7,@olplid);
DROP PROCEDURE IF EXISTS `crm`.create_leads_payment_ledger;

DELIMITER $$ 
CREATE PROCEDURE `crm`.create_leads_payment_ledger(
       OUT error_code INT,
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
       -- End new columns
       OUT out_lead_payment_ledger_id BIGINT
) 
BEGIN
DECLARE v_existing_payment_ledger_id BIGINT DEFAULT NULL;

SET error_code = -2;

-- Check if a payment ledger already exists for this lead and task
SELECT lead_payment_ledger_id INTO v_existing_payment_ledger_id
FROM crm.leads_payment_ledger
WHERE lead_id = in_lead_id
  AND (task_id = in_task_id OR (task_id IS NULL AND in_task_id IS NULL))
LIMIT 1;

-- If payment ledger exists, UPDATE it
IF v_existing_payment_ledger_id IS NOT NULL THEN
  UPDATE `crm`.leads_payment_ledger
  SET
    last_paid_amount = IFNULL(in_last_paid_amount, last_paid_amount),
    last_paid_date = IFNULL(in_last_paid_date, last_paid_date),
    credit_limit = IFNULL(in_credit_limit, credit_limit),
    principal_outstanding_amount = IFNULL(in_principal_outstanding_amount, principal_outstanding_amount),
    total_outstanding_amount = IFNULL(in_total_outstanding_amount, total_outstanding_amount),
    minimum_payment = IFNULL(in_minimum_payment, minimum_payment),
    ghrc_offer_1 = IFNULL(in_ghrc_offer_1, ghrc_offer_1),
    ghrc_offer_2 = IFNULL(in_ghrc_offer_2, ghrc_offer_2),
    ghrc_offer_3 = IFNULL(in_ghrc_offer_3, ghrc_offer_3),
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
    status = 1,
    modified_id = IFNULL(in_app_user_id, modified_id),
    modified_dtm = CURRENT_TIMESTAMP
  WHERE lead_payment_ledger_id = v_existing_payment_ledger_id;
  
  SET out_lead_payment_ledger_id = v_existing_payment_ledger_id;
  
ELSE
  -- If payment ledger doesn't exist, INSERT new one
  INSERT INTO
       `crm`.leads_payment_ledger(
              lead_payment_ledger_id,
              lead_id,
              task_id,
              last_paid_amount,
              last_paid_date,
              credit_limit,
              principal_outstanding_amount,
              total_outstanding_amount,
              minimum_payment,
              ghrc_offer_1,
              ghrc_offer_2,
              ghrc_offer_3,
              -- New payment-related columns added 15-Jan-2025
              fresh_stab,
              cycle_statement,
              card_auth,
              dpd_r,
              mindue_manual,
              rb_amount,
              overdue_amount,
              due_since_date,
              last_month_paid_unpaid,
              last_usage_date,
              dpd_string,
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
              in_lead_id,
              in_task_id,
              in_last_paid_amount,
              in_last_paid_date,
              in_credit_limit,
              in_principal_outstanding_amount,
              in_total_outstanding_amount,
              in_minimum_payment,
              in_ghrc_offer_1,
              in_ghrc_offer_2,
              in_ghrc_offer_3,
              -- New payment-related columns added 15-Jan-2025
              in_fresh_stab,
              in_cycle_statement,
              in_card_auth,
              in_dpd_r,
              in_mindue_manual,
              in_rb_amount,
              in_overdue_amount,
              in_due_since_date,
              in_last_month_paid_unpaid,
              in_last_usage_date,
              in_dpd_string,
              -- End new columns
              1,
              in_app_user_id,
              CURRENT_TIMESTAMP(),
              in_app_user_id,
              CURRENT_TIMESTAMP()
       );

  SET out_lead_payment_ledger_id = LAST_INSERT_ID();
  
END IF;  -- Close the IF-ELSE block

COMMIT;

SET
       error_code = 0;

END $$ 
DELIMITER ;
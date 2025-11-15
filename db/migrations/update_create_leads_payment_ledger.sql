-- Migration to update create_leads_payment_ledger stored procedure
-- This fixes the parameter count mismatch error

-- Drop the existing procedure
DROP PROCEDURE IF EXISTS `crm`.create_leads_payment_ledger;

-- Recreate with the correct number of parameters
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
SET
       error_code = -2;

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
              IFNULL(in_last_paid_amount,0),
              IFNULL(in_last_paid_date,""),
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
       ) ON DUPLICATE KEY
UPDATE
       status = IFNULL(1, status),
       modified_id = IFNULL(in_app_user_id, modified_id),
       modified_dtm = IFNULL(CURRENT_TIMESTAMP(), modified_dtm),
       lead_payment_ledger_id = LAST_INSERT_ID(lead_payment_ledger_id);

SET
       out_lead_payment_ledger_id = LAST_INSERT_ID();

COMMIT;

SET
       error_code = 0;

END $$ 
DELIMITER ;



-- This function will last paid amount by the lead
-- SELECT crm.fn_get_last_paid_amount(9,NULL);
-- SELECT crm.fn_get_last_paid_amount(NULL,7);
-- SELECT crm.fn_get_last_paid_amount(20,7);

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_last_paid_amount$$

CREATE FUNCTION crm.fn_get_last_paid_amount( in_user_id BIGINT, in_lead_id BIGINT )

RETURNS FLOAT DETERMINISTIC

BEGIN

DECLARE v_last_paid_amount FLOAT;

SET v_last_paid_amount = NULL;

IF in_user_id IS NOT NULL AND in_lead_id IS NULL THEN 
SELECT last_paid_amount
  INTO v_last_paid_amount
  FROM crm.leads l 
  JOIN crm.leads_payment_ledger lpl
    ON l.lead_id = lpl.lead_id
 WHERE l.created_id = in_user_id
 ORDER BY lead_payment_ledger_id DESC 
 LIMIT 1;
 
 RETURN v_last_paid_amount;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NULL THEN 
SELECT last_paid_amount
  INTO v_last_paid_amount
  FROM crm.leads l 
  JOIN crm.leads_payment_ledger lpl
    ON l.lead_id = lpl.lead_id
 WHERE l.lead_id = in_lead_id
 ORDER BY lead_payment_ledger_id DESC 
 LIMIT 1;

 
 RETURN v_last_paid_amount;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NOT NULL THEN 
SELECT last_paid_amount
  INTO v_last_paid_amount
  FROM crm.leads l 
  JOIN crm.leads_payment_ledger lpl
    ON l.lead_id = lpl.lead_id
 WHERE l.created_id = in_user_id
   AND l.lead_id = in_lead_id
 ORDER BY lead_payment_ledger_id DESC 
 LIMIT 1;

 RETURN v_last_paid_amount;
 
END IF;

END$$
DELIMITER ;

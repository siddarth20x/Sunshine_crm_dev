-- This function will last paid amount by the lead
-- SELECT crm.fn_get_total_outstanding_amount(9,NULL);
-- SELECT crm.fn_get_total_outstanding_amount(NULL,69);
-- SELECT crm.fn_get_total_outstanding_amount(20,7);

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_total_outstanding_amount$$

CREATE FUNCTION crm.fn_get_total_outstanding_amount( in_user_id BIGINT, in_lead_id BIGINT )

RETURNS FLOAT DETERMINISTIC

BEGIN

DECLARE v_total_outstanding_amount FLOAT;

SET v_total_outstanding_amount = NULL;

IF in_user_id IS NOT NULL AND in_lead_id IS NULL THEN 
SELECT MAX(total_outstanding_amount)
  INTO v_total_outstanding_amount
  FROM crm.leads l 
  JOIN crm.leads_payment_ledger lpl
    ON l.lead_id = lpl.lead_id
 WHERE l.created_id = in_user_id
 ORDER BY lead_payment_ledger_id DESC 
 LIMIT 1;
 
 RETURN v_total_outstanding_amount;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NULL THEN 
SELECT MAX(total_outstanding_amount)
  INTO v_total_outstanding_amount
  FROM crm.leads l 
  JOIN crm.leads_payment_ledger lpl
    ON l.lead_id = lpl.lead_id
 WHERE l.lead_id = in_lead_id
 ORDER BY lead_payment_ledger_id DESC 
 LIMIT 1;

 
 RETURN v_total_outstanding_amount;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NOT NULL THEN 
SELECT MAX(total_outstanding_amount)
  INTO v_total_outstanding_amount
  FROM crm.leads l 
  JOIN crm.leads_payment_ledger lpl
    ON l.lead_id = lpl.lead_id
 WHERE l.created_id = in_user_id
   AND l.lead_id = in_lead_id
 ORDER BY lead_payment_ledger_id DESC 
 LIMIT 1;

 RETURN v_total_outstanding_amount;
 
END IF;

END$$
DELIMITER ;

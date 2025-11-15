-- call crm.get_leads_payment_ledger(@err,null);
-- call crm.get_leads_payment_ledger(@err,1);


DROP PROCEDURE IF EXISTS crm.get_leads_payment_ledger;

DELIMITER $$
CREATE PROCEDURE crm.get_leads_payment_ledger(OUT error_code INT, 
                                              IN in_lead_id BIGINT
                                            )
BEGIN
SET error_code = -2;

SET @get_q = '

SELECT lpl.lead_payment_ledger_id,      
       lpl.lead_id, 
       lpl.task_id, 
       lpl.last_paid_amount, 
       lpl.last_paid_date,
       lpl.credit_limit,  
       lpl.principal_outstanding_amount,  
       lpl.total_outstanding_amount,  
       lpl.minimum_payment,  
       lpl.ghrc_offer_1,     
       lpl.ghrc_offer_2,  
       lpl.ghrc_offer_3,  
       lpl.fresh_stab,
       lpl.cycle_statement,
       lpl.card_auth,
       lpl.dpd_r,
       lpl.mindue_manual,
       lpl.rb_amount,
       lpl.overdue_amount,
       lpl.due_since_date,
       lpl.last_month_paid_unpaid,
       lpl.last_usage_date,
       lpl.dpd_string,
       lpl.status,       
       lpl.created_id,   
       lpl.created_dtm,  
       lpl.modified_id,
       lpl.modified_dtm
  FROM crm.leads_payment_ledger lpl
  JOIN crm.leads l
    ON lpl.lead_id = l.lead_id
WHERE lpl.status = 1 

';


-- IF in_sq_check_id IS NOT NULL THEN
--      SET @get_q = CONCAT(@get_q, '
--       AND lpl.sq_check_id  = ', in_sq_check_id);
-- END IF; 

IF in_lead_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND lpl.lead_id  = ', in_lead_id);
END IF; 

-- IF in_sq_parameter_type_id IS NOT NULL THEN
--      SET @get_q = CONCAT(@get_q, '
--       AND lpl.sq_parameter_type_id  = ', in_sq_parameter_type_id);
-- END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

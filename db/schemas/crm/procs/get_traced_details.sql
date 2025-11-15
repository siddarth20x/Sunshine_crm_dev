-- call crm.get_tracing_details(@err,null,null);
-- call crm.get_tracing_details(@err,1,null);
-- call crm.get_tracing_details(@err,null,1);
DROP PROCEDURE IF EXISTS crm.get_tracing_details;

DELIMITER $$ 
CREATE PROCEDURE crm.get_tracing_details(
     OUT error_code INT,
     IN in_traced_details_id BIGINT,
     IN in_lead_id BIGINT
) 
BEGIN
SET  error_code = -2;

SET
     @get_q = '

SELECT td.traced_details_id,      
       td.lead_id, 
       td.task_id, 
       td.sql_details, 
       td.company_trade_license_details,
       td.additional_details,  
       td.status,       
       td.created_id,   
       td.created_dtm,  
       td.modified_id,
       td.modified_dtm,
       -- Lead information
       l.account_number,
       l.product_type,
       l.product_account_number,
       l.agreement_id,
       l.finware_acn01,
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
       l.employer_details,
       l.designation,
       l.company_contact,
       l.withdraw_date,
       l.father_name,
       l.mother_name,
       l.spouse_name,
       l.pli_status,
       l.execution_status,
       l.overdue,
       l.banker_name,
       l.is_visit_required,
       l.settlement_status,
       l.allocation_type,
       -- New columns added 15-Jan-2025
       l.fresh_stab,
       l.cycle_statement,
       l.card_auth,
       l.dpd_r,
       l.mindue_manual,
       l.rb_amount,
       l.overdue_amount,
       l.due_since_date,
       l.monthly_income,
       l.office_address,
       l.friend_residence_phone,
       l.last_month_paid_unpaid,
       l.last_usage_date,
       l.dpd_string,
       l.dcore_id,
       -- Disposition code from PRELIMINARY CHECKS task
       pc_task.disposition_code_id,
       pc_task.stage AS disposition_stage,
       pc_task.stage_status AS disposition_status,
       pc_task.stage_status_name AS disposition_status_name,
       pc_task.stage_status_code AS disposition_code
  FROM crm.tracing_details td
--   JOIN crm.tracing_source_type tst
--     ON td.tracing_source_type_id = tst.tracing_source_type_id
  JOIN crm.leads l
    ON td.lead_id = l.lead_id
  LEFT OUTER JOIN (
    -- Fetch all preliminary checks tasks, even if disposition_code_id is NULL
    SELECT 
      t.lead_id,
      t.disposition_code_id,
      dc.stage,
      dc.stage_status,
      dc.stage_status_name,
      dc.stage_status_code,
      ROW_NUMBER() OVER (PARTITION BY t.lead_id ORDER BY t.modified_dtm DESC) as rn
    FROM crm.task t
    JOIN crm.task_type tt ON t.task_type_id = tt.task_type_id
    LEFT OUTER JOIN crm.disposition_code dc ON t.disposition_code_id = dc.disposition_code_id
    WHERE t.status = 1 
      AND tt.task_type_name = ''''''PRELIMINARY CHECKS''''''
  ) pc_task ON l.lead_id = pc_task.lead_id AND pc_task.rn = 1
WHERE td.status = 1 

';

IF in_traced_details_id IS NOT NULL THEN
SET
     @get_q = CONCAT(
          @get_q,
          '
      AND td.traced_details_id  = ',
          in_traced_details_id
     );

END IF;

IF in_lead_id IS NOT NULL THEN
SET
     @get_q = CONCAT(
          @get_q,
          '
      AND td.lead_id  = ',
          in_lead_id
     );

END IF;

/*IF in_tracing_source_type_id IS NOT NULL THEN
 SET
 @get_q = CONCAT(
 @get_q,
 '
 AND td.tracing_source_type_id  = ',
 in_tracing_source_type_id
 );
 
 END IF;*/

-- select @get_q;
PREPARE stmt
FROM
     @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET
     error_code = 0;

END $$ 
DELIMITER ;
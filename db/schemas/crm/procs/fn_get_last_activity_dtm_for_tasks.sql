-- This function will max activity dtm associated to the lead
-- SELECT crm.fn_get_last_activity_dtm_for_tasks(9,NULL);
-- SELECT crm.fn_get_last_activity_dtm_for_tasks(NULL,30);

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_last_activity_dtm_for_tasks$$

CREATE FUNCTION crm.fn_get_last_activity_dtm_for_tasks( in_user_id BIGINT, in_lead_id BIGINT, in_task_id BIGINT )

RETURNS TIMESTAMP DETERMINISTIC

BEGIN

DECLARE v_last_activity_dtm TIMESTAMP;

SET v_last_activity_dtm = NULL;

IF in_user_id IS NOT NULL AND in_lead_id IS NULL THEN
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log 
 WHERE created_id = in_user_id
   AND activity_doc_pk_id = in_task_id
   AND activity_type IN ('TASK_INSERT',
                         'TASK_UPDATE',
                         'CONTACT_INSERT',
                         'ADDRESS_INSERT',
                         'ACCOUNT_UPDATE',
                         'VISA_CHECK_INSERT',
                         'TRACED_DETAILS_INSERT',
                         'NOTES_INSERT',
                         'NOTES_UPDATE',
                         'LEADS_PAYMENT_LEDGER_INSERT',
                         'WEB_TRACED_DETAILS_INSERT',
                         'MOL_CHECK_INSERT');
   /* -- Old types
   AND activity_type IN ('TASK_INSERT', 
                         'CONTACT_INSERT',
                         'ADDRESS_INSERT',
                         'VISA_CHECK_INSERT',
                         'TASK_UPDATE',
                         'WEB_TRACED_DETAILS_INSERT',
                         'TRACED_DETAILS_INSERT',
                         'MOL_CHECK_INSERT',
                         'LEADS_PAYMENT_LEDGER_INSERT',
                         'NOTES_UPDATE' ); */
 
 RETURN v_last_activity_dtm;
 
END IF;

IF in_lead_id IS NOT NULL AND in_user_id IS NULL THEN
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log 
 WHERE lead_id = in_lead_id
   AND activity_doc_pk_id = in_task_id
   AND activity_type IN ('TASK_INSERT',
                         'TASK_UPDATE',
                         'CONTACT_INSERT',
                         'ADDRESS_INSERT',
                         'ACCOUNT_UPDATE',
                         'VISA_CHECK_INSERT',
                         'TRACED_DETAILS_INSERT',
                         'NOTES_INSERT',
                         'NOTES_UPDATE',
                         'LEADS_PAYMENT_LEDGER_INSERT',
                         'WEB_TRACED_DETAILS_INSERT',
                         'MOL_CHECK_INSERT');
 
 RETURN v_last_activity_dtm;
 
END IF;

IF in_user_id IS NOT NULL AND in_lead_id IS NOT NULL THEN 
SELECT MAX(activity_dtm)
  INTO v_last_activity_dtm
  FROM crm.activity_log 
 WHERE created_id = in_user_id
   AND lead_id = in_lead_id
   AND activity_doc_pk_id = in_task_id
   AND activity_type IN ('TASK_INSERT',
                         'TASK_UPDATE',
                         'CONTACT_INSERT',
                         'ADDRESS_INSERT',
                         'ACCOUNT_UPDATE',
                         'VISA_CHECK_INSERT',
                         'TRACED_DETAILS_INSERT',
                         'NOTES_INSERT',
                         'NOTES_UPDATE',
                         'LEADS_PAYMENT_LEDGER_INSERT',
                         'WEB_TRACED_DETAILS_INSERT',
                         'MOL_CHECK_INSERT');
                         
 RETURN v_last_activity_dtm;
 
END IF;
END$$
DELIMITER ;

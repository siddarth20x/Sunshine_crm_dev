DELIMITER $$

DROP TRIGGER IF EXISTS crm.t_ai_leads_payment_ledger$$

CREATE TRIGGER crm.t_ai_leads_payment_ledger AFTER INSERT on crm.leads_payment_ledger
FOR EACH ROW BEGIN 

DECLARE v_app_user_id BIGINT DEFAULT NULL ;
DECLARE v_lead_id BIGINT DEFAULT NULL ;
DECLARE v_activity_type VARCHAR(45) DEFAULT NULL ;
DECLARE v_activity_doc_type CHAR(1) DEFAULT NULL ;
DECLARE v_activity_doc_pk_id BIGINT DEFAULT NULL ;
DECLARE v_activity_detail TEXT DEFAULT NULL ;
DECLARE v_activity_dtm TIMESTAMP;

DECLARE v_assigned_by	BIGINT(20);
DECLARE v_assigned_to	BIGINT(20);

DECLARE v_notification_type_id BIGINT;
DECLARE v_notification_type_description VARCHAR(100);

DECLARE v_task_id BIGINT DEFAULT NULL;
DECLARE v_task_type_id_pc BIGINT DEFAULT NULL;
DECLARE v_is_uploaded_rec TINYINT DEFAULT 0;
DECLARE v_is_touched TINYINT DEFAULT 0;

SET v_activity_detail = CONCAT('','');

SELECT new.modified_id AS app_user_id,
       new.lead_id AS lead_id,
       'LEADS_PAYMENT_LEDGER_INSERT' AS activity_type,
       "P" AS activity_doc_type,             
       new.lead_payment_ledger_id AS activity_doc_pk_id,
       CONCAT(
		CONCAT(' lead_payment_ledger_id was created as ', IFNULL(new.lead_payment_ledger_id, ''), ';'),
		CONCAT(' lead_id was created as ', IFNULL(new.lead_id, ''), ';'),
		CONCAT(' task_id was created as ', IFNULL(new.task_id, ''), ';'),
		CONCAT(' last_paid_amount was created as ', IFNULL(new.last_paid_amount, ''), ';'),
		CONCAT(' last_paid_date was created as ', IFNULL(new.last_paid_date, ''), ';'),
		CONCAT(' credit_limit was created as ', IFNULL(new.credit_limit, ''), ';'),
		CONCAT(' principal_outstanding_amount was created as ', IFNULL(new.principal_outstanding_amount, ''), ';'),
		CONCAT(' total_outstanding_amount was created as ', IFNULL(new.total_outstanding_amount, ''), ';'),
		CONCAT(' minimum_payment name was created as ', IFNULL(new.minimum_payment, ''), ';'),
		CONCAT(' ghrc_offer_1 name was created as ', IFNULL(new.ghrc_offer_1, ''), ';'),
		CONCAT(' ghrc_offer_2 name was created as ', IFNULL(new.ghrc_offer_2, ''), ';'),
		CONCAT(' ghrc_offer_3 name was created as ', IFNULL(new.ghrc_offer_3, ''), ';'),
          CONCAT(' is uploaded record was created as ', IFNULL(new.is_uploaded_record, ''), ';'),
		-- New payment-related columns added 15-Jan-2025
		CONCAT(' fresh_stab was created as ', IFNULL(new.fresh_stab, ''), ';'),
		CONCAT(' cycle_statement was created as ', IFNULL(new.cycle_statement, ''), ';'),
		CONCAT(' card_auth was created as ', IFNULL(new.card_auth, ''), ';'),
		CONCAT(' dpd_r was created as ', IFNULL(new.dpd_r, ''), ';'),
		CONCAT(' mindue_manual was created as ', IFNULL(new.mindue_manual, ''), ';'),
		CONCAT(' rb_amount was created as ', IFNULL(new.rb_amount, ''), ';'),
		CONCAT(' overdue_amount was created as ', IFNULL(new.overdue_amount, ''), ';'),
		CONCAT(' due_since_date was created as ', IFNULL(new.due_since_date, ''), ';'),
		CONCAT(' last_month_paid_unpaid was created as ', IFNULL(new.last_month_paid_unpaid, ''), ';'),
		CONCAT(' last_usage_date was created as ', IFNULL(new.last_usage_date, ''), ';'),
		CONCAT(' dpd_string was created as ', IFNULL(new.dpd_string, ''), ';'),
		-- End new columns
		CONCAT(' status was created as ', IFNULL(new.status, ''), ';'),
		CONCAT(' created_id was created as ', IFNULL(new.created_id, ''), ';')
       ) AS activity_detail,
       CURRENT_TIMESTAMP AS activity_dtm 
  INTO v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,       
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm
  FROM DUAL;

SELECT tt.task_type_id
  INTO v_task_type_id_pc
  FROM crm.task t
  JOIN crm.task_type tt
    ON t.task_type_id = tt.task_type_id
 WHERE t.task_id = new.task_id
   AND tt.task_type_name = 'PAYMENT COLLECTION';

IF v_task_type_id_pc IS NOT NULL OR LENGTH(v_task_type_id_pc) > 0 THEN
   SET v_is_uploaded_rec = 1;
END IF;  

CALL crm.create_activity_log (@err,
       v_app_user_id,
       v_lead_id,
       v_activity_type,
       v_activity_doc_type,
       v_activity_doc_pk_id,
       v_activity_detail,
       v_activity_dtm,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       NULL,
       v_is_uploaded_rec,	
       v_is_touched,                
       @osuid);

-- Create User Notif When New Leads Payment Ledger are added

   SELECT notification_type_id,
          notification_type_description
     INTO v_notification_type_id,
          v_notification_type_description
     FROM user.notification_type
	WHERE notification_type_name = "PAYMENT_LEDGER_ENTRY_ADDED";

   SELECT assigned_by,
          assigned_to
     INTO v_assigned_by,
          v_assigned_to
     FROM crm.task 
	WHERE lead_id = new.lead_id LIMIT 1;
   
-- Send one notif to assigned by of the task
   CALL user.create_user_notification(@err,
                                       v_assigned_by, -- Notif recipient 
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Leads Payment Ledger Added',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);

-- Send one notif to  assigned_to of the task
   CALL user.create_user_notification(@err,
                                       v_assigned_to, -- Notif recipient
                                       v_notification_type_id,
                                       v_notification_type_description, -- Notif Name
                                       'New Leads Payment Ledger Added',
                                       CURRENT_DATE,
                                       DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY),
                                       5,
                                       1,
                                       1,
                                       NULL,
                                       1,
                                       @out_id);


END;

$$

DELIMITER ;

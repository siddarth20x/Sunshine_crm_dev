-- This function will max contact mode by modified dtm associated to the lead
-- SELECT crm.fn_get_max_disp_code_by_lead_id(652, "projection-report"); 
-- SELECT crm.fn_get_max_disp_code_by_lead_id(652, "daily-report");

DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_max_disp_code_by_lead_id$$

CREATE FUNCTION crm.fn_get_max_disp_code_by_lead_id( in_lead_id BIGINT, in_report_name VARCHAR(100))

RETURNS VARCHAR(500) DETERMINISTIC

BEGIN

DECLARE v_last_disp_code VARCHAR(500);
DECLARE v_task_type_id BIGINT;

SET v_last_disp_code = NULL;

SELECT task_type_id 
 INTO v_task_type_id
 FROM crm.task_type 
WHERE task_type_name = "PAYMENT COLLECTION";

IF in_lead_id IS NOT NULL AND in_report_name <> "projection-report" THEN 

SELECT CONCAT(dc.stage,";",dc.stage_status_code,";",dc.stage_status_name)
  INTO v_last_disp_code
-- CONCAT("stage-",dc.stage,";","stage_status_code-",dc.stage_status_code,";","stage_status_name-",dc.stage_status_name) AS disp_values
  FROM crm.task t
  JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
 WHERE t.lead_id = in_lead_id 
   AND t.task_type_id <> v_task_type_id
 ORDER BY t.modified_dtm DESC
 LIMIT 1;
                         
RETURN v_last_disp_code;
 
END IF;

IF in_lead_id IS NOT NULL AND in_report_name = "projection-report" THEN 

SELECT CONCAT(dc.stage,";",dc.stage_status_code,";",dc.stage_status_name)
  INTO v_last_disp_code
-- CONCAT("stage-",dc.stage,";","stage_status_code-",dc.stage_status_code,";","stage_status_name-",dc.stage_status_name) AS disp_values
  FROM crm.task t
  JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
 WHERE t.lead_id = in_lead_id
   AND t.task_type_id = v_task_type_id
   AND dc.stage_status_code IN ('PTP','PAID','PART PAYMENT')
 ORDER BY t.modified_dtm DESC
 LIMIT 1;
                         
RETURN v_last_disp_code;
 
END IF;


END$$
DELIMITER ;

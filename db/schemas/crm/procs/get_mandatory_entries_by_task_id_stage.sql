-- call crm.get_mandatory_entries_by_task_id_stage (@err,229,"CONTACTED",@occ); 
-- SELECT @occ;
-- call crm.get_mandatory_entries_by_task_id_stage (@err,229,"NON CONTACTED",@occ); 
-- SELECT @occ;
DROP PROCEDURE IF EXISTS crm.get_mandatory_entries_by_task_id_stage;

DELIMITER $$ 
CREATE PROCEDURE crm.get_mandatory_entries_by_task_id_stage (
   OUT error_code INT,
   IN in_task_id BIGINT,
   IN in_stage VARCHAR(100),
   OUT out_count_check TINYINT
) 
BEGIN

DECLARE v_c_count TINYINT DEFAULT 0;
DECLARE v_vc_count TINYINT DEFAULT 0;
DECLARE v_td_count TINYINT DEFAULT 0;
DECLARE v_wtd_count TINYINT DEFAULT 0;

SET
   error_code = -2;

IF in_stage = "CONTACTED" THEN

SELECT COUNT(1)
  INTO v_c_count
  FROM crm.contact c
  JOIN crm.task t
    ON c.task_id = t.task_id
  JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
 WHERE c.task_id = in_task_id
   AND dc.stage = "CONTACTED";

SELECT COUNT(1)
  INTO v_vc_count
  FROM crm.visa_check vc
  JOIN crm.task t
    ON vc.task_id = t.task_id
  JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
 WHERE vc.task_id = in_task_id
   AND dc.stage = "CONTACTED";
   
SELECT COUNT(1)
  INTO v_td_count
  FROM crm.tracing_details td
  JOIN crm.task t
    ON td.task_id = t.task_id
  JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
 WHERE td.task_id = in_task_id
   AND dc.stage = "CONTACTED";

IF v_c_count > 0 AND v_vc_count > 0 AND v_td_count > 0 THEN
SET out_count_check = v_c_count+v_vc_count+v_td_count;
ELSE
SET out_count_check = 0;
END IF;

END IF;

IF in_stage = "NON CONTACTED" THEN

SELECT COUNT(1)
  INTO v_wtd_count
  FROM crm.web_tracing_details wtd
  JOIN crm.task t
    ON wtd.task_id = t.task_id
  JOIN crm.disposition_code dc
    ON t.disposition_code_id = dc.disposition_code_id
 WHERE wtd.task_id = in_task_id
   AND dc.stage = "NON CONTACTED";

SET out_count_check = v_wtd_count;

END IF;

SET
   error_code = 0;

END $$ 
DELIMITER ;
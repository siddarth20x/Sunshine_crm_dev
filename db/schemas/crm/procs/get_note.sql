-- call crm.get_note (@err,null, 1); 
-- call crm.get_note (@err,null, null); 
DROP PROCEDURE IF EXISTS crm.get_note;

DELIMITER $$
CREATE PROCEDURE crm.get_note (OUT error_code INT, 
				IN in_note_id BIGINT,
			        IN in_task_id BIGINT)
                                              
BEGIN
SET error_code = -2;

SET @get_q = '
SELECT  n.note_id,
        t.task_id,
        REPLACE(n.note,"$###$"," ") AS note,
        n.status,
        n.created_id,
        n.created_dtm,
        n.modified_id,
        n.modified_dtm
   FROM crm.task t,
        crm.notes n
  WHERE t.task_id = n.task_id
    AND n.status = 1 ';

IF in_task_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND t.task_id = ', in_task_id);
END IF; 

IF in_note_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND n.note_id = ', in_note_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET error_code=0;

END$$
DELIMITER ;

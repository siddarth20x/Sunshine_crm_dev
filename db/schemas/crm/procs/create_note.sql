-- call `crm`.create_note(@err,2,1,"TRY TO CONTACT VIA MAIL",@onid);

DROP PROCEDURE IF EXISTS `crm`.create_note;

DELIMITER $$
CREATE PROCEDURE `crm`.create_note(OUT error_code INT,
			              IN in_app_user_id BIGINT,
				       IN in_task_id BIGINT,
				       IN in_note VARCHAR(5000),
				       OUT out_note_id BIGINT
                                   )
BEGIN

DECLARE v_note VARCHAR(500) DEFAULT NULL;
DECLARE v_clean_note VARCHAR(500) DEFAULT NULL;
DECLARE v_check_char VARCHAR(5000) DEFAULT NULL;
DECLARE v_uploaded_rec TINYINT DEFAULT 0;

SET error_code=-2;

SELECT SUBSTRING_INDEX(in_note,"$###",-1) 
  INTO v_check_char
  FROM DUAL;

SELECT SUBSTRING_INDEX(in_note,"$###",1) 
  INTO v_clean_note
  FROM DUAL;

IF v_check_char = "$" THEN
   SET v_note = v_clean_note;
   SET v_uploaded_rec = 1;
ELSE 
   SET v_note = in_note;  
   SET v_uploaded_rec = 0;
END IF;  

INSERT INTO `crm`.notes
       (note_id,
        task_id, 
        note,
        is_uploaded_record,
        status,
        created_id,
        created_dtm,
        modified_id,
        modified_dtm
       )
VALUES
       (NULL, 
        in_task_id,
        in_note,
        v_uploaded_rec,
        1,
        in_app_user_id,
	 CURRENT_TIMESTAMP(),
        in_app_user_id,
        CURRENT_TIMESTAMP()        
       );
       
SET out_note_id=LAST_INSERT_ID();

COMMIT;

SET error_code=0;
 
END$$
DELIMITER ;

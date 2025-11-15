-- call user.set_auto_notification_acknowledge(4,17,"ORD-PAS-WH/455/20-21");

DROP PROCEDURE IF EXISTS `user`.`set_auto_notification_acknowledge`;
DELIMITER $$
CREATE PROCEDURE `user`.`set_auto_notification_acknowledge`(IN in_user_id BIGINT,
							    IN in_notification_type_id BIGINT,
							    IN in_notification_name VARCHAR(200))

BEGIN
DECLARE v_finished INTEGER DEFAULT 0;
DECLARE v_usr_notf_id BIGINT;

DECLARE user_cursor CURSOR FOR
SELECT user_notification_id
  FROM user.user_notification
 WHERE user_id = in_user_id
   AND notification_type_id = in_notification_type_id
   AND notification_name = in_notification_name
   AND status = 1;
       
DECLARE CONTINUE HANDLER
        FOR NOT FOUND SET v_finished = 1;
        
 OPEN user_cursor;

 notf_ack: LOOP
 FETCH user_cursor INTO v_usr_notf_id;
 
IF v_finished = 1 THEN
LEAVE notf_ack;
END IF;

CALL user.edit_user_notification(@err,in_user_id,v_usr_notf_id,null,null,null,null,null,null,null,null,CURRENT_TIMESTAMP,0);
		
END LOOP notf_ack;

 CLOSE user_cursor;
 
 END$$

 DELIMITER ;
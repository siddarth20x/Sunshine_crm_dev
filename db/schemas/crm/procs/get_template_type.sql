-- call crm.get_template_type(@err,null);

DROP PROCEDURE IF EXISTS crm.get_template_type;

DELIMITER $$
CREATE PROCEDURE crm.get_template_type(OUT error_code INT, 
			            IN in_template_type_id MEDIUMINT)
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT tmp.template_type_id, 
        tmp.template_name,
        tmp.template_subject,
        tmp.template_html_name,
        tmp.sender_logo_url,
        tmp.sender_email_id,
        tmp.cc_email_id,
        tmp.reply_to_email_id,
        tmp.mail_api_url,
        tmp.unsubscribe_api_url,
        tmp.status,
        tmp.created_id,
        tmp.created_dtm,
        tmp.modified_id,
        tmp.modified_dtm
   FROM crm.template_type tmp 
  WHERE tmp.status = 1 ';

IF in_template_type_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND tmp.template_type_id  = ', in_template_type_id);
END IF; 

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;

END$$
DELIMITER ;

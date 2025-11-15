DELIMITER $$

DROP TRIGGER IF EXISTS user.t_au_user_template_action_log$$

create trigger user.t_au_user_template_action_log AFTER UPDATE on user.user_template_action_log 
for each row BEGIN
INSERT INTO user.user_template_action_log_audit
(  	
  user_template_action_log_id,
  user_template_docs_id,
  user_id,
  user_template_data_doc,
  action_dtm,
  action_by_id,
  status,
  created_id,
  created_dtm,
  modified_id,
  modified_dtm,
  audit_action,
  audit_dtm
)
VALUES
(
  old.user_template_action_log_id,
  old.user_template_docs_id,
  old.user_id,
  old.user_template_data_doc,
  old.action_dtm,
  old.action_by_id,
  old.status,
  old.created_id,
  old.created_dtm,
  old.modified_id,
  old.modified_dtm,
  'AU',
  CURRENT_TIMESTAMP
);
END;
$$

DELIMITER ;

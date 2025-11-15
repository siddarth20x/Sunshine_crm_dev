-- CALL user.get_ticket(@err,null,null,null,null,null,null,null)
-- CALL user.get_ticket(@err,3,null,null,null,null,null,null)
DELIMITER $$

DROP PROCEDURE IF EXISTS user.get_ticket$$

CREATE PROCEDURE user.get_ticket(
  OUT error_code INT,
  IN in_app_user_id BIGINT,
  IN in_ticket_id INT,
  IN in_ticket_status_type_id BIGINT,
  IN in_ticket_issue_category_type_id BIGINT,
  IN in_ticket_raised_by_id BIGINT,
  IN in_ticket_raised_dtm TIMESTAMP,
  IN in_ticket_resolved_dtm TIMESTAMP
)
BEGIN
  DECLARE full_name VARCHAR(255);  -- Variable to hold full name
  
  -- Initialize error_code to -2 (indicating an error by default)
  SET error_code = -2;
  
  -- Build the dynamic SQL query
  SET @q = CONCAT(
    'SELECT 
        t.ticket_id,
        t.ticket_status_type_id,
        t.ticket_issue_category_type_id,
        t.ticket_raised_by_id,
        t.ticket_raised_dtm,
        t.ticket_resolved_dtm,
        t.status,
        t.created_id,
        t.created_dtm,
        t.modified_id,
        t.modified_dtm,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, " ", u.last_name) AS full_name,
        ts.ticket_status_type_name,
        tc.ticket_issue_category_type_name
     FROM 
        user.ticket t
     LEFT JOIN user u ON t.ticket_raised_by_id = u.user_id
     LEFT JOIN user.ticket_status_type ts ON t.ticket_status_type_id = ts.ticket_status_type_id
     LEFT JOIN user.ticket_issue_category_type tc ON t.ticket_issue_category_type_id = tc.ticket_issue_category_type_id
     WHERE 1 = 1'
  );

  -- Conditionally add filters to the query
  IF in_ticket_id IS NOT NULL THEN
    SET @q = CONCAT(@q, ' AND t.ticket_id = ', in_ticket_id);
  END IF;

  IF in_ticket_status_type_id IS NOT NULL THEN
    SET @q = CONCAT(@q, ' AND t.ticket_status_type_id = ', in_ticket_status_type_id);
  END IF;

  IF in_ticket_issue_category_type_id IS NOT NULL THEN
    SET @q = CONCAT(@q, ' AND t.ticket_issue_category_type_id = ', in_ticket_issue_category_type_id);
  END IF;

  IF in_ticket_raised_by_id IS NOT NULL THEN
    SET @q = CONCAT(@q, ' AND t.ticket_raised_by_id = ', in_ticket_raised_by_id);
  END IF;

  IF in_app_user_id IS NOT NULL THEN
    SET @q = CONCAT(@q, ' AND (t.created_id = ', in_app_user_id, ' OR t.modified_id = ', in_app_user_id, ')');
  END IF;

  -- Additional condition for active tickets (assuming status 1 indicates active)
  SET @q = CONCAT(@q, ' AND t.status = 1');

  -- Prepare and execute the statement
  PREPARE stmt FROM @q;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  -- Set error_code to 0 indicating success
  SET error_code = 0;
  
END $$

DELIMITER ;

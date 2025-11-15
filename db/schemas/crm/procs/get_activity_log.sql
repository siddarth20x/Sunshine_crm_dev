-- call crm.get_activity_log(@err,1, NULL, NULL);
-- call crm.get_activity_log(@err,1, "2024-05-22 11:07:35", "2024-05-23 07:39:03");

DELIMITER $$

DROP PROCEDURE IF EXISTS crm.get_activity_log$$

CREATE PROCEDURE crm.get_activity_log(
    OUT error_code INT,
    IN in_lead_id INT,
    IN in_start_dtm TIMESTAMP,
    IN in_end_dtm TIMESTAMP,
    IN in_user_id INT,
    IN in_filter_user_id INT,
    IN in_filter_from_date DATE,
    IN in_filter_to_date DATE
)
BEGIN
-- Default error code indicating no user found
SET error_code = -2;

SET @q = "";

-- If lead_id is provided, query lead activities from crm.activity_log
IF in_lead_id IS NOT NULL THEN
    SET @q = CONCAT(@q, "
        SELECT al.activity_log_id, 
               al.lead_id, 
               al.activity_type,
               al.activity_doc_type,
               al.activity_doc_pk_id,
               al.activity_detail,
               al.activity_dtm,
               al.task_type,
               al.stage,
               al.stage_status,
               al.stage_status_name,
               al.stage_status_code,
               al.task_status_type,
               al.lead_status_type,
               al.status,
               al.created_id,
               al.created_dtm,
               al.modified_id, 
               al.modified_dtm,
               al.is_uploaded_record,
               al.is_touched,
               CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, '')) AS full_name
          FROM crm.activity_log al
          LEFT JOIN user.user u ON al.created_id = u.user_id
        ");
    
    -- Filter by lead_id
    SET @q = CONCAT(@q, " WHERE al.lead_id = ", in_lead_id);
ELSE
    -- Otherwise, query user login activities from user.user_activity_log
    SET @q = CONCAT(@q, "
        SELECT ual.user_activity_log_id AS activity_log_id, 
               NULL AS lead_id, 
               ual.activity_type,
               NULL AS activity_doc_type,
               ual.activity_doc_pk_id,
               ual.activity_detail,
               ual.activity_dtm,
               NULL AS task_type,
               NULL AS stage,
               NULL AS stage_status,
               NULL AS stage_status_name,
               NULL AS stage_status_code,
               NULL AS task_status_type,
               NULL AS lead_status_type,
               ual.status,
               ual.created_id,
               ual.created_dtm,
               ual.modified_id, 
               ual.modified_dtm,
               NULL AS is_uploaded_record,
               NULL AS is_touched,
               CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, '')) AS full_name
          FROM user.user_activity_log ual
          LEFT JOIN user.user u ON ual.user_id = u.user_id
        ");
    
    -- Filter only login activities
    SET @q = CONCAT(@q, " WHERE ual.activity_type = 'USER_LOGIN' ");
    
    -- Add user hierarchy filtering for login activities
    IF in_user_id IS NOT NULL THEN
        IF in_user_id = 2 THEN -- App Admin sees all
            SET @q = CONCAT(@q, " ");
        ELSE -- Other users see their own login activities and subordinates' login activities
            SET @q = CONCAT(@q, " AND (ual.user_id = ", in_user_id, " OR ual.user_id IN (
                SELECT u2.user_id
                FROM user.user u2
                WHERE u2.reporting_to_id = ", in_user_id, "
                OR u2.reporting_to_id IN (
                    SELECT u3.user_id
                    FROM user.user u3
                    WHERE u3.reporting_to_id = ", in_user_id, "
                    OR u3.reporting_to_id IN (
                        SELECT u4.user_id
                        FROM user.user u4
                        WHERE u4.reporting_to_id = ", in_user_id, "
                    )
                )
            )) ");
        END IF;
    END IF;
    
    -- Add date range filtering for login activities (default to today if no dates specified)
    IF in_filter_from_date IS NOT NULL AND in_filter_to_date IS NOT NULL THEN
        -- Date range filtering with timezone conversion
        SET @q = CONCAT(@q, " AND DATE(CONVERT_TZ(ual.activity_dtm, '+00:00', '+05:30')) >= ", "'", in_filter_from_date, "'");
        SET @q = CONCAT(@q, " AND DATE(CONVERT_TZ(ual.activity_dtm, '+00:00', '+05:30')) <= ", "'", in_filter_to_date, "'");
    ELSEIF in_filter_from_date IS NOT NULL THEN
        -- Only from date specified with timezone conversion
        SET @q = CONCAT(@q, " AND DATE(CONVERT_TZ(ual.activity_dtm, '+00:00', '+05:30')) >= ", "'", in_filter_from_date, "'");
    ELSEIF in_filter_to_date IS NOT NULL THEN
        -- Only to date specified with timezone conversion
        SET @q = CONCAT(@q, " AND DATE(CONVERT_TZ(ual.activity_dtm, '+00:00', '+05:30')) <= ", "'", in_filter_to_date, "'");
    ELSE
        -- Default to today's date (using IST timezone) only for login activities
        SET @q = CONCAT(@q, " AND DATE(CONVERT_TZ(ual.activity_dtm, '+00:00', '+05:30')) = CURDATE()");
    END IF;
    
    -- Add user filtering (optional)
    IF in_filter_user_id IS NOT NULL THEN
        SET @q = CONCAT(@q, " AND ual.user_id = ", in_filter_user_id);
    END IF;
    
    -- Legacy date filtering (keep for backward compatibility)
    IF in_start_dtm IS NOT NULL THEN
        SET @q = CONCAT(@q, " AND ual.activity_dtm >= ", "'", in_start_dtm, "'");
    END IF;
    
    IF in_end_dtm IS NOT NULL THEN
        SET @q = CONCAT(@q, " AND ual.activity_dtm < ", "'", in_end_dtm, "'");
    END IF;
    
    SET @q = CONCAT(@q, " ORDER BY ual.activity_dtm DESC; ");
END IF;

-- For lead activities, add date filtering
IF in_lead_id IS NOT NULL THEN
    -- Legacy date filtering for lead activities
    IF in_start_dtm IS NOT NULL THEN
        SET @q = CONCAT(@q, " AND al.activity_dtm >= ", "'", in_start_dtm, "'");
    END IF;
    
    IF in_end_dtm IS NOT NULL THEN
        SET @q = CONCAT(@q, " AND al.activity_dtm < ", "'", in_end_dtm, "'");
    END IF;
    
    SET @q = CONCAT(@q, " ORDER BY al.activity_dtm DESC; ");
END IF;

-- SELECT @q;
PREPARE stmt FROM @q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- If no exception occurred, set error_code to 0 and commit the transaction
SET error_code = 0;

END$$

DELIMITER ;
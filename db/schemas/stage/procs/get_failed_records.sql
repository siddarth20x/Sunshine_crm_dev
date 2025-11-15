-- call stage.get_failed_records(@err,30,NULL,'2024-11-27 10:45:47');
-- call stage.get_failed_records(@err,7,'2025-09-10','2025-09-11');
DROP PROCEDURE IF EXISTS `stage`.`get_failed_records`;

DELIMITER $$ 
CREATE PROCEDURE `stage`.`get_failed_records`(
	 OUT error_code INT
	,IN in_company_id BIGINT
	,IN in_start_dtm TIMESTAMP
    ,IN in_end_dtm TIMESTAMP
)

BEGIN
SET error_code = -2;

SET @v_end_dtm = DATE_ADD(in_end_dtm, INTERVAL 1 DAY);

SET
	@get_q = '
SELECT ls.lead_stage_id,
    ls.company_id,
	c.company_name,
    ls.senior_manager_id,
    ls.team_manager_id,
    ls.team_lead_id,
    ls.assigned_to,
    ls.account_number,
    ls.product_type,
    ls.product_account_number,
    ls.agreement_id,
    ls.business_name,
    ls.customer_name,
    ls.allocation_status,
    ls.customer_id,
    ls.passport_number,
    ls.date_of_birth,
    ls.bucket_status,
    ls.vintage,
    ls.date_of_woff,
    ls.nationality,
    ls.emirates_id_number,
    ls.credit_limit,
    ls.total_outstanding_amount,
    ls.principal_outstanding_amount,
    ls.employer_details,
    ls.designation,
    ls.company_contact,
    ls.home_country_number,
    ls.mobile_number,
    ls.email_id,
    ls.minimum_payment,
    ls.ghrc_offer_1,
    ls.ghrc_offer_2,
    ls.ghrc_offer_3,
    ls.withdraw_date,
    ls.home_country_address,
    ls.city,
    ls.pincode,
    ls.state,
    ls.father_name,
    ls.mother_name,
    ls.spouse_name,
    ls.last_paid_amount,
    ls.last_paid_date,
    ls.pli_status,
    ls.execution_status,
    ls.banker_name,
    ls.reason,
    ls.do_not_follow_flag,
    ls.status,
    ls.created_id,
    ls.created_dtm,
    ls.modified_id,
    ls.modified_dtm,
    ls.is_uploaded_flag AS upload_status
  FROM stage.lead_stage ls
  JOIN org.company c
    ON ls.company_id = c.company_id
  WHERE is_uploaded_flag IN ("N","E")
 ';

IF in_company_id IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND ls.company_id = ',	in_company_id);
END IF;

IF in_start_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND ls.created_dtm >= ', '"', in_start_dtm, '"');
END IF; 

IF in_end_dtm IS NOT NULL THEN
   SET @get_q = CONCAT(@get_q, '
   AND ls.created_dtm < ', '"', @v_end_dtm, '"');
END IF; 

-- SELECT @get_q;
PREPARE stmt
FROM @get_q;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$ 
DELIMITER ;
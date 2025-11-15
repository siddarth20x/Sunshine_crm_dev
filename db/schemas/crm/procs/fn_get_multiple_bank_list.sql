-- This function will return the multiple banks associated to the lead
-- SELECT crm.fn_get_multiple_bank_list(1);


DELIMITER $$

DROP FUNCTION IF EXISTS crm.fn_get_multiple_bank_list$$

CREATE FUNCTION crm.fn_get_multiple_bank_list( in_lead_id BIGINT )

RETURNS LONGTEXT DETERMINISTIC

BEGIN

DECLARE v_bank_id_list LONGTEXT;

DECLARE v_passport_number VARCHAR(100);
DECLARE v_emirates_id VARCHAR(100);

SET v_bank_id_list = '';

SELECT visa_passport_no, visa_emirates 
  INTO v_passport_number, v_emirates_id
  FROM crm.visa_check
 WHERE lead_id = in_lead_id
 ORDER BY visa_check_id DESC LIMIT 1;

SELECT GROUP_CONCAT(DISTINCT c.company_name, ':', l.lead_id) AS bank_list
  INTO v_bank_id_list
  FROM crm.leads l
  JOIN org.company c
    ON l.company_id = c.company_id
  --  AND (l.emirates_id_number = v_emirates_id OR l.passport_number = v_passport_number ) ;
   AND ( l.passport_number = v_passport_number ) ;

RETURN v_bank_id_list;

END$$
DELIMITER ;

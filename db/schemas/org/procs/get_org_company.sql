-- call org.get_org_company(@err, null, null, null);
-- call org.get_org_company(@err, null, null, 1);

DROP PROCEDURE IF EXISTS org.get_org_company;

DELIMITER $$
CREATE PROCEDURE org.get_org_company(OUT error_code INT, 
                                       IN in_company_id BIGINT,
                                       IN in_company_name VARCHAR(100),
                                       IN in_user_id BIGINT
                                      )
BEGIN
SET error_code = -2;

SET @get_q = '
 SELECT DISTINCT c.company_id, 
 	c.company_type_id,
        ct.company_type_name,
        c.company_name,
        c.company_code,
        c.company_desc,
        c.company_logo_url,
        c.website,
        c.country,
        c.region,
        c.account_no,
        c.iban_no,
        c.swift_code,
        c.team_manager_id,
        CONCAT(u1.first_name, " ", u1.last_name) AS team_manager_full_name,
        u1.email_address AS team_manager_email,
        c.team_lead_id,
        CONCAT(u2.first_name, " ", u2.last_name) AS team_lead_full_name,
        u2.email_address AS team_lead_email,
        c.senior_manager_id,
        CONCAT(u3.first_name, " ", u3.last_name) AS senior_manager_full_name,
        u3.email_address AS senior_manager_email,
        c.status,
        c.created_id,
        c.created_dtm,
        c.modified_id,
        c.modified_dtm
   FROM org.company c
   JOIN org.company_type ct        
     ON (c.company_type_id = ct.company_type_id AND c.status = 1)
   JOIN user.user u1
     ON c.team_manager_id = u1.user_id
   JOIN user.user u2
     ON c.team_lead_id = u2.user_id
   JOIN user.user u3
     ON c.senior_manager_id = u3.user_id
     ';

IF in_user_id IS NOT NULL THEN
    SET @get_q = CONCAT(@get_q, '
   JOIN user.user_role_company urc
     ON (c.company_id = urc.company_id AND urc.user_id = ', in_user_id, ' )');
END IF;

IF in_company_id IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND c.company_id = ', in_company_id);
END IF;

IF in_company_name IS NOT NULL THEN
     SET @get_q = CONCAT(@get_q, '
      AND UPPER(c.company_name) LIKE ''%', UPPER(in_company_name), '%''');
END IF;

-- select @get_q;

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code = 0;

END$$
DELIMITER ;

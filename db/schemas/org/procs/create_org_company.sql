-- call org.create_org_company 
-- (@err, 2, 2, 
--        'CS Bank', 
--        'CS1', 
--        'Codeswift test bank',
--        'https://www.codeswift.in',
--        'https://www.codeswift.in',
--        'India',
--        'Karnataka',
--        'account_no',
--        'in_iban_no',
--        'swift_code',
--        '2',
--        '2',
--        '2',
--        @aid);

DROP PROCEDURE IF EXISTS org.create_org_company;

DELIMITER $$ 
CREATE PROCEDURE org.create_org_company(
       OUT error_code INT,
       IN in_app_user_id BIGINT,
       IN in_company_type_id INT,
       IN in_company_name VARCHAR(100),
       IN in_company_code VARCHAR(10),
       IN in_company_desc VARCHAR(200),
       IN in_company_logo_url VARCHAR(2000),
       IN in_website VARCHAR(500),
       IN in_country VARCHAR(45),
       IN in_region VARCHAR(45),
       IN in_account_no VARCHAR(100),
       IN in_iban_no VARCHAR(100),
       IN in_swift_code VARCHAR(100),
       IN in_senior_manager_id BIGINT,
       IN in_team_manager_id BIGINT,
       IN in_team_lead_id BIGINT,
       OUT out_company_id BIGINT
)
BEGIN
SET
       error_code = -2;

INSERT INTO
       org.company (
              company_id,
              company_type_id,
              company_name,
              company_code,
              company_desc,
              company_logo_url,
              website,
              country,
              region,
              account_no,
              iban_no,
              swift_code,
              senior_manager_id,
              team_manager_id,
              team_lead_id,
              status,
              created_id,
              modified_id
       )
VALUES
       (
              NULL,
              in_company_type_id,
              UPPER(in_company_name),
              UPPER(in_company_code),
              in_company_desc,
              LOWER(in_company_logo_url),
              LOWER(in_website),
              in_country,
              in_region,
              in_account_no,
              in_iban_no,
              in_swift_code,
              in_senior_manager_id,
              in_team_manager_id,
              in_team_lead_id,
              1,
              in_app_user_id,
              in_app_user_id
       );

SET
       out_company_id = LAST_INSERT_ID();

SET
       error_code = 0;

END $$ 
DELIMITER ;
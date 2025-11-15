-- call org.edit_org_company (@err, -2, 5, 2, 'company_name111', 'PQR', 'company_desc_in', 'www.logo.com','www.website.com',2,4,1);
-- call org.edit_org_company (@err, -2, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0);
DROP PROCEDURE IF EXISTS org.edit_org_company;

DELIMITER $$ 
CREATE PROCEDURE org.edit_org_company(
        OUT error_code INT,
        IN in_app_user_id BIGINT,
        IN in_company_id BIGINT,
        IN in_company_type_id BIGINT,
        IN in_company_name VARCHAR(100),
        IN in_company_code VARCHAR(10),
        IN in_company_desc VARCHAR(500),
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
        IN in_status TINYINT
) 
BEGIN
SET
        error_code = -2;

UPDATE
        org.company
SET
        company_type_id = IFNULL(in_company_type_id, company_type_id),
        company_name = IFNULL(UPPER(in_company_name), company_name),
        company_code = IFNULL(UPPER(in_company_code), company_code),
        company_desc = IFNULL(UPPER(in_company_desc), company_desc),
        company_logo_url = IFNULL(UPPER(in_company_logo_url), company_logo_url),
        website = IFNULL(UPPER(in_website), website),
        country = IFNULL(UPPER(in_country), country),
        region = IFNULL(UPPER(in_region), region),
        account_no = IFNULL(UPPER(in_account_no), account_no),
        iban_no = IFNULL(UPPER(in_iban_no), iban_no),
        swift_code = IFNULL(UPPER(in_swift_code), swift_code),
        senior_manager_id = IFNULL(UPPER(in_senior_manager_id), senior_manager_id),
        team_manager_id = IFNULL(UPPER(in_team_manager_id), team_manager_id),
        team_lead_id = IFNULL(UPPER(in_team_lead_id), team_lead_id),
        modified_id = in_app_user_id,
        status = IFNULL(in_status, status)
WHERE
        company_id = in_company_id;

SET
        error_code = 0;

END $$ 
DELIMITER ;
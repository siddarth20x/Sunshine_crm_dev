-- call stage.get_download_lead_template(@err,2);

DROP PROCEDURE IF EXISTS `stage`.`get_download_lead_template`;
DELIMITER $$
CREATE PROCEDURE `stage`.`get_download_lead_template`(OUT error_code INT,IN in_company_id BIGINT)

BEGIN
SET error_code = -2;
SET @get_q = '
 SELECT "" AS "S No.",
	"" AS "FD No.",
	"" AS "Mgnt No.",
	"" AS "Company Name",
	"" AS "Name",
	"" AS "Designation Name",
	"" AS "Email",
	"" AS "Website",
	"" AS "Group",
	"" AS "Industry 1",
	"" AS "Sub Industry 1",
	"" AS "Industry 2",
	"" AS "Sub Industry 2",
	"" AS "Industry 3",
	"" AS "Sub Industry 3",
	"" AS "Sector",
	"" AS "Level of Office",
	"" AS "Company Entity",
	"" AS "Company Type",
	"" AS "Est. Total Turnover",
	"" AS "Est. No. Of Emp.",
	"" AS "Address Line 1",
	"" AS "Address Line 2",
	"" AS "City",
	"" AS "State",
	"" AS "Pin Code",
	"" AS "Stdcode",
	"" AS "Phone",
	"" AS "Company Code"
 FROM DUAL';
 

PREPARE stmt FROM @get_q;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET error_code=0;
 END$$
 DELIMITER ;

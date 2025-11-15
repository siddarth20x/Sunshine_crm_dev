-- This function will return the leads associated to the user
-- SELECT user.fn_get_user_leads_id_list(9,1);
-- SELECT user.fn_get_user_leads_id_list(8,1);
-- SELECT user.fn_get_user_leads_id_list(18,1);
-- SELECT user.fn_get_user_leads_id_list(29,1);

DELIMITER $$

DROP FUNCTION IF EXISTS user.fn_get_user_leads_id_list$$

CREATE FUNCTION user.fn_get_user_leads_id_list( in_app_user_id BIGINT , in_company_id BIGINT )

RETURNS LONGTEXT DETERMINISTIC

BEGIN

DECLARE v_leads_id_list LONGTEXT;
DECLARE v_user_id BIGINT;
DECLARE v_role_id BIGINT;
DECLARE v_role_name VARCHAR(100);

SET v_leads_id_list = '';

-- IF APP USER ID IS NOT NULLL AND COMPANY ID IS NULL

IF in_app_user_id IS NOT NULL AND in_company_id IS NULL THEN
SELECT DISTINCT u.user_id,
       r.role_id,
       r.role_name
  INTO v_user_id,
       v_role_id,
       v_role_name
  FROM user.user_role_company urc
  JOIN user.user u
    ON u.user_id = urc.user_id
   AND urc.user_id = in_app_user_id
  JOIN user.role r
    ON urc.role_id = r.role_id;

IF v_role_name = "AGENT" THEN    
SELECT GROUP_CONCAT(l.lead_id) AS leads_id
  INTO v_leads_id_list
  FROM crm.leads l
 WHERE l.assigned_to = in_app_user_id;

ELSEIF v_role_name = "TEAM LEAD" THEN    
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM (
SELECT l.lead_id  
  FROM user.user u
  JOIN crm.leads l
    ON u.user_id = l.assigned_to
   AND u.reporting_to_id = in_app_user_id
 UNION
 SELECT l.lead_id  
   FROM user.user u
   JOIN crm.leads l
    ON u.user_id = l.assigned_to
   AND l.assigned_to = in_app_user_id
   )un;

ELSEIF v_role_name = "TEAM MANAGER" THEN    
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM ( 
   SELECT l.lead_id
     FROM crm.leads l
     JOIN org.company c
       ON l.company_id = c.company_id
      AND c.team_manager_id = in_app_user_id
    UNION
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND u.reporting_to_id = in_app_user_id
    UNION 
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_by
      AND u.reporting_to_id = in_app_user_id 
    UNION
   SELECT l.lead_id  
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND l.assigned_to = in_app_user_id
    UNION
   SELECT l.lead_id
     FROM user.user u1
     JOIN user.user u2
       ON u2.reporting_to_id = u1.user_id
     JOIN crm.leads l
       ON l.assigned_to = u2.user_id
      WHERE u1.reporting_to_id = in_app_user_id
      ) un;
ELSEIF v_role_name = "SENIOR MANAGER" THEN    
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM (
   SELECT l.lead_id
     FROM crm.leads l
     JOIN org.company c
       ON l.company_id = c.company_id
      AND c.senior_manager_id = in_app_user_id
    UNION
   SELECT l.lead_id
     FROM crm.leads l
     JOIN org.company c
       ON l.company_id = c.company_id
      AND c.team_manager_id = in_app_user_id
    UNION
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND u.reporting_to_id = in_app_user_id
    UNION 
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_by
      AND u.reporting_to_id = in_app_user_id 
    UNION
   SELECT l.lead_id  
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND l.assigned_to = in_app_user_id
    UNION
   -- Get leads from Team Leads who report to Team Managers (2 levels down)
   SELECT l.lead_id
     FROM user.user u1  -- Team Managers
     JOIN user.user u2  -- Team Leads
       ON u2.reporting_to_id = u1.user_id
     JOIN crm.leads l
       ON l.assigned_to = u2.user_id
      WHERE u1.reporting_to_id = in_app_user_id
    UNION
   -- Get leads from Agents who report to Team Leads who report to Team Managers (3 levels down)
   SELECT l.lead_id
     FROM user.user u1  -- Team Managers
     JOIN user.user u2  -- Team Leads
       ON u2.reporting_to_id = u1.user_id
     JOIN user.user u3  -- Agents
       ON u3.reporting_to_id = u2.user_id
     JOIN crm.leads l
       ON l.assigned_to = u3.user_id
      WHERE u1.reporting_to_id = in_app_user_id
      ) un;      
ELSE
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM crm.leads l;
END IF;

RETURN v_leads_id_list;
END IF;

-- IF APP USER ID IS NOT NULLL AND COMPANY ID IS NOT NULL
IF in_app_user_id IS NOT NULL AND in_company_id IS NOT NULL THEN
SELECT DISTINCT u.user_id,
       r.role_id,
       r.role_name
  INTO v_user_id,
       v_role_id,
       v_role_name
  FROM user.user_role_company urc
  JOIN user.user u
    ON u.user_id = urc.user_id
   AND urc.user_id = in_app_user_id
  JOIN user.role r
    ON urc.role_id = r.role_id;

IF v_role_name = "AGENT" THEN    
SELECT GROUP_CONCAT(l.lead_id) AS leads_id
  INTO v_leads_id_list
  FROM crm.leads l
 WHERE l.assigned_to = in_app_user_id 
   AND l.company_id = in_company_id; 

ELSEIF v_role_name = "TEAM LEAD" THEN    
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM (
SELECT l.lead_id  
  FROM user.user u
  JOIN crm.leads l
    ON u.user_id = l.assigned_to
   AND u.reporting_to_id = in_app_user_id
   AND l.company_id = in_company_id
 UNION
 SELECT l.lead_id  
   FROM user.user u
   JOIN crm.leads l
    ON u.user_id = l.assigned_to
   AND l.assigned_to = in_app_user_id
   AND l.company_id = in_company_id
   )un;

ELSEIF v_role_name = "TEAM MANAGER" THEN    
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM ( 
   SELECT l.lead_id
     FROM crm.leads l
     JOIN org.company c
       ON l.company_id = c.company_id
      AND c.team_manager_id = in_app_user_id
      AND l.company_id = in_company_id
    UNION
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND u.reporting_to_id = in_app_user_id
      AND l.company_id = in_company_id
    UNION 
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_by
      AND u.reporting_to_id = in_app_user_id
      AND l.company_id = in_company_id
    UNION
   SELECT l.lead_id  
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND l.assigned_to = in_app_user_id 
      AND l.company_id = in_company_id
    UNION
   SELECT l.lead_id
     FROM user.user u1
     JOIN user.user u2
       ON u2.reporting_to_id = u1.user_id
     JOIN crm.leads l
       ON l.assigned_to = u2.user_id
      AND l.company_id = in_company_id
      WHERE u1.reporting_to_id = in_app_user_id
      ) un;
ELSEIF v_role_name = "SENIOR MANAGER" THEN    
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM (
   SELECT l.lead_id
     FROM crm.leads l
     JOIN org.company c
       ON l.company_id = c.company_id
      AND c.senior_manager_id = in_app_user_id
      AND l.company_id = in_company_id
    UNION
   SELECT l.lead_id
     FROM crm.leads l
     JOIN org.company c
       ON l.company_id = c.company_id
      AND c.team_manager_id = in_app_user_id
      AND l.company_id = in_company_id
    UNION
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND u.reporting_to_id = in_app_user_id
      AND l.company_id = in_company_id
    UNION 
   SELECT l.lead_id
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_by
      AND u.reporting_to_id = in_app_user_id 
      AND l.company_id = in_company_id
    UNION
   SELECT l.lead_id  
     FROM user.user u
     JOIN crm.leads l
       ON u.user_id = l.assigned_to
      AND l.assigned_to = in_app_user_id     
      AND l.company_id = in_company_id
    UNION
   -- Get leads from Team Leads who report to Team Managers (2 levels down)
   SELECT l.lead_id
     FROM user.user u1  -- Team Managers
     JOIN user.user u2  -- Team Leads
       ON u2.reporting_to_id = u1.user_id
     JOIN crm.leads l
       ON l.assigned_to = u2.user_id
      AND l.company_id = in_company_id
      WHERE u1.reporting_to_id = in_app_user_id
    UNION
   -- Get leads from Agents who report to Team Leads who report to Team Managers (3 levels down)
   SELECT l.lead_id
     FROM user.user u1  -- Team Managers
     JOIN user.user u2  -- Team Leads
       ON u2.reporting_to_id = u1.user_id
     JOIN user.user u3  -- Agents
       ON u3.reporting_to_id = u2.user_id
     JOIN crm.leads l
       ON l.assigned_to = u3.user_id
      AND l.company_id = in_company_id
      WHERE u1.reporting_to_id = in_app_user_id
      ) un;      
ELSE
SELECT GROUP_CONCAT(lead_id) AS leads_id
  INTO v_leads_id_list
  FROM crm.leads l
 WHERE l.company_id = in_company_id;
END IF;

RETURN v_leads_id_list;
END IF;

END$$
DELIMITER ;

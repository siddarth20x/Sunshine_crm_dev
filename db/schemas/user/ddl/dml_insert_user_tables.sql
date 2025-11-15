###############################################################################
# PURPOSE : INITIAL LOOKUP TABLE SETUP DML SCRIPT
# CREATED BY : RAVIKIRAN PRABHU
# CREATED ON : 30-MAY-2024
###############################################################################

INSERT INTO user.user (
       first_name,
       last_name,
       email_address,
       password,
       phone,
       is_admin,
       status,
       created_id,
       created_dtm,
       modified_id,
       modified_dtm
       ) 
VALUES 
      ('super_admin',
       'super_admin',
       'superadmin@sunshine.com',
       '$2b$10$G738hOLN5jCpzjPvJqJ0M.cUjmgg0FO1FLV9w7HBsJD6gBC46FuXC',
       '+919898989898',
       1,
       1,
       1,
       CURRENT_TIMESTAMP,
       1,
       CURRENT_TIMESTAMP),
      ('app_admin',
       'app_admin',
       'appadmin@sunshine.com',
       '$2b$10$Wo5o2rhd6NrQmZgzVnfJvupB6q5RfkE3doeq.qyyUSucRNYowebsa',
       '+918989898989',
       1,
       1,
       1,
       CURRENT_TIMESTAMP,
       1,
       CURRENT_TIMESTAMP);

-- seed script for admin user access to all companies AND modules 

INSERT INTO user.user_role_company (
       user_id,
       role_id,
       company_id,
       module_id,
       privilege_list,
       privilege_mask,
       group_list,
       group_mask,
       status,
       created_id,
       created_dtm,
       modified_id,
       modified_dtm)
SELECT u.user_id,
       r.role_id,
       c.company_id,
       m.module_id,
       '1,2,4,8,16,32' as privilege_list,
       63 as privilege_mask,
       '1' as group_list,
       1 as group_mask,
       1 as status,
       1 as created_id,
       CURRENT_TIMESTAMP,
       1 as modified_id,
       CURRENT_TIMESTAMP
  FROM user.user u,
       user.role r,
       org.company c,
       user.module m
 WHERE email_address = 'superadmin@sunshine.com'
   AND c.company_code IN ('SUN')
   AND r.role_name = 'SUPERUSER'
 UNION
 SELECT u.user_id,
        r.role_id,
        c.company_id,
        m.module_id,
        '1,2,4,8,16,32' as privilege_list,
        63 as privilege_mask,
        '1' as group_list,
        1 as group_mask,       
        1 as status,
        1 as created_id,
        CURRENT_TIMESTAMP,
        1 as modified_id,
        CURRENT_TIMESTAMP
   FROM user.user u,
        user.role r,
        org.company c,
        user.module m
  WHERE email_address IN ( 'appadmin@sunshine.com')
    AND c.company_code IN ('SUN')
    AND r.role_name = 'ADMIN'
ORDER BY user_id, role_id, company_id, module_id; 

COMMIT;
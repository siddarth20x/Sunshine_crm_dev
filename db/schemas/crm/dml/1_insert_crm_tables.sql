-- SOURCE_TYPE
INSERT INTO crm.source_type (source_type_name,status,created_id,modified_id) VALUES ('WEBSITE',1,2,2);
INSERT INTO crm.source_type (source_type_name,status,created_id,modified_id) VALUES ('EXTERNAL FIELDS',1,2,2);
INSERT INTO crm.source_type (source_type_name,status,created_id,modified_id) VALUES ('SOCIAL MEDIA',1,2,2);
INSERT INTO crm.source_type (source_type_name,status,created_id,modified_id) VALUES ('WORD OF MOUTH',1,2,2);
INSERT INTO crm.source_type (source_type_name,status,created_id,modified_id) VALUES ('EXTERNAL DATA PROVIDERS',1,2,2);
INSERT INTO crm.source_type (source_type_name,status,created_id,modified_id) VALUES ('OTHERS',1,2,2);
-- LEAD_STATUS_TYPE
INSERT INTO crm.lead_status_type (lead_status_type_name, status, created_id, modified_id) VALUES ("OPEN",1,2,2);
INSERT INTO crm.lead_status_type (lead_status_type_name, status, created_id, modified_id) VALUES ("EMAIL SENT",1,2,2);
INSERT INTO crm.lead_status_type (lead_status_type_name, status, created_id, modified_id) VALUES ("CONTACTED",1,2,2);
INSERT INTO crm.lead_status_type (lead_status_type_name, status, created_id, modified_id) VALUES ("CONVERTED",1,2,2);
INSERT INTO crm.lead_status_type (lead_status_type_name, status, created_id, modified_id) VALUES ("REJECTED",1,2,2);
INSERT INTO crm.lead_status_type (lead_status_type_name, status, created_id, modified_id) VALUES ("CLOSED",1,2,2);
-- TEMPLATE;
INSERT INTO crm.template_type (
       template_name, 
       template_subject, 
       template_html_name, 
       sender_logo_url,
       sender_email_id,
       cc_email_id,
       reply_to_email_id,
       mail_api_url,
       unsubscribe_api_url,
       status, 
       created_id, 
       modified_id) 
SELECT "PAS_LEAD_EMAIL_TEMPLATE_1",
       "Leasing and Renting of Computers, Laptops and other IT assets",
       "send-lead-email-pas.html",
       "https://firebasestorage.googleapis.com/v0/b/ezybizdev-fabb3.appspot.com/o/logo%2FPrime_Asset_Source_logo.jpg?alt=media&token=f81d1715-5bde-43c6-8d1c-50ad4f2a8e8b",
       '"Prime Assetsource"<rentals@primeassetsource.com>',
       "rentals@primeassetsource.com",
       "rentals@primeassetsource.com",
       "https://asia-south1-swiftbiz-test-server.cloudfunctions.net/sendEmailNotification",
       "https://asia-south1-swiftbiz-test-server.cloudfunctions.net/unsubscribe",
       1,
       2,
       2
  FROM DUAL
UNION 
SELECT "CS_LEAD_EMAIL_TEMPLATE_1",
       "IT and Digital Services For Your Business",
       "send-lead-email-cs.html",
       "https://firebasestorage.googleapis.com/v0/b/ezybizdev-fabb3.appspot.com/o/logo%2FNew_codeSwiftLogo.jpeg?alt=media&token=4ec50504-702d-44aa-bcc5-b70803482650",
       '"Codeswift Technologies"<webadmin@codeswift.in>',
       "info@codeswift.in",
       "info@codeswift.in",
       "https://asia-south1-swiftbiz-test-server.cloudfunctions.net/sendEmailNotification",
       "https://asia-south1-swiftbiz-test-server.cloudfunctions.net/unsubscribe",
       1,
       2,
       2
  FROM DUAL;
  
-- INSERT INTO crm.lead_company_type
--        (lead_company_type_name, 
--         status, 
--         created_id, 
--         modified_id)
-- SELECT comp.type_name,
--        1 AS status,
--        2 AS created_id,
--        2 AS modified_id
--  FROM
-- (SELECT "INDIAN" AS type_name FROM DUAL UNION 
-- SELECT "LLP" FROM DUAL UNION 
-- SELECT "FOREIGN" FROM DUAL) comp;

COMMIT;
        
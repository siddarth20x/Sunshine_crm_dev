-- Run Main DDL First
ALTER TABLE crm.leads 
MODIFY nationality VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY emirates_id_number VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY employer_details VARCHAR(200) NULL;
ALTER TABLE crm.leads 
MODIFY designation VARCHAR(200) NULL;
ALTER TABLE crm.leads 
MODIFY company_contact VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY father_name VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY mother_name VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY pli_status VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY execution_status VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY bucket_status VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY passport_number VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY agreement_id VARCHAR(100) NULL;
ALTER TABLE crm.leads 
MODIFY banker_name VARCHAR(200) NOT NULL;
ALTER TABLE crm.mol_check ADD COLUMN task_id BIGINT AFTER lead_id;
ALTER TABLE crm.sq_check ADD COLUMN task_id BIGINT AFTER lead_id;
ALTER TABLE crm.tracing_details ADD COLUMN task_id BIGINT AFTER lead_id;
ALTER TABLE crm.web_tracing_details ADD COLUMN task_id BIGINT AFTER lead_id;
ALTER TABLE crm.visa_check ADD COLUMN task_id BIGINT AFTER lead_id;
ALTER TABLE crm.contact ADD COLUMN task_id BIGINT AFTER lead_id;
ALTER TABLE crm.address ADD COLUMN task_id BIGINT AFTER lead_id;
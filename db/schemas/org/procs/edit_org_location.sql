-- call org.edit_org_location(@err,0,1,1,2,'brch_offc','555-555-5555','415','888','888','blr','oo','kar','ind','560069','AC',@ola);

DROP PROCEDURE IF EXISTS org.edit_org_location;

DELIMITER $$
CREATE PROCEDURE org.edit_org_location(OUT error_code INT,
                                                IN in_app_user_id BIGINT,
                                                IN in_address_id BIGINT,
                                                IN in_company_id BIGINT,
                                                IN in_location_id BIGINT,
                                                IN in_location_name VARCHAR(45),
                                                IN in_company_gst VARCHAR(45),
                                                IN in_address_name VARCHAR(100),
                                                IN in_address_line_1 VARCHAR(100),
                                                IN in_address_line_2 VARCHAR(100),
                                                IN in_address_line_3 VARCHAR(100),
                                                IN in_city VARCHAR(100),
                                                IN in_state VARCHAR(100), 
                                                IN in_country VARCHAR(100),
                                                IN in_zipcode  VARCHAR(45),
                                                IN in_address_type_id MEDIUMINT,
                                                IN in_edit_action VARCHAR(3),
                                                OUT out_location_address_id BIGINT)                                               
 
BEGIN

SET error_code = -2;


-- If EA field is Address Change => address table status '0' 

IF ( in_edit_action = 'AC') THEN

UPDATE org.address a 
   SET a.STATUS = 0
 WHERE a.address_id = in_address_id ;


UPDATE org.location_address la
   SET la.STATUS = 0
 WHERE (la.address_id = in_address_id AND la.location_id = in_location_id) ;


-- create new location 

call org.create_org_location(@err,0,1,3,'locnamenew','addname','addline1','addline2','addline3','city','state','560069','111',1,@olaid);

-- If EA field is delete Location => status of Location table = 0

ELSEIF ( in_edit_action = 'DL' ) THEN

UPDATE org.location l 
   SET l.STATUS = 0
 WHERE (l.location_id = in_location_id );

UPDATE org.location_address la
   SET la.STATUS = 0
 WHERE (la.location_id = in_location_id );

UPDATE org.address a
   SET a.STATUS = 0
 WHERE (a.address_id = in_address_id );


END IF ;


SET error_code=0;

END$$
DELIMITER ;

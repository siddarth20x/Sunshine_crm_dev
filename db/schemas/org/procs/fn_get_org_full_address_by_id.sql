-- This function will return the amount in words for the input number
-- SELECT org.fn_get_org_full_address_by_id(1);

DELIMITER $$

DROP FUNCTION IF EXISTS org.fn_get_org_full_address_by_id$$

CREATE FUNCTION org.fn_get_org_full_address_by_id( in_address_id BIGINT )

RETURNS VARCHAR(5000) DETERMINISTIC

BEGIN

DECLARE v_full_address_with_id VARCHAR(5000);

SET v_full_address_with_id = '';

 SELECT CONCAT(a.address_name, " ",a.address_line_1, " ",a.address_line_2, " ",a.city, " ",a.state, " ", a.country, "-", a.address_id ) AS address_with_id
   INTO v_full_address_with_id
   FROM org.location l,
        org.address a
  WHERE a.location_id = l.location_id
    AND a.address_id = in_address_id
    AND a.status = 1
    AND l.status = 1;

RETURN v_full_address_with_id;

END$$
DELIMITER ;

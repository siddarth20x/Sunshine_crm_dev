-- This function will return the amount in words for the input number

DELIMITER $$

DROP FUNCTION IF EXISTS `user`.`fn_get_number_from_csv`$$

CREATE FUNCTION `user`.`fn_get_number_from_csv`( `in_csv_list` VARCHAR(1000) ) 
	
RETURNS INT DETERMINISTIC

BEGIN

DECLARE v_counter MEDIUMINT;
DECLARE v_curr_num VARCHAR(100);
DECLARE v_cnt MEDIUMINT;
DECLARE v_sum INT;

SET v_counter = 1;
SET v_cnt = 0;
SET v_curr_num = 0;
SET v_sum = 0;

SELECT LENGTH(in_csv_list) - LENGTH(REPLACE(in_csv_list, ',', '')) + 1 
  INTO v_cnt
  FROM dual;

WHILE v_counter <= v_cnt DO  

   SET v_curr_num = SUBSTRING_INDEX(SUBSTRING_INDEX(in_csv_list, ',', v_counter), ',', -1);
   SET v_sum = v_sum + CAST(IFNULL(v_curr_num, 0) AS UNSIGNED);
   SET v_counter = v_counter + 1;

END WHILE;

RETURN v_sum;

END$$

DELIMITER ;

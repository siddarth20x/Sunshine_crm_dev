SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `stage`.`file_upload`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `stage`.`file_upload` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `stage`.`file_upload` (
  `file_upload_id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_type` VARCHAR(20) NOT NULL COMMENT '\'csv\',\'pdf\' etc',
  `file_name` VARCHAR(1000) NULL,
  `file_url` VARCHAR(1000) NULL,
  `company_id` BIGINT NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_id` BIGINT NOT NULL,
  `created_dtm` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_id` BIGINT NOT NULL,
  `modified_dtm` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_upload_id`))
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE INDEX `i_created_id` ON `stage`.`file_upload` (`created_id` ASC) ;

SHOW WARNINGS;
CREATE INDEX `i_created_id_company_id` ON `stage`.`file_upload` (`created_id` ASC, `company_id` ASC, `created_dtm` ASC) ;

SHOW WARNINGS;
CREATE INDEX `i_file_name` ON `stage`.`file_upload` (`file_name` ASC) ;

SHOW WARNINGS;

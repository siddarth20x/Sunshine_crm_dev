CREATE DATABASE  IF NOT EXISTS `crm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `crm`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: crm
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `lead_id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `lead_status_type_id` mediumint NOT NULL,
  `template_type_id` mediumint NOT NULL,
  `assignee_id` bigint NOT NULL,
  `assigned_date` timestamp NOT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `product_type` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `product_account_number` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `agreement_id` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `business_name` varchar(1000) COLLATE utf8mb4_bin DEFAULT NULL,
  `customer_name` varchar(1000) COLLATE utf8mb4_bin NOT NULL,
  `allocation_status` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `customer_id` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `passport_number` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `date_of_birth` timestamp NOT NULL,
  `bucket_status` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `vintage` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `date_of_woff` timestamp NULL DEFAULT NULL,
  `nationality` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `emirates_id_number` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `credit_limit` float NOT NULL,
  `total_outstanding_amount` float NOT NULL,
  `principal_outstanding_amount` float NOT NULL,
  `employer_details` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `designation` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `company_contact` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `home_country_number` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `mobile_number` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `email_id` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `minimum_payment` float NOT NULL,
  `ghrc_offer_1` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `ghrc_offer_2` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `ghrc_offer_3` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `withdraw_date` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `home_country_address` varchar(500) COLLATE utf8mb4_bin NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `pincode` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `father_name` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `mother_name` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `spouse_name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `last_paid_amount` float DEFAULT NULL,
  `last_paid_date` timestamp NULL DEFAULT NULL,
  `pli_status` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `execution_status` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_id` bigint NOT NULL,
  `created_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_id` bigint NOT NULL,
  `modified_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`lead_id`),
  KEY `fk_leads_lead_status_type_idx` (`lead_status_type_id`),
  KEY `fk_leads_template_type_idx` (`template_type_id`),
  KEY `fk_leads_lead_status_type` (`lead_status_type_id`),
  KEY `fk_leads_template_type` (`template_type_id`),
  KEY `fk_leads_company_type_idx` (`company_id`),
  CONSTRAINT `fk_leads_lead_status_type` FOREIGN KEY (`lead_status_type_id`) REFERENCES `lead_status_type` (`lead_status_type_id`),
  CONSTRAINT `fk_leads_template_type` FOREIGN KEY (`template_type_id`) REFERENCES `template_type` (`template_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-14 11:16:08

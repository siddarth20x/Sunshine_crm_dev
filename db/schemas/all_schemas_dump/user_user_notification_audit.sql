CREATE DATABASE  IF NOT EXISTS `user` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_bin */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `user`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: user
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
-- Table structure for table `user_notification_audit`
--

DROP TABLE IF EXISTS `user_notification_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_audit` (
  `user_notification_audit_id` bigint NOT NULL AUTO_INCREMENT,
  `user_notification_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `notification_type_id` int DEFAULT NULL,
  `notification_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `notification_message` text COLLATE utf8mb3_bin,
  `notification_effective_from` datetime DEFAULT NULL,
  `notification_effective_to` datetime DEFAULT NULL,
  `notification_lifespan_days` tinyint DEFAULT NULL,
  `notification_publish_flag` tinyint DEFAULT NULL,
  `acknowledgment_required` tinyint DEFAULT NULL,
  `notification_acknowledged_on` timestamp NULL DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  `created_id` bigint DEFAULT NULL,
  `created_dtm` timestamp NULL DEFAULT NULL,
  `modified_id` bigint DEFAULT NULL,
  `modified_dtm` timestamp NULL DEFAULT NULL,
  `audit_action` varchar(5) COLLATE utf8mb3_bin DEFAULT NULL,
  `audit_dtm` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_notification_audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification_audit`
--

LOCK TABLES `user_notification_audit` WRITE;
/*!40000 ALTER TABLE `user_notification_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notification_audit` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-14 11:16:09

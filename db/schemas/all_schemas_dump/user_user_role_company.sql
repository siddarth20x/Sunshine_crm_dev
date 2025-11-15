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
-- Table structure for table `user_role_company`
--

DROP TABLE IF EXISTS `user_role_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role_company` (
  `user_role_company_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  `company_id` bigint NOT NULL,
  `module_id` int NOT NULL,
  `privilege_list` varchar(1000) COLLATE utf8mb3_bin NOT NULL,
  `privilege_mask` mediumint NOT NULL DEFAULT '0',
  `group_list` varchar(1000) COLLATE utf8mb3_bin DEFAULT NULL,
  `group_mask` mediumint DEFAULT NULL,
  `status` tinyint NOT NULL,
  `created_id` bigint NOT NULL,
  `created_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_id` bigint NOT NULL,
  `modified_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_role_company_id`),
  UNIQUE KEY `u_user_company_module` (`user_id`,`company_id`,`module_id`),
  KEY `fk_urc_role` (`role_id`),
  KEY `fk_urc_user_idx` (`user_id`),
  KEY `fk_urc_module_idx` (`module_id`),
  CONSTRAINT `fk_urc_module` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`),
  CONSTRAINT `fk_urc_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`),
  CONSTRAINT `fk_urc_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role_company`
--

LOCK TABLES `user_role_company` WRITE;
/*!40000 ALTER TABLE `user_role_company` DISABLE KEYS */;
INSERT INTO `user_role_company` VALUES (1,2,3,1,1,'8',8,NULL,0,1,123,'2024-04-30 09:56:10',123,'2024-04-30 13:07:18'),(2,2,3,1,2,'8',8,NULL,0,1,123,'2024-04-30 10:03:58',123,'2024-05-02 07:22:28'),(5,2,3,1,3,'8,1',9,NULL,0,1,123,'2024-04-30 10:07:25',2,'2024-05-07 05:16:30'),(9,2,3,1,37,'1',1,NULL,0,1,123,'2024-05-02 06:56:33',123,'2024-05-02 12:49:24'),(10,2,3,1,38,'1',1,NULL,0,1,123,'2024-05-02 06:57:47',123,'2024-05-03 09:51:39'),(12,2,3,1,43,'2,4,8',14,NULL,0,1,123,'2024-05-02 12:49:24',123,'2024-05-02 13:06:00'),(17,2,3,1,44,'1,2,4,8,16,32',63,NULL,0,1,123,'2024-05-03 06:06:20',123,'2024-05-03 06:06:20'),(20,3,3,1,38,'2',2,NULL,0,1,123,'2024-05-03 14:18:43',123,'2024-05-03 14:19:01'),(22,3,3,1,44,'8',8,NULL,0,1,123,'2024-05-03 14:19:31',123,'2024-05-03 14:19:31'),(23,3,3,1,1,'1,2,4,8',15,NULL,0,1,123,'2024-05-03 19:10:14',123,'2024-05-03 19:23:42'),(25,3,1,1,2,'1,2,8',11,NULL,0,1,123,'2024-05-03 19:11:12',123,'2024-05-06 06:46:01'),(28,2,3,1,4,'16',16,NULL,0,1,2,'2024-05-07 05:04:16',2,'2024-05-10 17:46:34'),(29,2,3,1,16,'1,2,16,8',27,NULL,0,1,2,'2024-05-07 05:11:11',2,'2024-05-07 05:11:11');
/*!40000 ALTER TABLE `user_role_company` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-14 11:16:10

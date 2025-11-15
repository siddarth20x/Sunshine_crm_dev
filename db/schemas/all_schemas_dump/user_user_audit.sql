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
-- Table structure for table `user_audit`
--

DROP TABLE IF EXISTS `user_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_audit` (
  `user_audit_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `designation` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `email_address` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `password` varchar(128) COLLATE utf8mb3_bin DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb3_bin DEFAULT NULL,
  `otp` mediumint DEFAULT NULL,
  `mac_address` varchar(1000) COLLATE utf8mb3_bin DEFAULT NULL,
  `allowed_ip` varchar(45) COLLATE utf8mb3_bin DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `last_login_ip_address` varchar(45) COLLATE utf8mb3_bin DEFAULT NULL,
  `is_admin` tinyint DEFAULT NULL,
  `image_url` text COLLATE utf8mb3_bin,
  `status` tinyint DEFAULT NULL,
  `created_id` bigint DEFAULT NULL,
  `created_dtm` timestamp NULL DEFAULT NULL,
  `modified_id` bigint DEFAULT NULL,
  `modified_dtm` timestamp NULL DEFAULT NULL,
  `audit_action` varchar(5) COLLATE utf8mb3_bin DEFAULT NULL,
  `audit_dtm` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_audit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_audit`
--

LOCK TABLES `user_audit` WRITE;
/*!40000 ALTER TABLE `user_audit` DISABLE KEYS */;
INSERT INTO `user_audit` VALUES (1,2,'ADMIN','Codeswift','Technologies','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-24 07:23:40',123,'2024-04-24 07:23:40','AU','2024-04-30 12:31:37'),(2,3,'Super Admin','Kishore','D','kishor.p@codeswift.in','1234567899','1234567890',NULL,'de: 43: 23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-25 12:47:13',123,'2024-04-25 12:47:13','AU','2024-05-07 06:02:31'),(3,1,'sales manager','first_name','last_name','in1345@gmail.com','in12345_in23','9898989989',3323,'de:43:23',NULL,'2024-04-23 11:12:14',NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-23 11:00:39',123,'2024-04-23 12:31:09','AU','2024-05-07 06:22:13'),(4,1,'AGENT','first_name','last_name','in1345@gmail.com','in12345_in23','9898989989',3323,'de:43:23',NULL,'2024-05-07 06:21:47',NULL,0,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-23 11:00:39',1,'2024-05-07 06:22:13','AU','2024-05-07 06:22:38'),(5,1,'AGENT','first_name','last_name','in1345@gmail.com','in12345_in23','9898989989',3323,'de:43:23',NULL,'2024-05-07 06:21:47',NULL,0,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-23 11:00:39',1,'2024-05-07 06:22:13','AU','2024-05-07 06:26:52'),(6,3,'ADMIN','Kishore','D','kishor.p@codeswift.in','password','1234567890',1234,'de: 43: 23',NULL,'2024-05-07 06:02:05',NULL,1,'www.google.com',1,123,'2024-04-25 12:47:13',3,'2024-05-07 06:02:31','AU','2024-05-07 06:58:37'),(7,3,'ADMIN','Kishore','D','kishor.p@codeswift.in','password','1234567890',1234,'de: 43: 23',NULL,'2024-05-07 06:02:05',NULL,1,'www.google.com',0,123,'2024-04-25 12:47:13',3,'2024-05-07 06:58:37','AU','2024-05-07 07:16:49'),(8,2,'ADMIN','Codeswift','Technologies','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-24 07:23:40',123,'2024-04-30 12:31:37','AU','2024-05-07 07:18:29'),(9,2,'ADMIN','Codeswift','Technologies','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',0,123,'2024-04-24 07:23:40',2,'2024-05-07 07:18:29','AU','2024-05-07 07:18:38'),(10,3,'ADMIN','Kishore','D','kishor.p@codeswift.in','password','1234567890',1234,'de: 43: 23',NULL,'2024-05-07 06:02:05',NULL,1,'www.google.com',1,123,'2024-04-25 12:47:13',3,'2024-05-07 07:16:49','AU','2024-05-07 07:24:54'),(11,2,'ADMIN','Codeswift','Technologies','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-24 07:23:40',2,'2024-05-07 07:18:38','AU','2024-05-07 10:57:07'),(12,2,'AGENT','Code','t','ca@codeswift.in','$2b$10$W./Qnp7IppC/E/DD5rbFbujBQhCmQoWx32xsLYW7VZ3iToDegRV/u','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-24 07:23:40',1234,'2024-05-07 10:57:07','AU','2024-05-07 11:01:32'),(13,4,'Team Lead','Vikas','V','vikas@gmail.com','1234','123456789',NULL,'de: 43: 23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-25 13:11:36',123,'2024-04-25 13:11:36','AU','2024-05-07 11:02:37'),(14,2,'AGENT','Code','t','ca@codeswift.in','1234','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-24 07:23:40',1234,'2024-05-07 11:01:32','AU','2024-05-07 11:02:48'),(15,2,'AGENT','Code','t','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-24 07:23:40',1234,'2024-05-07 11:02:48','AU','2024-05-07 11:03:58'),(16,2,'ADMIN','Code','t','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-24 07:23:40',1234,'2024-05-07 11:03:58','AU','2024-05-10 17:18:49'),(17,3,'AGENT','Kishore','D','kishor.p@codeswift.in','password','1234567890',1234,'de: 43: 23',NULL,'2024-05-07 06:02:05',NULL,0,'www.google.com',1,123,'2024-04-25 12:47:13',3,'2024-05-07 07:24:54','AU','2024-05-10 17:18:49'),(18,4,'Team Lead','Vikas','V','vikas@gmail.com','12345','123456789',NULL,'de: 43: 23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-25 13:11:36',123,'2024-05-07 11:02:37','AU','2024-05-10 17:18:49'),(19,5,'Manager','Manjula','Y','manjula@gmail.com','129383656','0987654321',NULL,'de: 43: 23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-25 13:17:55',123,'2024-04-25 13:17:55','AU','2024-05-10 17:18:49'),(20,6,'Manager','Shalini','C','shalini@gmail.com','1233','8383828299191198',NULL,'de: 43: 23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-04-25 13:19:14',123,'2024-04-25 13:19:14','AU','2024-05-10 17:18:49'),(21,8,'AGENT','Code','t','ca@code.in','$2b$10$ezoldjQTxQ1d.whr6/ZyQuQTm7vBJ.Y2yMVleDIlwLbpq3vfUslFC','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-05-07 10:58:22',123,'2024-05-07 10:58:22','AU','2024-05-10 17:18:49'),(22,9,'AGENT','Borosil','Bottle','a@b.in','$2b$10$vnPUzH7qR3IOy0XZstuiwu96BJ6DVxqr9cmS3/f7VEqGnuUhnNqH.','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-05-07 11:07:48',123,'2024-05-07 11:07:48','AU','2024-05-10 17:18:49'),(23,10,'AGENT','Borosils','Bottle','aa@b.in','1234','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'www.google.com',1,123,'2024-05-07 11:23:45',123,'2024-05-07 11:23:45','AU','2024-05-10 17:18:49'),(24,2,'ADMIN','Code','t','ca@codeswift.in','12345','9898989989',NULL,'de:43:23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-24 07:23:40',1234,'2024-05-10 17:18:49','AU','2024-05-10 17:48:47'),(25,5,'Manager','Manjula','Y','manjula@gmail.com','129383656','0987654321',NULL,'de: 43: 23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-25 13:17:55',123,'2024-05-10 17:18:49','AU','2024-05-14 05:26:25');
/*!40000 ALTER TABLE `user_audit` ENABLE KEYS */;
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

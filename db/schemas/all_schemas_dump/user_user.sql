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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `designation` varchar(100) COLLATE utf8mb3_bin DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb3_bin NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb3_bin NOT NULL,
  `email_address` varchar(100) COLLATE utf8mb3_bin NOT NULL,
  `password` varchar(128) COLLATE utf8mb3_bin NOT NULL,
  `phone` varchar(20) COLLATE utf8mb3_bin DEFAULT NULL,
  `otp` mediumint DEFAULT NULL,
  `mac_address` varchar(1000) COLLATE utf8mb3_bin DEFAULT NULL,
  `allowed_ip` varchar(45) COLLATE utf8mb3_bin DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `last_login_ip_address` varchar(45) COLLATE utf8mb3_bin DEFAULT NULL,
  `is_admin` tinyint NOT NULL DEFAULT '0',
  `image_url` text COLLATE utf8mb3_bin,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_id` bigint NOT NULL,
  `created_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_id` bigint NOT NULL,
  `modified_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `u_email_addr` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'DIVISION HEAD','first_name','last_name','in1345@gmail.com','in12345_in23','9898989989',3323,'de:43:23','IP','2024-05-07 06:21:47','new_ip',0,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-23 11:00:39',1,'2024-05-07 06:26:52'),(2,'ADMIN','Digital','Waves','ca@codeswift.in','12345','9898989989',NULL,'de:43:23','103.211.17.122',NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-24 07:23:40',2,'2024-05-10 17:48:47'),(3,'AGENT','Kishore','D','kishor.p@codeswift.in','password','1234567890',1234,'de: 43: 23','103.211.17.20','2024-05-07 06:02:05','103.211.17.20',0,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-25 12:47:13',3,'2024-05-10 17:18:49'),(4,'Team Lead','Vikas','V','vikas@gmail.com','12345','123456789',NULL,'de: 43: 23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-25 13:11:36',123,'2024-05-10 17:18:49'),(5,'ADMIN','Manjula','Y','manjula@gmail.com','129383656','0987654321',NULL,'de: 43: 23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-25 13:17:55',5,'2024-05-14 05:26:25'),(6,'Manager','Shalini','C','shalini@gmail.com','1233','8383828299191198',NULL,'de: 43: 23',NULL,NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-04-25 13:19:14',123,'2024-05-10 17:18:49'),(8,'AGENT','Code','t','ca@code.in','$2b$10$ezoldjQTxQ1d.whr6/ZyQuQTm7vBJ.Y2yMVleDIlwLbpq3vfUslFC','9898989989',NULL,'de:43:23','103.211.17.122',NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-05-07 10:58:22',123,'2024-05-10 17:18:49'),(9,'AGENT','Borosil','Bottle','a@b.in','$2b$10$vnPUzH7qR3IOy0XZstuiwu96BJ6DVxqr9cmS3/f7VEqGnuUhnNqH.','9898989989',NULL,'de:43:23','103.211.17.122',NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-05-07 11:07:48',123,'2024-05-10 17:18:49'),(10,'AGENT','Borosils','Bottle','aa@b.in','1234','9898989989',NULL,'de:43:23','103.211.17.122',NULL,NULL,1,'https://firebasestorage.googleapis.com/v0/b/swiftbiz-prod.appspot.com/o/logo%2FDW_3540.jpg?alt=media&token=87c27c4f-99c4-4584-948e-fb9ea57b7ffb',1,123,'2024-05-07 11:23:45',123,'2024-05-10 17:18:49');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
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

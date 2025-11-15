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
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `module_id` int NOT NULL,
  `module_name` varchar(50) COLLATE utf8mb3_bin NOT NULL,
  `module_desc` varchar(500) COLLATE utf8mb3_bin NOT NULL,
  `module_bit` bigint NOT NULL,
  `route_name` varchar(200) COLLATE utf8mb3_bin NOT NULL,
  `module_icon` varchar(200) COLLATE utf8mb3_bin NOT NULL,
  `module_alias` varchar(200) COLLATE utf8mb3_bin NOT NULL,
  `module_type` varchar(45) COLLATE utf8mb3_bin NOT NULL,
  `module_group` varchar(200) COLLATE utf8mb3_bin NOT NULL,
  `module_group_sort_order` mediumint NOT NULL,
  `module_sort_order` mediumint NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_id` bigint NOT NULL,
  `created_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_id` bigint NOT NULL,
  `modified_dtm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`module_id`),
  UNIQUE KEY `u_module_name` (`module_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES (1,'DASHBOARD','Dashboard',1,'dashboard','dashboard','Dashboard','list','DASHBOARD',1,1,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(2,'ACCOUNT_MANAGEMENT','Account Management',2,'account-management','business','Account Management','list','ACCOUNT_MANAGEMENT',2,2,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(3,'CREATE_ACCOUNT','Create Accounts',4,'account-management/create','safety_divider','Create Account','button','ACCOUNT_MANAGEMENT',2,3,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(4,'ACCOUNTS_UPLOAD','Accounts Upload',8,'account-management/upload','badge','Accounts Upload','button','ACCOUNT_MANAGEMENT',2,4,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(5,'DETAILS','Details Tab under Account',16,'account-management/details','group','Details','tabs','ACCOUNT_MANAGEMENT',3,5,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(6,'PERSONAL_INFORMATION','Personal Details under Details Tab of Account',32,'acount-management/details/personal','settings_applications','Personal Information','sub_tab','ACCOUNT_MANAGEMENT',3,6,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(7,'ADDITIONAL_INFORMATION','Additional Information under Details of Account',64,'acount-management/details/additional-info','pie_chart','Additional Information','sub_tab','ACCOUNT_MANAGEMENT',3,1,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(8,'TASKS_VIEW','Tasks View and Create',128,'account-management/tasks','today','Tasks View','tabs','ACCOUNT_MANAGEMENT',4,2,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(9,'TASKS_CREATE','Tasks Create',256,'account-management/tasks/create','date_range','Tasks Create','button','ACCOUNT_MANAGEMENT',4,3,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(10,'CASE_HISTORY','Case History of Account',512,'account-management/case-history','calendar_today','Case History','tabs','ACCOUNT_MANAGEMENT',5,4,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(11,'FIELD_VISIT_STATUS','Field Visit Status on Account',1024,'account-management/case-history/field-visit','manage_accounts','Field Visit','sub_tab','ACCOUNT_MANAGEMENT',5,1,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(12,'POLICE_EXECUTION_CASE_DETAILS','Police and Execution Case Details of Account',2048,'account-management/case-history/police-exec-details','add_shopping_cart','Police and Execution Case Details','sub_tab','ACCOUNT_MANAGEMENT',5,2,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(13,'LOGS_AND_INTERACTIONS','Logs and Interactions on Account',4096,'account-management/case-history/logs-interactions','live_help','Logs and Interactions','sub_tab','ACCOUNT_MANAGEMENT',5,3,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(14,'FOLLOW_UP_LOGS','Follow Up Logs on Accounts',8192,'account-management/follow-up','receipt','Follow up','tabs','ACCOUNT_MANAGEMENT',6,4,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(15,'DOCUMENTS','Documents',16384,'account-management/documents','credit_score','Documents','tabs','ACCOUNT_MANAGEMENT',7,5,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(16,'ACCOUNT_DOCUMENTS','Account Documents Upload',32768,'account-management/documents/account','filter_1','Account Documents','sub_tab','ACCOUNT_MANAGEMENT',7,1,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(17,'TASK_DOCUMENTS','Task Documents upload',65536,'account-management/documents/tasks','filter_2','Task Documents','sub_tab','ACCOUNT_MANAGEMENT',7,2,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(18,'SQ_CHECK','SQ Check',131072,'account-managementsq-check','filter_3','SQ Check','tabs','ACCOUNT_MANAGEMENT',8,3,1,1,'2024-03-16 07:30:12',1,'2024-03-16 07:30:12'),(35,'CLIENT_MANAGEMENT','Client Management View',262144,'client-management','support_agent','Client Management','list','CLIENT_MANAGEMENT',9,1,1,1,'2024-03-16 07:30:12',1,'2024-05-02 06:52:45'),(36,'CLIENT_MANAGEMENT_CREATE','Client Management Create',524288,'client-management/create','insights','Client Management Create','button','CLIENT_MANAGEMENT',9,0,1,1,'2024-03-16 07:30:12',1,'2024-05-02 06:52:45'),(37,'USER_MANAGEMENT','User Management',1048576,'user-management','person','User Management','list','USER_MANAGEMENT',10,0,1,1,'2024-03-16 07:30:12',1,'2024-05-03 06:05:08'),(38,'USER_MANAGEMENT_CREATE','User Management Create',2097152,'user-management/create','person_add_alt','User Management Create','button','USER_MANAGEMENT',10,0,1,1,'2024-04-23 10:14:10',1,'2024-05-02 06:52:45'),(39,'ACTIVITY_LOGS','Activity Logs',4194304,'activity-logs','sync_alt','Activity Logs','list','ACTIVITY_LOGS',11,0,1,1,'2024-04-23 10:14:10',1,'2024-05-02 06:52:45'),(40,'REPORTS','Reports',8388608,'reports','timeline','Reports','list','REPORTS',12,0,1,1,'2024-04-23 10:14:10',1,'2024-05-02 06:52:45'),(41,'AGENT_WISE_REPORTS','Agent-wise Reports',16777216,'reports/agents','supervised_user_circle','Agent-Wise Reports','sub_list','REPORTS',13,0,1,1,'2024-04-23 10:14:10',1,'2024-05-02 06:52:45'),(42,'ATTANDENCE_REPORTS','Attandence Reports',33554432,'reports/attandence','badge','Attandence Reports','sub_list','REPORTS',13,0,1,1,'2024-04-23 10:14:10',1,'2024-05-02 06:52:45'),(43,'USER_MANAGEMENT_UPLOAD','User Management Uploads',67108864,'user-management/upload','upload','User Management Upload','button','USER_MANAGEMENT',10,0,1,1,'2024-05-02 12:42:54',1,'2024-05-02 12:42:54'),(44,'USER_MANAGEMENT_VIEW','All Users View',134217728,'user-management/view','person','User Management View','screen','USER_MANAGEMENT',10,0,1,1,'2024-05-03 06:04:15',1,'2024-05-03 06:04:15');
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
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

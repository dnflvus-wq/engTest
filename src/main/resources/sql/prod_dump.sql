/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.15-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 61.75.21.224    Database: engtest
-- ------------------------------------------------------
-- Server version	10.11.15-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `exam_answers`
--

DROP TABLE IF EXISTS `exam_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_answers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `exam_id` bigint(20) NOT NULL,
  `question_id` bigint(20) NOT NULL,
  `user_answer` varchar(500) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `ocr_raw_text` varchar(500) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  KEY `idx_exam_answers_exam_id` (`exam_id`),
  CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_answers`
--

LOCK TABLES `exam_answers` WRITE;
/*!40000 ALTER TABLE `exam_answers` DISABLE KEYS */;
INSERT INTO `exam_answers` VALUES
(31,2,31,'a 9-to-5 job',1,NULL,NULL,'2026-01-21 03:02:17'),
(32,2,32,'take a risk',1,NULL,NULL,'2026-01-21 03:02:17'),
(33,2,33,'do a ponytail',1,NULL,NULL,'2026-01-21 03:02:17'),
(34,2,34,'take a passport photo',1,NULL,NULL,'2026-01-21 03:02:17'),
(35,2,35,'take a picture',1,NULL,NULL,'2026-01-21 03:02:17'),
(36,2,36,'take the vaccuming',1,NULL,NULL,'2026-01-21 03:02:17'),
(37,2,37,'do my nails',1,NULL,NULL,'2026-01-21 03:02:17'),
(38,2,38,'take a course',1,NULL,NULL,'2026-01-21 03:02:17'),
(39,2,39,'do my make up',1,NULL,NULL,'2026-01-21 03:02:17'),
(40,2,40,'hang out',1,NULL,NULL,'2026-01-21 03:02:17'),
(41,2,41,'all-rounder at home',1,NULL,NULL,'2026-01-21 03:02:17'),
(42,2,42,'do my homework',1,NULL,NULL,'2026-01-21 03:02:17'),
(43,2,43,'do my stuff',0,NULL,NULL,'2026-01-21 03:02:17'),
(44,2,44,'take a shower',0,NULL,NULL,'2026-01-21 03:02:17'),
(45,2,45,'take supplement',1,NULL,NULL,'2026-01-21 03:02:17'),
(46,2,46,'do me a favor',1,NULL,NULL,'2026-01-21 03:02:17'),
(47,2,47,'get along',1,NULL,NULL,'2026-01-21 03:02:17'),
(48,2,48,'take my bag',1,NULL,NULL,'2026-01-21 03:02:17'),
(49,2,49,'office worker',1,NULL,NULL,'2026-01-21 03:02:17'),
(50,2,50,'take a break',1,NULL,NULL,'2026-01-21 03:02:17'),
(51,2,51,'take action',1,NULL,NULL,'2026-01-21 03:02:17'),
(52,2,52,'a working couple',1,NULL,NULL,'2026-01-21 03:02:17'),
(53,2,53,'personality',1,NULL,NULL,'2026-01-21 03:02:17'),
(54,2,54,'Quit',1,NULL,NULL,'2026-01-21 03:02:17'),
(55,2,55,'take a class',1,NULL,NULL,'2026-01-21 03:02:17'),
(56,2,56,'do the chores',1,NULL,NULL,'2026-01-21 03:02:17'),
(57,2,57,'at work',1,NULL,NULL,'2026-01-21 03:02:17'),
(58,2,58,'an opposite in personality',1,NULL,NULL,'2026-01-21 03:02:17'),
(59,2,59,'take my hand',1,NULL,NULL,'2026-01-21 03:02:17'),
(60,2,60,'get along great',1,NULL,NULL,'2026-01-21 03:02:17'),
(61,3,31,'a 9-to-5 job',1,NULL,NULL,'2026-01-21 03:10:07'),
(62,3,32,'take a risk',1,NULL,NULL,'2026-01-21 03:10:07'),
(63,3,33,'take a ponytail',1,NULL,NULL,'2026-01-21 03:10:07'),
(64,3,34,'take a passport photo',1,NULL,NULL,'2026-01-21 03:10:07'),
(65,3,35,'take a picture',1,NULL,NULL,'2026-01-21 03:10:07'),
(66,3,36,'do the vaccuming',1,NULL,NULL,'2026-01-21 03:10:07'),
(67,3,37,'do my neils',1,NULL,NULL,'2026-01-21 03:10:07'),
(68,3,38,'take a course',1,NULL,NULL,'2026-01-21 03:10:07'),
(69,3,39,'do my make up',1,NULL,NULL,'2026-01-21 03:10:07'),
(70,3,40,'hang out',1,NULL,NULL,'2026-01-21 03:10:07'),
(71,3,41,'all-rounder at home',1,NULL,NULL,'2026-01-21 03:10:07'),
(72,3,42,'do my homework',1,NULL,NULL,'2026-01-21 03:10:07'),
(73,3,43,'do my stuff',1,NULL,NULL,'2026-01-21 03:10:07'),
(74,3,44,'take a shower',1,NULL,NULL,'2026-01-21 03:10:07'),
(75,3,45,'take vitaming',1,NULL,NULL,'2026-01-21 03:10:07'),
(76,3,46,'do me a favor',1,NULL,NULL,'2026-01-21 03:10:07'),
(77,3,47,'get along great',1,NULL,NULL,'2026-01-21 03:10:07'),
(78,3,48,'take my bag',1,NULL,NULL,'2026-01-21 03:10:07'),
(79,3,49,'office worker',1,NULL,NULL,'2026-01-21 03:10:07'),
(80,3,50,'take a break',1,NULL,NULL,'2026-01-21 03:10:07'),
(81,3,51,'take aetion',1,NULL,NULL,'2026-01-21 03:10:07'),
(82,3,52,'a working couple',1,NULL,NULL,'2026-01-21 03:10:07'),
(83,3,53,'personality',1,NULL,NULL,'2026-01-21 03:10:07'),
(84,3,54,'quit',1,NULL,NULL,'2026-01-21 03:10:07'),
(85,3,55,'teke a class',1,NULL,NULL,'2026-01-21 03:10:07'),
(86,3,56,'do the chores',1,NULL,NULL,'2026-01-21 03:10:07'),
(87,3,57,'at work',1,NULL,NULL,'2026-01-21 03:10:07'),
(88,3,58,'an opposit in personality',1,NULL,NULL,'2026-01-21 03:10:07'),
(89,3,59,'take my hand',1,NULL,NULL,'2026-01-21 03:10:07'),
(90,3,60,'get along great',1,NULL,NULL,'2026-01-21 03:10:07'),
(91,4,31,'a 9 to 6 job',1,NULL,NULL,'2026-01-21 03:10:09'),
(92,4,32,'take risk',1,NULL,NULL,'2026-01-21 03:10:09'),
(93,4,33,'take a ponytail',1,NULL,NULL,'2026-01-21 03:10:09'),
(94,4,34,'take a passport photo',1,NULL,NULL,'2026-01-21 03:10:09'),
(95,4,35,'take a photo.',1,NULL,NULL,'2026-01-21 03:10:09'),
(96,4,36,'take the vacuuming',0,NULL,NULL,'2026-01-21 03:10:09'),
(97,4,37,'to my nails',0,NULL,NULL,'2026-01-21 03:10:09'),
(98,4,38,'take a course',1,NULL,NULL,'2026-01-21 03:10:09'),
(99,4,39,'do my makeup',1,NULL,NULL,'2026-01-21 03:10:09'),
(100,4,40,'get along hang out',0,NULL,NULL,'2026-01-21 03:10:09'),
(101,4,41,'all-rounder at home',1,NULL,NULL,'2026-01-21 03:10:09'),
(102,4,42,'do my homework',1,NULL,NULL,'2026-01-21 03:10:09'),
(103,4,43,'do my stuff',0,NULL,NULL,'2026-01-21 03:10:09'),
(104,4,44,'take a tea shower',0,NULL,NULL,'2026-01-21 03:10:09'),
(105,4,45,'take supplements',1,NULL,NULL,'2026-01-21 03:10:09'),
(106,4,46,'do me a favor',1,NULL,NULL,'2026-01-21 03:10:09'),
(107,4,47,'get along',1,NULL,NULL,'2026-01-21 03:10:09'),
(108,4,48,'take my bag',1,NULL,NULL,'2026-01-21 03:10:09'),
(109,4,49,'office worker',1,NULL,NULL,'2026-01-21 03:10:09'),
(110,4,50,'take a break',1,NULL,NULL,'2026-01-21 03:10:09'),
(111,4,51,'take action',1,NULL,NULL,'2026-01-21 03:10:09'),
(112,4,52,'a working couple',1,NULL,NULL,'2026-01-21 03:10:09'),
(113,4,53,'personality',1,NULL,NULL,'2026-01-21 03:10:09'),
(114,4,54,'quit',1,NULL,NULL,'2026-01-21 03:10:09'),
(115,4,55,'take a class',1,NULL,NULL,'2026-01-21 03:10:09'),
(116,4,56,'do the chores',1,NULL,NULL,'2026-01-21 03:10:09'),
(117,4,57,'at work',1,NULL,NULL,'2026-01-21 03:10:09'),
(118,4,58,'an opposite in personality',1,NULL,NULL,'2026-01-21 03:10:09'),
(119,4,59,'take my hand',1,NULL,NULL,'2026-01-21 03:10:09'),
(120,4,60,'get along great',1,NULL,NULL,'2026-01-21 03:10:09'),
(121,5,31,'a 9 to 5 job',1,NULL,NULL,'2026-01-21 03:19:23'),
(122,5,32,'take a risk',1,NULL,NULL,'2026-01-21 03:19:23'),
(123,5,33,'take a ponytail',1,NULL,NULL,'2026-01-21 03:19:23'),
(124,5,34,'take a possport photo',1,NULL,NULL,'2026-01-21 03:19:23'),
(125,5,35,'take a picture',1,NULL,NULL,'2026-01-21 03:19:23'),
(126,5,36,'do the vacuuming',1,NULL,NULL,'2026-01-21 03:19:23'),
(127,5,37,'do my nails',1,NULL,NULL,'2026-01-21 03:19:23'),
(128,5,38,'take a course',1,NULL,NULL,'2026-01-21 03:19:23'),
(129,5,39,'do my makeup',1,NULL,NULL,'2026-01-21 03:19:23'),
(130,5,40,'hang out',1,NULL,NULL,'2026-01-21 03:19:23'),
(131,5,41,'all-rounder at home',1,NULL,NULL,'2026-01-21 03:19:23'),
(132,5,42,'do my homework',1,NULL,NULL,'2026-01-21 03:19:23'),
(133,5,43,'do my job',1,NULL,NULL,'2026-01-21 03:19:23'),
(134,5,44,'take a shower',1,NULL,NULL,'2026-01-21 03:19:23'),
(135,5,45,'take supplements',1,NULL,NULL,'2026-01-21 03:19:23'),
(136,5,46,'do me a favor',1,NULL,NULL,'2026-01-21 03:19:23'),
(137,5,47,'get along',1,NULL,NULL,'2026-01-21 03:19:23'),
(138,5,48,'take my bag',1,NULL,NULL,'2026-01-21 03:19:23'),
(139,5,49,'office worker',1,NULL,NULL,'2026-01-21 03:19:23'),
(140,5,50,'take a break',1,NULL,NULL,'2026-01-21 03:19:23'),
(141,5,51,'take action',1,NULL,NULL,'2026-01-21 03:19:23'),
(142,5,52,'a working couple',1,NULL,NULL,'2026-01-21 03:19:23'),
(143,5,53,'personality',1,NULL,NULL,'2026-01-21 03:19:23'),
(144,5,54,'quit',1,NULL,NULL,'2026-01-21 03:19:23'),
(145,5,55,'take a class',1,NULL,NULL,'2026-01-21 03:19:23'),
(146,5,56,'do the chores',1,NULL,NULL,'2026-01-21 03:19:23'),
(147,5,57,'at work',1,NULL,NULL,'2026-01-21 03:19:23'),
(148,5,58,'an opposites in personality',1,NULL,NULL,'2026-01-21 03:19:23'),
(149,5,59,'take my hand',1,NULL,NULL,'2026-01-21 03:19:23'),
(150,5,60,'get along great',1,NULL,NULL,'2026-01-21 03:19:23');
/*!40000 ALTER TABLE `exam_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `round_id` bigint(20) NOT NULL,
  `mode` varchar(20) DEFAULT 'ONLINE',
  `total_count` int(11) NOT NULL,
  `correct_count` int(11) DEFAULT 0,
  `score` decimal(5,2) DEFAULT 0.00,
  `is_passed` tinyint(1) DEFAULT 0,
  `status` varchar(20) DEFAULT 'IN_PROGRESS',
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exams_user_id` (`user_id`),
  KEY `idx_exams_round_id` (`round_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES
(2,1,1,'OFFLINE',30,28,28.00,1,'COMPLETED','2026-01-21 03:02:17','2026-01-21 03:20:45'),
(3,3,1,'OFFLINE',30,30,30.00,1,'COMPLETED','2026-01-21 03:10:07','2026-01-21 03:19:44'),
(4,2,1,'OFFLINE',30,25,25.00,1,'COMPLETED','2026-01-21 03:10:09','2026-01-21 03:17:58'),
(5,4,1,'OFFLINE',30,30,30.00,1,'COMPLETED','2026-01-21 03:19:23','2026-01-21 03:21:51');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `round_id` bigint(20) NOT NULL,
  `question_type` varchar(20) NOT NULL,
  `answer_type` varchar(20) DEFAULT 'CHOICE',
  `question_text` varchar(500) NOT NULL,
  `answer` varchar(500) NOT NULL,
  `option1` varchar(200) DEFAULT NULL,
  `option2` varchar(200) DEFAULT NULL,
  `option3` varchar(200) DEFAULT NULL,
  `option4` varchar(200) DEFAULT NULL,
  `hint` text DEFAULT NULL,
  `seq_no` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_questions_round_id` (`round_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES
(31,1,'MEDIUM','TEXT','일반 직장','a 9-to-5 job',NULL,NULL,NULL,NULL,NULL,1,'2026-01-21 03:01:38'),
(32,1,'MEDIUM','TEXT','위험을 감수하다','take a risk',NULL,NULL,NULL,NULL,NULL,2,'2026-01-21 03:01:38'),
(33,1,'MEDIUM','TEXT','머리를 묶다','do a ponytail',NULL,NULL,NULL,NULL,NULL,3,'2026-01-21 03:01:38'),
(34,1,'MEDIUM','TEXT','여권 사진을 찍다','take a passport photo',NULL,NULL,NULL,NULL,NULL,4,'2026-01-21 03:01:38'),
(35,1,'MEDIUM','TEXT','사진을 찍다','take a picture',NULL,NULL,NULL,NULL,NULL,5,'2026-01-21 03:01:38'),
(36,1,'MEDIUM','TEXT','청소기를 돌리다','do the vacuuming',NULL,NULL,NULL,NULL,NULL,6,'2026-01-21 03:01:38'),
(37,1,'MEDIUM','TEXT','내 손톱을 손질하다','do my nails',NULL,NULL,NULL,NULL,NULL,7,'2026-01-21 03:01:38'),
(38,1,'MEDIUM','TEXT','강좌를 수강하다','take a course',NULL,NULL,NULL,NULL,NULL,8,'2026-01-21 03:01:38'),
(39,1,'MEDIUM','TEXT','화장을 하다','do make-up',NULL,NULL,NULL,NULL,NULL,9,'2026-01-21 03:01:38'),
(40,1,'MEDIUM','TEXT','함께 어울려 시간을 보내다','hang out',NULL,NULL,NULL,NULL,NULL,10,'2026-01-21 03:01:38'),
(41,1,'MEDIUM','TEXT','만능 살림꾼','all-rounder at home',NULL,NULL,NULL,NULL,NULL,11,'2026-01-21 03:01:38'),
(42,1,'MEDIUM','TEXT','숙제를 하다','do my homework',NULL,NULL,NULL,NULL,NULL,12,'2026-01-21 03:01:38'),
(43,1,'MEDIUM','TEXT','내 할 일을 하다','do my job',NULL,NULL,NULL,NULL,NULL,13,'2026-01-21 03:01:38'),
(44,1,'MEDIUM','TEXT','저 샤워했어요.','I took a shower.',NULL,NULL,NULL,NULL,NULL,14,'2026-01-21 03:01:38'),
(45,1,'MEDIUM','TEXT','보충제를 섭취하다','take supplements',NULL,NULL,NULL,NULL,NULL,15,'2026-01-21 03:01:38'),
(46,1,'MEDIUM','TEXT','나에게 호의를 베풀다','do me a favor',NULL,NULL,NULL,NULL,NULL,16,'2026-01-21 03:01:38'),
(47,1,'MEDIUM','TEXT','잘 지내다','get along',NULL,NULL,NULL,NULL,NULL,17,'2026-01-21 03:01:38'),
(48,1,'MEDIUM','TEXT','내 가방을 가져가다','take my bag',NULL,NULL,NULL,NULL,NULL,18,'2026-01-21 03:01:38'),
(49,1,'MEDIUM','TEXT','회사원','office worker',NULL,NULL,NULL,NULL,NULL,19,'2026-01-21 03:01:38'),
(50,1,'MEDIUM','TEXT','휴식을 취하다','take a break',NULL,NULL,NULL,NULL,NULL,20,'2026-01-21 03:01:38'),
(51,1,'MEDIUM','TEXT','조치를 취하다','take action',NULL,NULL,NULL,NULL,NULL,21,'2026-01-21 03:01:38'),
(52,1,'MEDIUM','TEXT','맞벌이 부부','a working couple',NULL,NULL,NULL,NULL,NULL,22,'2026-01-21 03:01:38'),
(53,1,'MEDIUM','TEXT','성격','personality',NULL,NULL,NULL,NULL,NULL,23,'2026-01-21 03:01:38'),
(54,1,'MEDIUM','TEXT','그만두다','quit',NULL,NULL,NULL,NULL,NULL,24,'2026-01-21 03:01:38'),
(55,1,'MEDIUM','TEXT','수업을 듣다','take a class',NULL,NULL,NULL,NULL,NULL,25,'2026-01-21 03:01:38'),
(56,1,'MEDIUM','TEXT','집안일/허드렛일을 하다','do the chores',NULL,NULL,NULL,NULL,NULL,26,'2026-01-21 03:01:38'),
(57,1,'MEDIUM','TEXT','내가 하는 일에서','at work',NULL,NULL,NULL,NULL,NULL,27,'2026-01-21 03:01:38'),
(58,1,'MEDIUM','TEXT','성격이 정반대인 사람','an opposite in personality',NULL,NULL,NULL,NULL,NULL,28,'2026-01-21 03:01:38'),
(59,1,'MEDIUM','TEXT','내 손을 잡다','hold my hand',NULL,NULL,NULL,NULL,NULL,29,'2026-01-21 03:01:38'),
(60,1,'MEDIUM','TEXT','죽이 잘 맞다','get along great',NULL,NULL,NULL,NULL,NULL,30,'2026-01-21 03:01:38');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `round_materials`
--

DROP TABLE IF EXISTS `round_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `round_materials` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `round_id` bigint(20) NOT NULL,
  `material_type` varchar(20) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `file_name` varchar(200) DEFAULT NULL,
  `seq_no` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_materials_round_id` (`round_id`),
  CONSTRAINT `round_materials_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `round_materials`
--

LOCK TABLES `round_materials` WRITE;
/*!40000 ALTER TABLE `round_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `round_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `round_vocabulary`
--

DROP TABLE IF EXISTS `round_vocabulary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `round_vocabulary` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `round_id` bigint(20) NOT NULL,
  `english` varchar(200) NOT NULL,
  `korean` varchar(200) DEFAULT NULL,
  `phonetic` varchar(200) DEFAULT NULL,
  `seq_no` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_vocabulary_round_id` (`round_id`),
  CONSTRAINT `round_vocabulary_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `round_vocabulary`
--

LOCK TABLES `round_vocabulary` WRITE;
/*!40000 ALTER TABLE `round_vocabulary` DISABLE KEYS */;
INSERT INTO `round_vocabulary` VALUES
(4,1,'I took a shower.','저 샤워했어요.','',4,'2026-01-21 02:44:55'),
(5,1,'take a taxi / a bus / the subway','택시/버스/지하철을 타다','',5,'2026-01-21 02:44:55'),
(6,1,'take a shower / a bath','샤워/목욕하다','',6,'2026-01-21 02:44:55'),
(7,1,'take a picture / a photo','사진을 찍다','',7,'2026-01-21 02:44:55'),
(8,1,'take 30 minutes','30분이 걸리다','/teɪk ˈθɝdi ˈmɪnəts/',8,'2026-01-21 02:44:55'),
(9,1,'take a vitamin','비타민을 복용하다','/teɪk ə ˈvaɪtəmɪn/',9,'2026-01-21 02:44:55'),
(10,1,'take supplements','보충제를 섭취하다','/teɪk ˈsʌpləmənts/',10,'2026-01-21 02:44:55'),
(11,1,'hold my hand','내 손을 잡다','/hoʊld maɪ hænd/',11,'2026-01-21 02:44:55'),
(12,1,'hold my arm','내 팔을 잡다','/hoʊld maɪ ɑːrm/',12,'2026-01-21 02:44:55'),
(13,1,'take a number','번호표를 뽑다','/teɪk ə ˈnʌmbər/',13,'2026-01-21 02:44:55'),
(14,1,'take a call','전화를 받다','/teɪk ə kɔːl/',14,'2026-01-21 02:44:55'),
(15,1,'take a passport photo','여권 사진을 찍다','/teɪk ə ˈpæsˌpɔːrt ˈfoʊtoʊ/',15,'2026-01-21 02:44:55'),
(16,1,'take a class','수업을 듣다','/teɪk ə klæs/',16,'2026-01-21 02:44:55'),
(17,1,'take a course','강좌를 수강하다','/teɪk ə kɔːrs/',17,'2026-01-21 02:44:55'),
(18,1,'take a deep breath','심호흡을 하다','/teɪk ə diːp breθ/',18,'2026-01-21 02:44:55'),
(19,1,'take a risk','위험을 감수하다','/teɪk ə rɪsk/',19,'2026-01-21 02:44:55'),
(20,1,'take action','조치를 취하다','/teɪk ˈækʃən/',20,'2026-01-21 02:44:55'),
(21,1,'take a break','휴식을 취하다','/teɪk ə breɪk/',21,'2026-01-21 02:44:55'),
(23,1,'take my bag','내 가방을 가져가다','/teɪk maɪ bæɡ/',23,'2026-01-21 02:44:55'),
(24,1,'do the dishes','설거지를 하다','/duː ðə ˈdɪʃɪz/',24,'2026-01-21 02:44:55'),
(25,1,'do my homework','숙제를 하다','/duː maɪ ˈhoʊmwɜːrk/',25,'2026-01-21 02:44:55'),
(26,1,'do Pilates','필라테스를 하다','/duː pɪˈlɑːtiːz/',26,'2026-01-21 02:44:55'),
(27,1,'do my hair','내 머리를 손질하다','/duː maɪ her/',27,'2026-01-21 02:44:55'),
(28,1,'do the housework','집안일을 하다','/duː ðə ˈhaʊswɜːrk/',28,'2026-01-21 02:44:55'),
(29,1,'do the chores','집안일/허드렛일을 하다','/duː ðə tʃɔːrz/',29,'2026-01-21 02:44:55'),
(30,1,'do the laundry','빨래를 하다','/duː ðə ˈlɔːndri/',30,'2026-01-21 02:44:55'),
(31,1,'do the ironing','다림질을 하다','/duː ði ˈaɪərnɪŋ/',31,'2026-01-21 02:44:55'),
(32,1,'do the vacuuming','청소기를 돌리다','/duː ðə ˈvækjuːmɪŋ/',32,'2026-01-21 02:44:55'),
(33,1,'do make-up','화장을 하다','/duː ˈmeɪkʌp/',33,'2026-01-21 02:44:55'),
(34,1,'do a ponytail','머리를 묶다','/duː ə ˈpoʊniˌteɪl/',34,'2026-01-21 02:44:55'),
(35,1,'do my nails','내 손톱을 손질하다','/duː maɪ neɪlz/',35,'2026-01-21 02:44:55'),
(36,1,'do crafts','공예를 하다','/duː kræfts/',36,'2026-01-21 02:44:55'),
(37,1,'do office work','사무를 보다','/duː ˈɔːfɪs wɜːrk/',37,'2026-01-21 02:44:55'),
(38,1,'do me a favor','나에게 호의를 베풀다','/duː miː ə ˈfeɪvər/',38,'2026-01-21 02:44:55'),
(39,1,'do some research','조사를 하다','/duː sʌm riˈsɜːrtʃ/',39,'2026-01-21 02:44:55'),
(40,1,'do my best','최선을 다하다','/duː maɪ best/',40,'2026-01-21 02:44:55'),
(41,1,'do my part','내 역할을 다하다','/duː maɪ pɑːrt/',41,'2026-01-21 02:44:55'),
(42,1,'do my job','내 할 일을 하다','/duː maɪ dʒɑːb/',42,'2026-01-21 02:44:55'),
(43,1,'a 9-to-5 job','일반 직장','/ə naɪn tə faɪv dʒɑːb/',43,'2026-01-21 02:44:55'),
(44,1,'check my inbox','메일함을 확인하다','/tʃek maɪ ˈɪnbɑːks/',44,'2026-01-21 02:44:55'),
(45,1,'meet a client','클라이언트를 만나다','/miːt ə ˈklaɪənt/',45,'2026-01-21 02:44:55'),
(46,1,'work for myself','프리랜서로 일하다, 자영업을 하다','/wɜːrk fɔːr maɪˈself/',46,'2026-01-21 02:44:55'),
(47,1,'a deadline coming up','다가오는 마감일','/ə ˈdedlaɪn ˈkʌmɪŋ ʌp/',47,'2026-01-21 02:44:55'),
(48,1,'over a video call','화상 회의로','/ˈoʊvər ə ˈvɪdioʊ kɔːl/',48,'2026-01-21 02:44:55'),
(49,1,'at work','내가 하는 일에서','/æt wɜːrk/',49,'2026-01-21 02:44:55'),
(53,1,'quit','그만두다','/kwɪt/',53,'2026-01-21 02:44:55'),
(54,1,'video call','화상 회의','/ˈvɪdioʊ kɔːl/',54,'2026-01-21 02:44:55'),
(55,1,'inbox','이메일 수신함','/ˈɪnbɑːks/',55,'2026-01-21 02:44:55'),
(56,1,'do one\'s best','최선을 다하다','/duː wʌnz best/',56,'2026-01-21 02:44:55'),
(57,1,'typical Korean family','전형적인 한국 가족','/ˈtɪpɪkəl kəˈriːən ˈfæməli/',57,'2026-01-21 02:44:55'),
(58,1,'hard-working','부지런한, 성실한','/ˈhɑːrdˌwɜːrkɪŋ/',58,'2026-01-21 02:44:55'),
(59,1,'office worker','회사원','/ˈɔːfɪs ˈwɜːrkər/',59,'2026-01-21 02:44:55'),
(60,1,'all-rounder at home','만능 살림꾼','/ˌɔːlˈraʊndər æt hoʊm/',60,'2026-01-21 02:44:55'),
(61,1,'a working couple','맞벌이 부부','/ə ˈwɜːrkɪŋ ˈkʌpəl/',61,'2026-01-21 02:44:55'),
(62,1,'an opposite in personality','성격이 정반대인 사람','/ən ˈɑːpəzət ɪn ˌpɜːrsəˈnæləti/',62,'2026-01-21 02:44:55'),
(63,1,'get along great','죽이 잘 맞다','/ɡet əˈlɔːŋ ɡreɪt/',63,'2026-01-21 02:44:55'),
(64,1,'hang out','함께 어울려 시간을 보내다','/hæŋ aʊt/',64,'2026-01-21 02:44:55'),
(65,1,'typical','전형적인','/ˈtɪpɪkəl/',65,'2026-01-21 02:44:55'),
(66,1,'opposite','정반대인 사람','/ˈɑːpəzət/',66,'2026-01-21 02:44:55'),
(67,1,'all-rounder','만능인 사람','/ˌɔːlˈraʊndər/',67,'2026-01-21 02:44:55'),
(68,1,'personality','성격','/ˌpɜːrsəˈnæləti/',68,'2026-01-21 02:44:55'),
(69,1,'get older','나이가 들다','/ɡet ˈoʊldər/',69,'2026-01-21 02:44:55'),
(70,1,'sibling','형제자매','/ˈsɪblɪŋ/',70,'2026-01-21 02:44:55'),
(71,1,'get along','잘 지내다','/ɡet əˈlɔːŋ/',71,'2026-01-21 02:44:55');
/*!40000 ALTER TABLE `round_vocabulary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rounds`
--

DROP TABLE IF EXISTS `rounds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rounds` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `question_count` int(11) DEFAULT 20,
  `difficulty` varchar(20) DEFAULT 'MEDIUM',
  `status` varchar(20) DEFAULT 'ACTIVE',
  `pass_score` int(11) DEFAULT 24,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rounds`
--

LOCK TABLES `rounds` WRITE;
/*!40000 ALTER TABLE `rounds` DISABLE KEYS */;
INSERT INTO `rounds` VALUES
(1,'1. take, do','',30,'MEDIUM','COMPLETED',24,'2026-01-21 02:40:42');
/*!40000 ALTER TABLE `rounds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'이성현','2026-01-21 02:24:29'),
(2,'김주연','2026-01-21 02:24:29'),
(3,'김은별','2026-01-21 02:24:29'),
(4,'정하나','2026-01-21 02:24:29');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_round_stats`
--

DROP TABLE IF EXISTS `v_round_stats`;
/*!50001 DROP VIEW IF EXISTS `v_round_stats`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_round_stats` AS SELECT
 1 AS `round_id`,
  1 AS `round_title`,
  1 AS `exam_count`,
  1 AS `user_count`,
  1 AS `avg_score`,
  1 AS `max_score`,
  1 AS `min_score` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_stats`
--

DROP TABLE IF EXISTS `v_user_stats`;
/*!50001 DROP VIEW IF EXISTS `v_user_stats`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_user_stats` AS SELECT
 1 AS `user_id`,
  1 AS `user_name`,
  1 AS `total_exams`,
  1 AS `avg_score`,
  1 AS `max_score` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_round_stats`
--

/*!50001 DROP VIEW IF EXISTS `v_round_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_round_stats` AS select `r`.`id` AS `round_id`,`r`.`title` AS `round_title`,count(distinct `e`.`id`) AS `exam_count`,count(distinct `e`.`user_id`) AS `user_count`,round(avg(`e`.`score`),2) AS `avg_score`,max(`e`.`score`) AS `max_score`,min(`e`.`score`) AS `min_score` from (`rounds` `r` left join `exams` `e` on(`r`.`id` = `e`.`round_id` and `e`.`status` = 'COMPLETED')) group by `r`.`id`,`r`.`title` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_stats`
--

/*!50001 DROP VIEW IF EXISTS `v_user_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_stats` AS select `u`.`id` AS `user_id`,`u`.`name` AS `user_name`,count(`e`.`id`) AS `total_exams`,round(avg(`e`.`score`),2) AS `avg_score`,max(`e`.`score`) AS `max_score` from (`users` `u` left join `exams` `e` on(`u`.`id` = `e`.`user_id` and `e`.`status` = 'COMPLETED')) group by `u`.`id`,`u`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-21  3:51:45

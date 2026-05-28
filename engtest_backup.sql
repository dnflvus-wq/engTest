/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.15-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: engtest
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
-- Table structure for table `achievement_progress`
--

DROP TABLE IF EXISTS `achievement_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievement_progress` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `achievement_id` varchar(50) NOT NULL,
  `current_value` int(11) DEFAULT 0,
  `target_value` int(11) NOT NULL,
  `next_tier` varchar(20) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_progress` (`user_id`,`achievement_id`),
  KEY `achievement_id` (`achievement_id`),
  KEY `idx_achievement_progress_user` (`user_id`),
  CONSTRAINT `achievement_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `achievement_progress_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_progress`
--

LOCK TABLES `achievement_progress` WRITE;
/*!40000 ALTER TABLE `achievement_progress` DISABLE KEYS */;
INSERT INTO `achievement_progress` VALUES
(1,1,'LOGIN_STREAK',1,3,'BRONZE','2026-02-11 07:48:58'),
(2,1,'WEEKLY_ACTIVE',1,3,'BRONZE','2026-02-11 07:48:58'),
(3,1,'MONTHLY_LOGIN',1,10,'BRONZE','2026-02-11 07:48:58'),
(4,1,'STUDY_STREAK',0,3,'BRONZE','2026-02-11 07:48:58');
/*!40000 ALTER TABLE `achievement_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` varchar(50) NOT NULL,
  `category` varchar(30) NOT NULL,
  `name_kr` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `description_kr` varchar(500) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `is_hidden` tinyint(1) DEFAULT 0,
  `is_tiered` tinyint(1) DEFAULT 0,
  `tier_thresholds` text DEFAULT NULL,
  `grants_badge_at` varchar(20) DEFAULT NULL,
  `badge_id` varchar(50) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES
('ALL_MATERIALS','STUDY_KING','완전 학습','Complete Study','한 회차의 모든 학습자료를 활용했습니다','fa-check-double',0,0,NULL,NULL,NULL,36,'2026-02-11 07:45:04'),
('AVG_SCORE','EXAM_MASTER','꾸준한 실력','Consistent','평균 점수가 N점 이상입니다 (최소 5회)','fa-chart-line',0,1,'{\"BRONZE\":18,\"SILVER\":22,\"GOLD\":25,\"DIAMOND\":28}','DIAMOND','BADGE_CONSISTENT',13,'2026-02-11 07:45:04'),
('BOOK1_COMPLETE','PROGRESS_MASTER','1분영어 졸업','Book 1 Graduate','Book 1을 전체 완료했습니다 (83 Units)','fa-user-graduate',0,0,NULL,'SINGLE','BADGE_BOOK1_GRAD',86,'2026-02-11 07:45:04'),
('BOOK1_PROGRESS','PROGRESS_MASTER','1분영어 마스터','1-Min English','Book 1 진도를 N% 완료했습니다','fa-book',0,1,'{\"BRONZE\":25,\"SILVER\":50,\"GOLD\":75,\"DIAMOND\":100}','DIAMOND','BADGE_BOOK1',80,'2026-02-11 07:45:04'),
('BOOK2_COMPLETE','PROGRESS_MASTER','프리토킹 졸업','Book 2 Graduate','Book 2를 전체 완료했습니다 (100 Days)','fa-user-graduate',0,0,NULL,'SINGLE','BADGE_BOOK2_GRAD',87,'2026-02-11 07:45:04'),
('BOOK2_PROGRESS','PROGRESS_MASTER','프리토킹 마스터','Free Talking','Book 2 진도를 N% 완료했습니다','fa-comments',0,1,'{\"BRONZE\":25,\"SILVER\":50,\"GOLD\":75,\"DIAMOND\":100}','DIAMOND','BADGE_BOOK2',81,'2026-02-11 07:45:04'),
('BOTH_BOOKS','PROGRESS_MASTER','이중 교재','Dual Textbook','두 교재 모두 N% 이상 진행했습니다','fa-book-bookmark',0,1,'{\"BRONZE\":10,\"SILVER\":25,\"GOLD\":50,\"DIAMOND\":75}','GOLD','BADGE_DUAL_BOOK',82,'2026-02-11 07:45:04'),
('BOTH_MODES','EXAM_MASTER','만능 시험러','Versatile','온라인과 오프라인 시험을 모두 완료했습니다','fa-arrows-left-right',0,0,NULL,NULL,NULL,16,'2026-02-11 07:45:04'),
('CHAPTER_STREAK','PROGRESS_MASTER','진도 연속','Chapter Streak','연속 N챕터를 완료했습니다','fa-forward-step',0,1,'{\"BRONZE\":3,\"SILVER\":5,\"GOLD\":10,\"DIAMOND\":20}',NULL,NULL,83,'2026-02-11 07:45:04'),
('COMEBACK','COMPETITION','역전승','Comeback King','이전 회차 꼴찌에서 다음 회차 1등을 달성했습니다','fa-rotate-right',0,0,NULL,'SINGLE','BADGE_COMEBACK',64,'2026-02-11 07:45:04'),
('EXACTLY_HALF','HIDDEN','딱 반','Exactly Half','정확히 절반만 맞았습니다','fa-scale-balanced',1,0,NULL,NULL,NULL,90,'2026-02-11 07:45:04'),
('EXAM_COUNT','EXAM_MASTER','시험의 달인','Exam Veteran','시험을 N회 완료했습니다','fa-graduation-cap',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":25,\"DIAMOND\":50}','GOLD','BADGE_EXAM_VETERAN',10,'2026-02-11 07:45:04'),
('FAST_EXAM','SPEED','스피드 시험','Speed Demon','시험을 N분 이내에 완료했습니다','fa-gauge-high',0,1,'{\"BRONZE\":30,\"SILVER\":20,\"GOLD\":10,\"DIAMOND\":5}','GOLD','BADGE_SPEED_DEMON',50,'2026-02-11 07:45:04'),
('FEATURE_EXPLORER','EXPLORER','기능 탐험가','Feature Explorer','모든 주요 기능을 사용해봤습니다','fa-compass',0,0,NULL,NULL,NULL,70,'2026-02-11 07:45:04'),
('FIRST_EXAM','FIRST_STEPS','시험 데뷔','Exam Debut','첫 시험을 완료했습니다','fa-pen-to-square',0,0,NULL,NULL,NULL,2,'2026-02-11 07:45:04'),
('FIRST_LOGIN','FIRST_STEPS','어서오세요!','Welcome','첫 로그인을 했습니다','fa-door-open',0,0,NULL,NULL,NULL,1,'2026-02-11 07:45:04'),
('FIRST_OFFLINE','FIRST_STEPS','아날로그 감성','Analog Soul','오프라인 시험을 처음 완료했습니다','fa-print',0,0,NULL,NULL,NULL,7,'2026-02-11 07:45:04'),
('FIRST_PASS','FIRST_STEPS','합격의 기쁨','First Victory','첫 합격을 했습니다','fa-circle-check',0,0,NULL,NULL,NULL,3,'2026-02-11 07:45:04'),
('FIRST_PERFECT','FIRST_STEPS','완벽한 시작','Flawless Start','첫 만점을 받았습니다','fa-star',0,0,NULL,NULL,NULL,4,'2026-02-11 07:45:04'),
('FIRST_STUDY','FIRST_STEPS','학습 시작','Study Begins','학습 페이지를 처음 방문했습니다','fa-book-open',0,0,NULL,NULL,NULL,5,'2026-02-11 07:45:04'),
('FIRST_SUBMIT','SPEED','1등 제출','First to Submit','회차에서 가장 먼저 시험을 제출했습니다','fa-flag-checkered',0,0,NULL,NULL,NULL,51,'2026-02-11 07:45:04'),
('FIRST_SUBMIT_COUNT','SPEED','빠른 손','Quick Hands','N회차에서 가장 먼저 시험을 제출했습니다','fa-hand',0,1,'{\"BRONZE\":1,\"SILVER\":3,\"GOLD\":5,\"DIAMOND\":10}','GOLD','BADGE_QUICK_HANDS',52,'2026-02-11 07:45:04'),
('FIRST_TTS','FIRST_STEPS','따라 읽기','First Pronunciation','TTS 발음 듣기를 처음 사용했습니다','fa-volume-high',0,0,NULL,NULL,NULL,6,'2026-02-11 07:45:04'),
('FOUR_COMPLETE','HIDDEN','사인사색','Four Colors','4명 모두 완료한 회차에 참여했습니다','fa-people-group',1,0,NULL,NULL,NULL,94,'2026-02-11 07:45:04'),
('FULL_PARTICIPATION','COMPETITION','개근왕','Always There','N회차에 참여했습니다','fa-clipboard-check',0,1,'{\"BRONZE\":5,\"SILVER\":10,\"GOLD\":20,\"DIAMOND\":40}','GOLD','BADGE_ALWAYS_THERE',66,'2026-02-11 07:45:04'),
('HIGH_SCORE','EXAM_MASTER','고득점','High Scorer','단일 시험에서 N점 이상 획득했습니다','fa-arrow-up-9-1',0,1,'{\"BRONZE\":20,\"SILVER\":25,\"GOLD\":28,\"DIAMOND\":30}','DIAMOND','BADGE_HIGH_SCORER',12,'2026-02-11 07:45:04'),
('LAST_SECOND','HIDDEN','막판 스퍼트','Last Second','뒤쪽 5문제 중 4개 이상 정답 (앞쪽 50% 미만일 때)','fa-rocket',1,0,NULL,NULL,NULL,92,'2026-02-11 07:45:04'),
('LEGEND_COMPLETE','LEGEND','올클리어','All Clear','두 교재를 모두 100% 완료했습니다','fa-gem',0,0,NULL,'SINGLE','BADGE_LEGEND_COMPLETE',102,'2026-02-11 07:45:04'),
('LEGEND_GRANDMASTER','LEGEND','그랜드마스터','Grandmaster','Gold 이상 업적을 20개 이상 달성했습니다','fa-chess-king',0,0,NULL,'SINGLE','BADGE_LEGEND_GRANDMASTER',105,'2026-02-11 07:45:04'),
('LEGEND_MARATHON','LEGEND','마라톤 러너','Marathon Runner','100회 시험을 완료했습니다','fa-person-running',0,0,NULL,'SINGLE','BADGE_LEGEND_MARATHON',101,'2026-02-11 07:45:04'),
('LEGEND_PERFECT_10','LEGEND','십전십미','Perfection 10','만점을 10회 달성했습니다','fa-diamond',0,0,NULL,'SINGLE','BADGE_LEGEND_PERFECT',103,'2026-02-11 07:45:04'),
('LEGEND_SCHOLAR','LEGEND','만학도','The Scholar','전체 시험 평균 27점 이상 (최소 20회)','fa-hat-wizard',0,0,NULL,'SINGLE','BADGE_LEGEND_SCHOLAR',100,'2026-02-11 07:45:04'),
('LEGEND_STREAK_30','LEGEND','30일 연속','30-Day Warrior','30일 연속 로그인했습니다','fa-fire-flame-simple',0,0,NULL,'SINGLE','BADGE_LEGEND_STREAK',104,'2026-02-11 07:45:04'),
('LOGIN_STREAK','STREAKS','꾸준한 출석','Attendance King','N일 연속 로그인했습니다','fa-calendar-check',0,1,'{\"BRONZE\":3,\"SILVER\":7,\"GOLD\":14,\"DIAMOND\":30}','DIAMOND','BADGE_ATTENDANCE',40,'2026-02-11 07:45:04'),
('MONTHLY_LOGIN','STREAKS','월간 출석','Monthly Regular','한 달에 N일 이상 로그인했습니다','fa-calendar-days',0,1,'{\"BRONZE\":10,\"SILVER\":15,\"GOLD\":20,\"DIAMOND\":25}','GOLD','BADGE_MONTHLY',44,'2026-02-11 07:45:04'),
('NEVER_FAIL','PERFECTIONIST','무패','Undefeated','10회 이상 시험에서 한 번도 불합격하지 않았습니다','fa-shield-halved',0,0,NULL,'SINGLE','BADGE_UNDEFEATED',24,'2026-02-11 07:45:04'),
('OFFLINE_MASTER','EXAM_MASTER','오프라인 장인','Paper Expert','오프라인 시험을 N회 완료했습니다','fa-file-image',0,1,'{\"BRONZE\":2,\"SILVER\":5,\"GOLD\":10,\"DIAMOND\":20}','GOLD','BADGE_PAPER_EXPERT',15,'2026-02-11 07:45:04'),
('ONLINE_MASTER','EXAM_MASTER','온라인 장인','CBT Expert','온라인 시험을 N회 완료했습니다','fa-desktop',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":20,\"DIAMOND\":40}',NULL,NULL,14,'2026-02-11 07:45:04'),
('PART_COMPLETE','PROGRESS_MASTER','파트 정복','Part Complete','한 파트를 전체 완료했습니다','fa-flag',0,0,NULL,NULL,NULL,84,'2026-02-11 07:45:04'),
('PART_COUNT','PROGRESS_MASTER','파트 수집가','Part Collector','N개 파트를 전체 완료했습니다','fa-boxes-stacked',0,1,'{\"BRONZE\":1,\"SILVER\":3,\"GOLD\":5,\"DIAMOND\":10}','GOLD','BADGE_PART_COLLECTOR',85,'2026-02-11 07:45:04'),
('PASS_COUNT','EXAM_MASTER','합격 행진','Pass Parade','시험을 N회 합격했습니다','fa-trophy',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":25,\"DIAMOND\":50}','GOLD','BADGE_PASS_PARADE',11,'2026-02-11 07:45:04'),
('PASS_STREAK','PERFECTIONIST','연속 합격','Pass Streak','연속 N회 합격했습니다','fa-link',0,1,'{\"BRONZE\":3,\"SILVER\":5,\"GOLD\":10,\"DIAMOND\":20}','GOLD','BADGE_PASS_STREAK',22,'2026-02-11 07:45:04'),
('PDF_DOWNLOAD','STUDY_KING','자료 활용','Resource User','학습 자료를 N회 다운로드했습니다','fa-file-pdf',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":25,\"DIAMOND\":50}',NULL,NULL,34,'2026-02-11 07:45:04'),
('PERFECT_SCORE','PERFECTIONIST','만점왕','Perfect Score','만점을 N회 달성했습니다','fa-crown',0,1,'{\"BRONZE\":1,\"SILVER\":3,\"GOLD\":5,\"DIAMOND\":10}','DIAMOND','BADGE_PERFECT_KING',20,'2026-02-11 07:45:04'),
('PERFECT_STREAK','PERFECTIONIST','연속 만점','Perfection Streak','연속 N회 만점을 달성했습니다','fa-fire',0,1,'{\"BRONZE\":2,\"SILVER\":3,\"GOLD\":5,\"DIAMOND\":7}','GOLD','BADGE_PERFECT_STREAK',21,'2026-02-11 07:45:04'),
('RANK_FIRST','COMPETITION','1등!','Champion','회차 랭킹 1위를 달성했습니다','fa-medal',0,0,NULL,NULL,NULL,60,'2026-02-11 07:45:04'),
('RANK_FIRST_COUNT','COMPETITION','상위 1%','Top Dog','누적 N회 1위를 달성했습니다','fa-ranking-star',0,1,'{\"BRONZE\":1,\"SILVER\":3,\"GOLD\":5,\"DIAMOND\":10}','DIAMOND','BADGE_CHAMPION',61,'2026-02-11 07:45:04'),
('RANK_TOP2','COMPETITION','항상 위에','Podium Regular','2등 이내를 N회 달성했습니다','fa-podium',0,1,'{\"BRONZE\":3,\"SILVER\":5,\"GOLD\":10,\"DIAMOND\":20}','GOLD','BADGE_PODIUM',62,'2026-02-11 07:45:04'),
('RIVAL_WIN','COMPETITION','라이벌 승리','Rivalry','특정 사용자보다 높은 점수를 N회 달성했습니다','fa-handshake-slash',0,1,'{\"BRONZE\":3,\"SILVER\":5,\"GOLD\":10}',NULL,NULL,65,'2026-02-11 07:45:04'),
('ROUND_EXPLORER','EXPLORER','회차 탐험가','Round Explorer','N개 회차의 시험을 응시했습니다','fa-map',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":20,\"DIAMOND\":40}',NULL,NULL,71,'2026-02-11 07:45:04'),
('SAME_SCORE','HIDDEN','동점자','Score Twin','같은 회차에서 다른 사용자와 동점입니다','fa-equals',1,0,NULL,NULL,NULL,96,'2026-02-11 07:45:04'),
('SCORE_IMPROVEMENT','PERFECTIONIST','성장하는 나','Growing','이전 시험 대비 N점 이상 향상했습니다','fa-seedling',0,1,'{\"BRONZE\":3,\"SILVER\":5,\"GOLD\":8,\"DIAMOND\":10}',NULL,NULL,23,'2026-02-11 07:45:04'),
('SCORE_PALINDROME','HIDDEN','회문 점수','Palindrome Score','점수가 회문입니다 (11, 22 등)','fa-repeat',1,0,NULL,NULL,NULL,91,'2026-02-11 07:45:04'),
('SLOW_AND_STEADY','SPEED','느긋한 합격','Slow & Steady','30분 이상 소요했지만 합격했습니다','fa-turtle',0,0,NULL,NULL,NULL,54,'2026-02-11 07:45:04'),
('SPEED_PASS','SPEED','번개 합격','Lightning Pass','N분 이내에 합격했습니다','fa-bolt-lightning',0,1,'{\"BRONZE\":20,\"SILVER\":15,\"GOLD\":10,\"DIAMOND\":5}','DIAMOND','BADGE_LIGHTNING',53,'2026-02-11 07:45:04'),
('STUDY_ROUNDS','STUDY_KING','다회차 학습','Multi-Round Study','N개 회차의 학습자료를 열람했습니다','fa-layer-group',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":20,\"DIAMOND\":40}',NULL,NULL,37,'2026-02-11 07:45:04'),
('STUDY_STREAK','STREAKS','학습 연속','Study Streak','N일 연속 학습했습니다','fa-fire-flame-curved',0,1,'{\"BRONZE\":3,\"SILVER\":7,\"GOLD\":14,\"DIAMOND\":30}','DIAMOND','BADGE_STUDY_STREAK',45,'2026-02-11 07:45:04'),
('STUDY_VISIT','STUDY_KING','학습 습관','Study Habit','학습 페이지를 N회 방문했습니다','fa-book-open-reader',0,1,'{\"BRONZE\":5,\"SILVER\":20,\"GOLD\":50,\"DIAMOND\":100}',NULL,NULL,32,'2026-02-11 07:45:04'),
('TOTAL_CORRECT','EXAM_MASTER','정답의 산','Answer Mountain','누적 정답 수가 N개입니다','fa-mountain',0,1,'{\"BRONZE\":50,\"SILVER\":200,\"GOLD\":500,\"DIAMOND\":1000}','DIAMOND','BADGE_ANSWER_MOUNTAIN',17,'2026-02-11 07:45:04'),
('TTS_COUNT','STUDY_KING','원어민 연습','Pronunciation Pro','TTS 발음 듣기를 N회 사용했습니다','fa-microphone',0,1,'{\"BRONZE\":10,\"SILVER\":50,\"GOLD\":200,\"DIAMOND\":500}','GOLD','BADGE_PRONUNCIATION',31,'2026-02-11 07:45:04'),
('VIDEO_WATCH','STUDY_KING','영상 학습','Video Learner','학습 영상을 N개 시청했습니다','fa-video',0,1,'{\"BRONZE\":3,\"SILVER\":10,\"GOLD\":30,\"DIAMOND\":50}',NULL,NULL,33,'2026-02-11 07:45:04'),
('VOCAB_COUNT','STUDY_KING','단어 수집가','Word Collector','단어를 N개 학습했습니다','fa-spell-check',0,1,'{\"BRONZE\":50,\"SILVER\":200,\"GOLD\":500,\"DIAMOND\":1000}','GOLD','BADGE_WORD_COLLECTOR',30,'2026-02-11 07:45:04'),
('VOCAB_DOWNLOAD','STUDY_KING','단어장 저장','Vocabulary Saver','단어장 엑셀을 N회 다운로드했습니다','fa-file-excel',0,1,'{\"BRONZE\":1,\"SILVER\":5,\"GOLD\":10,\"DIAMOND\":25}',NULL,NULL,35,'2026-02-11 07:45:04'),
('WEEKLY_ACTIVE','STREAKS','주간 활동왕','Weekly Active','한 주에 N일 이상 활동했습니다','fa-calendar-week',0,1,'{\"BRONZE\":3,\"SILVER\":5,\"GOLD\":7}',NULL,NULL,43,'2026-02-11 07:45:04'),
('ZERO_HERO','HIDDEN','영점 영웅','Zero Hero','0점을 받았습니다... 하지만 시도 자체가 용기!','fa-face-smile-wink',1,0,NULL,NULL,NULL,93,'2026-02-11 07:45:04');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `target_type` varchar(30) DEFAULT NULL,
  `target_id` bigint(20) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `request_path` varchar(200) DEFAULT NULL,
  `http_method` varchar(10) DEFAULT NULL,
  `response_status` int(11) DEFAULT NULL,
  `duration_ms` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_logs_user` (`user_id`),
  KEY `idx_logs_action` (`action`),
  KEY `idx_logs_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES
(1,1,'이성현','LOGIN_SUCCESS',NULL,NULL,NULL,'211.201.157.183','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36','/api/users/login','POST',200,12,'2026-02-11 07:48:58'),
(2,1,'이성현','LOGIN_SUCCESS',NULL,NULL,NULL,'211.201.157.183','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','/api/users/login','POST',200,2,'2026-02-11 07:49:40');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `badges` (
  `id` varchar(50) NOT NULL,
  `achievement_id` varchar(50) NOT NULL,
  `name_kr` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `description_kr` varchar(500) DEFAULT NULL,
  `icon` varchar(50) NOT NULL,
  `rarity` varchar(20) NOT NULL,
  `profile_effect` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `achievement_id` (`achievement_id`),
  CONSTRAINT `badges_ibfk_1` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
INSERT INTO `badges` VALUES
('BADGE_ALWAYS_THERE','FULL_PARTICIPATION','개근왕','Always There','20회차 참여','fa-clipboard-check','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_ANSWER_MOUNTAIN','TOTAL_CORRECT','정답의 산','Answer Mountain','누적 정답 1000개','fa-mountain','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_ATTENDANCE','LOGIN_STREAK','출석왕','Attendance King','30일 연속 로그인','fa-calendar-check','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_BOOK1','BOOK1_PROGRESS','1분영어 마스터','1-Min English Master','Book 1 100% 완료','fa-book','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_BOOK1_GRAD','BOOK1_COMPLETE','1분영어 졸업','Book 1 Graduate','Book 1 전체 완료','fa-user-graduate','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_BOOK2','BOOK2_PROGRESS','프리토킹 마스터','Free Talking Master','Book 2 100% 완료','fa-comments','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_BOOK2_GRAD','BOOK2_COMPLETE','프리토킹 졸업','Book 2 Graduate','Book 2 전체 완료','fa-user-graduate','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_CHAMPION','RANK_FIRST_COUNT','챔피언','Champion','10회 1위 달성','fa-ranking-star','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_COMEBACK','COMEBACK','역전승','Comeback King','꼴찌에서 1등 달성','fa-rotate-right','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_CONSISTENT','AVG_SCORE','꾸준한 실력','Consistent','평균 28점 이상','fa-chart-line','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_DUAL_BOOK','BOTH_BOOKS','이중 교재','Dual Textbook','양쪽 교재 50% 이상','fa-book-bookmark','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_EXAM_VETERAN','EXAM_COUNT','시험의 달인','Exam Veteran','시험 25회 이상 완료','fa-graduation-cap','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_HIGH_SCORER','HIGH_SCORE','고득점 마스터','High Scorer','만점 달성','fa-arrow-up-9-1','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_LEGEND_COMPLETE','LEGEND_COMPLETE','올클리어','All Clear','양 교재 100%','fa-gem','LEGENDARY','effect-legendary','2026-02-11 07:45:04'),
('BADGE_LEGEND_GRANDMASTER','LEGEND_GRANDMASTER','그랜드마스터','Grandmaster','Gold 이상 업적 20개','fa-chess-king','LEGENDARY','effect-legendary','2026-02-11 07:45:04'),
('BADGE_LEGEND_MARATHON','LEGEND_MARATHON','마라톤 러너','Marathon Runner','100회 시험 완료','fa-person-running','LEGENDARY','effect-legendary','2026-02-11 07:45:04'),
('BADGE_LEGEND_PERFECT','LEGEND_PERFECT_10','십전십미','Perfection 10','만점 10회','fa-diamond','LEGENDARY','effect-legendary','2026-02-11 07:45:04'),
('BADGE_LEGEND_SCHOLAR','LEGEND_SCHOLAR','만학도','The Scholar','평균 27점 이상, 20회 이상','fa-hat-wizard','LEGENDARY','effect-legendary','2026-02-11 07:45:04'),
('BADGE_LEGEND_STREAK','LEGEND_STREAK_30','30일 연속','30-Day Warrior','30일 연속 로그인','fa-fire-flame-simple','LEGENDARY','effect-legendary','2026-02-11 07:45:04'),
('BADGE_LIGHTNING','SPEED_PASS','번개 합격','Lightning Pass','5분 이내 합격','fa-bolt-lightning','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_MONTHLY','MONTHLY_LOGIN','월간 출석','Monthly Regular','월 20일 이상 로그인','fa-calendar-days','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_PAPER_EXPERT','OFFLINE_MASTER','오프라인 장인','Paper Expert','오프라인 시험 10회 이상','fa-file-image','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_PART_COLLECTOR','PART_COUNT','파트 수집가','Part Collector','5개 파트 완료','fa-boxes-stacked','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_PASS_PARADE','PASS_COUNT','합격 행진','Pass Parade','시험 25회 이상 합격','fa-trophy','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_PASS_STREAK','PASS_STREAK','연속 합격','Pass Streak','연속 10회 합격','fa-link','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_PERFECT_KING','PERFECT_SCORE','만점왕','Perfect King','만점 10회 달성','fa-crown','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_PERFECT_STREAK','PERFECT_STREAK','연속 만점','Perfect Streak','연속 5회 만점','fa-fire','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_PODIUM','RANK_TOP2','항상 위에','Podium Regular','10회 2등 이내','fa-medal','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_PRONUNCIATION','TTS_COUNT','발음왕','Pronunciation Pro','TTS 200회 이상','fa-microphone','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_QUICK_HANDS','FIRST_SUBMIT_COUNT','빠른 손','Quick Hands','5회 최초 제출','fa-hand','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_SPEED_DEMON','FAST_EXAM','스피드왕','Speed Demon','10분 이내 시험 완료','fa-gauge-high','RARE','effect-rare','2026-02-11 07:45:04'),
('BADGE_STUDY_STREAK','STUDY_STREAK','학습왕','Study Streak','30일 연속 학습','fa-fire-flame-curved','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_UNDEFEATED','NEVER_FAIL','무패','Undefeated','10회 이상 중 불합격 0','fa-shield-halved','EPIC','effect-epic','2026-02-11 07:45:04'),
('BADGE_WORD_COLLECTOR','VOCAB_COUNT','단어 수집가','Word Collector','단어 500개 이상 학습','fa-spell-check','RARE','effect-rare','2026-02-11 07:45:04');
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book_chapters`
--

DROP TABLE IF EXISTS `book_chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_chapters` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `book_title` varchar(100) NOT NULL,
  `part_number` int(11) NOT NULL,
  `part_title` varchar(100) NOT NULL,
  `chapter_number` int(11) NOT NULL,
  `chapter_label` varchar(50) NOT NULL,
  `chapter_title` varchar(200) DEFAULT NULL,
  `seq_no` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_book_chapter` (`book_id`,`part_number`,`chapter_number`)
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_chapters`
--

LOCK TABLES `book_chapters` WRITE;
/*!40000 ALTER TABLE `book_chapters` DISABLE KEYS */;
INSERT INTO `book_chapters` VALUES
(1,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',1,'Unit 01','get 나에게 생긴 모든 것을 말하기',1),
(2,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',2,'Unit 02','have 내가 가진 모든 것을 말하기',2),
(3,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',3,'Unit 03','take 내가 지금 가지려고 하는 모든 것을 말하기',3),
(4,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',4,'Unit 04','do 내가 매일 하는 것을 말하기',4),
(5,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',5,'Unit 05','make 어쩌다 한 번 만들어 내는 일을 말하기',5),
(6,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',6,'Unit 06','go 돌아다니는 일을 말하기',6),
(7,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',7,'Unit 07','be 가만히 있는 그 주어를 묘사하기',7),
(8,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',8,'Unit 08','현재/be+-ing/be going to 다양한 시제로 말하기',8),
(9,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',9,'Unit 09','과거/have p.p. 다양한 시제로 말하기',9),
(10,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',10,'Unit 10','have to/have been -ing 다양한 시제로 말하기',10),
(11,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',11,'Unit 11','must/will/would/should 다양한 어조로 말하기',11),
(12,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',12,'Unit 12','can/could/may/might 다양한 어조로 말하기',12),
(13,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',13,'Unit 13','not 안 한다고 말하기',13),
(14,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',14,'Unit 14','Do you~? 뭐 하는지 물어보기',14),
(15,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',15,'Unit 15','Am I~? 어떤 상태인지 물어보기',15),
(16,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',16,'Unit 16','Have you p.p.~? 해 본 적 있는지 물어보기',16),
(17,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',17,'Unit 17','Will you~? 조언을 구하거나 가능한지 물어보기',17),
(18,1,'쉬운단어로 1분 영어 말하기',1,'Part 1',18,'Unit 18','Who/What/Which~? 누가 무엇이 그랬는지 물어보기',18),
(19,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',1,'Unit 01','that/who/what/which 두 문장 붙여 길게 말하기',19),
(20,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',2,'Unit 02','when/where/how/why 두 문장 붙여 길게 말하기',20),
(21,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',3,'Unit 03','if/whether 두 문장 붙여 길게 말하기',21),
(22,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',4,'Unit 04','and/but/or 두 문장 붙여 길게 말하기',22),
(23,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',5,'Unit 05','who/which/that 단어에 붙여 길게 말하기',23),
(24,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',6,'Unit 06','what 단어에 붙여 길게 말하기',24),
(25,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',7,'Unit 07','where/when/why/how 단어에 붙여 길게 말하기',25),
(26,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',8,'Unit 08','before/after/while/when 접속사로 붙여 길게 말하기',26),
(27,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',9,'Unit 09','as/because/so/since 접속사로 붙여 길게 말하기',27),
(28,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',10,'Unit 10','although/even though/though 접속사로 붙여 길게 말하기',28),
(29,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',11,'Unit 11','if/as long as/if only 접속사로 붙여 길게 말하기',29),
(30,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',12,'Unit 12','unless/what if/I wish 접속사로 붙여 길게 말하기',30),
(31,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',13,'Unit 13','like/as if/as though/even if 접속사로 붙여 길게 말하기',31),
(32,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',14,'Unit 14','want/plan/decide/need to를 이용해 동사 말하기',32),
(33,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',15,'Unit 15','would like to to를 이용해 동사 말하기',33),
(34,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',16,'Unit 16','I want you to to를 이용해 동사 말하기',34),
(35,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',17,'Unit 17','make/let/have/help to를 이용해 동사 말하기',35),
(36,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',18,'Unit 18','enjoy/keep/finish/mind -ing를 이용해 동사 말하기',36),
(37,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',19,'Unit 19','start/begin/continue -ing를 이용해 동사 말하기',37),
(38,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',20,'Unit 20','remember/regret/forget/try -ing를 이용해 동사 말하기',38),
(39,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',21,'Unit 21','see -ing/hear -ing -ing를 이용해 동사 말하기',39),
(40,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',22,'Unit 22','-ing -ing를 이용해 동사 말하기',40),
(41,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',23,'Unit 23','be p.p. p.p.를 이용해 동사 말하기',41),
(42,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',24,'Unit 24','a/an/-s/X 디테일도 지켜 말하기',42),
(43,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',25,'Unit 25','the/this/that/my/X 디테일도 지켜 말하기',43),
(44,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',26,'Unit 26','some/any 디테일도 지켜 말하기',44),
(45,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',27,'Unit 27','all/most/both/none 디테일도 지켜 말하기',45),
(46,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',28,'Unit 28','a few/a little/many/a lot of 디테일도 지켜 말하기',46),
(47,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',29,'Unit 29','at/on/in/of 전치사를 이용해 디테일하게 말하기',47),
(48,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',30,'Unit 30','off/about/for/during 전치사를 이용해 디테일하게 말하기',48),
(49,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',31,'Unit 31','across/around/along/through 전치사를 이용해 디테일하게 말하기',49),
(50,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',32,'Unit 32','by/until/before/after 전치사를 이용해 디테일하게 말하기',50),
(51,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',33,'Unit 33','behind/under/to/into 전치사를 이용해 디테일하게 말하기',51),
(52,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',34,'Unit 34','up/down 전치사를 이용해 디테일하게 말하기',52),
(53,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',35,'Unit 35','very/so/enough/too 부사를 이용해 디테일하게 말하기',53),
(54,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',36,'Unit 36','always/usually/often/sometimes 부사를 이용해 디테일하게 말하기',54),
(55,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',37,'Unit 37','never/already/still/yet 부사를 이용해 디테일하게 말하기',55),
(56,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',38,'Unit 38','just/even/ever/anymore 부사를 이용해 디테일하게 말하기',56),
(57,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',39,'Unit 39','-ever 부사를 이용해 디테일하게 말하기',57),
(58,1,'쉬운단어로 1분 영어 말하기',2,'Part 2',40,'Unit 40','too/as well/also/either 부사를 이용해 디테일하게 말하기',58),
(59,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',1,'Unit 01','간단한 자기소개',59),
(60,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',2,'Unit 02','내 직업',60),
(61,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',3,'Unit 03','내 성향',61),
(62,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',4,'Unit 04','우리 가족',62),
(63,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',5,'Unit 05','어제 있었던 일',63),
(64,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',6,'Unit 06','지난 주말에 있었던 일',64),
(65,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',7,'Unit 07','지금 하고 있는 일',65),
(66,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',8,'Unit 08','내일 할 일',66),
(67,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',9,'Unit 09','이번 주말에 할 일',67),
(68,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',10,'Unit 10','다음 휴가 때 하고 싶은 일',68),
(69,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',11,'Unit 11','좋아하는 영화, TV 프로그램',69),
(70,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',12,'Unit 12','좋아하는 음악, 가수',70),
(71,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',13,'Unit 13','좋아하는 책, 작가',71),
(72,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',14,'Unit 14','좋아하는 패션 스타일',72),
(73,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',15,'Unit 15','좋아하는 음식이나 맛집',73),
(74,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',16,'Unit 16','친한 친구나 지인',74),
(75,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',17,'Unit 17','가장 기억나는 여행지',75),
(76,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',18,'Unit 18','돈 모아서 꼭 사고 싶은 것',76),
(77,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',19,'Unit 19','태어나서 가장 잘한 일',77),
(78,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',20,'Unit 20','잊히지 않는 추억',78),
(79,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',21,'Unit 21','최근 힘들었던 일',79),
(80,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',22,'Unit 22','최근 가장 고민하는 일',80),
(81,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',23,'Unit 23','나를 힘들게 하는 사람',81),
(82,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',24,'Unit 24','올해 꼭 이루고 싶은 것',82),
(83,1,'쉬운단어로 1분 영어 말하기',3,'Part 3',25,'Unit 25','평생 꼭 이루고 싶은 것',83),
(84,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',1,'Day 001','나에 대해 About Me',1),
(85,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',2,'Day 002','하루 루틴 Daily Routine',2),
(86,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',3,'Day 003','내가 하는 일 My Work',3),
(87,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',4,'Day 004','가족 소개 My Family',4),
(88,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',5,'Day 005','집안일 담당 Housework',5),
(89,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',6,'Day 006','친구 관계 Friendship',6),
(90,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',7,'Day 007','날씨 이야기 Weather Talk',7),
(91,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',8,'Day 008','오늘 있었던 일 Sharing My Day',8),
(92,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',9,'Day 009','주말 계획 Weekend Plans',9),
(93,2,'영어 프리토킹 100일의 기적 with AI',1,'일상',10,'Day 010','이동 수단 Getting Around',10),
(94,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',11,'Day 011','요리 스킬 Cooking Skills',11),
(95,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',12,'Day 012','맛집 탐방 Food Adventures',12),
(96,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',13,'Day 013','영화와 미드 Movies and TV Shows',13),
(97,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',14,'Day 014','커피와 음료 Coffee and Drinks',14),
(98,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',15,'Day 015','좋아하는 공연 Favorite Performances',15),
(99,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',16,'Day 016','음악 감상 Listening to Music',16),
(100,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',17,'Day 017','패션 취향 Fashion Taste',17),
(101,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',18,'Day 018','쇼핑 습관 Shopping Habits',18),
(102,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',19,'Day 019','집 꾸미기 Home Deco',19),
(103,2,'영어 프리토킹 100일의 기적 with AI',2,'취향과 관심사',20,'Day 020','반려 동물 키우기 Pet Care',20),
(104,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',21,'Day 021','여행 이야기 Travel Stories',21),
(105,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',22,'Day 022','OTT 서비스 Streaming Platforms',22),
(106,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',23,'Day 023','라이브 콘서트 Live Concerts',23),
(107,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',24,'Day 024','게임 즐기기 Enjoying Games',24),
(108,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',25,'Day 025','전시 나들이 Exhibition Visits',25),
(109,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',26,'Day 026','책 읽기 Reading Books',26),
(110,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',27,'Day 027','글쓰기의 즐거움 The Joy of Writing',27),
(111,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',28,'Day 028','캠핑 경험 Camping Experience',28),
(112,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',29,'Day 029','스포츠 경기 관람 Watching Sports',29),
(113,2,'영어 프리토킹 100일의 기적 with AI',3,'취미와 여가',30,'Day 030','특별한 취미 Special Hobby',30),
(114,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',31,'Day 031','직장 생활 Life at Work',31),
(115,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',32,'Day 032','워라밸 Work-Life Balance',32),
(116,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',33,'Day 033','출퇴근 Commuting',33),
(117,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',34,'Day 034','직장 고민 Workplace Dilemma',34),
(118,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',35,'Day 035','이직 준비 Job Transition',35),
(119,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',36,'Day 036','시간 관리 Time Management',36),
(120,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',37,'Day 037','창업 아이디어 Business Ideas',37),
(121,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',38,'Day 038','자기 계발 Self-Improvement',38),
(122,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',39,'Day 039','외국어 공부 Language Learning',39),
(123,2,'영어 프리토킹 100일의 기적 with AI',4,'일과 학업',40,'Day 040','고학력 도전 Academic Goals',40),
(124,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',41,'Day 041','건강 관리 팁 Health Tips',41),
(125,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',42,'Day 042','규칙적인 운동 Regular Exercise',42),
(126,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',43,'Day 043','기분과 감정 Mood and Emotions',43),
(127,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',44,'Day 044','스트레스 해소 Stress Relief',44),
(128,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',45,'Day 045','다이어트 목표 Diet Goals',45),
(129,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',46,'Day 046','영양제 섭취 Taking Supplements',46),
(130,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',47,'Day 047','충분한 휴식 Getting Enough Rest',47),
(131,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',48,'Day 048','숙면 취하기 Quality Sleep',48),
(132,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',49,'Day 049','건강검진 Health Check-ups',49),
(133,2,'영어 프리토킹 100일의 기적 with AI',5,'건강과 웰빙',50,'Day 050','가족의 건강 Family Health',50),
(134,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',51,'Day 051','연애와 결혼 Dating and Marriage',51),
(135,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',52,'Day 052','아이와 육아 Parenting and Kids',52),
(136,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',53,'Day 053','친구와의 추억 Memories with Friends',53),
(137,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',54,'Day 054','부모님 건강 Parents Health',54),
(138,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',55,'Day 055','형제자매 근황 Sibling Updates',55),
(139,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',56,'Day 056','친척 모임 Relatives Gathering',56),
(140,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',57,'Day 057','나의 오랜 친구들 My Oldest Friends',57),
(141,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',58,'Day 058','성격 유형 Personality Types',58),
(142,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',59,'Day 059','갈등 해결 방법 Conflict Resolution',59),
(143,2,'영어 프리토킹 100일의 기적 with AI',6,'인간관계',60,'Day 060','인간관계 피로 Relationship Burnout',60),
(144,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',61,'Day 061','뷰티 트렌드 Beauty Trends',61),
(145,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',62,'Day 062','배달 문화 Delivery Culture',62),
(146,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',63,'Day 063','스마트폰 Smartphones',63),
(147,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',64,'Day 064','콘텐츠 시청 Viewing Content',64),
(148,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',65,'Day 065','소셜 미디어 Social Media',65),
(149,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',66,'Day 066','케이팝 K-pop',66),
(150,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',67,'Day 067','한국 드라마 K-drama',67),
(151,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',68,'Day 068','한국 음식 K-food',68),
(152,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',69,'Day 069','라이프 스타일 Lifestyle',69),
(153,2,'영어 프리토킹 100일의 기적 with AI',7,'트렌드',70,'Day 070','소비 성향 Spending Habits',70),
(154,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',71,'Day 071','행복 Happiness',71),
(155,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',72,'Day 072','성공의 기준 The Standard of Success',72),
(156,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',73,'Day 073','돈과 삶의 관계 Money and Life',73),
(157,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',74,'Day 074','삶의 우선순위 Life Priorities',74),
(158,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',75,'Day 075','자존감 Self-Esteem',75),
(159,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',76,'Day 076','경쟁과 협력 Competition and Cooperation',76),
(160,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',77,'Day 077','도전과 실패 Challenges and Failures',77),
(161,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',78,'Day 078','이상과 현실 Ideals and Reality',78),
(162,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',79,'Day 079','성장과 안주 Growth and Comfort',79),
(163,2,'영어 프리토킹 100일의 기적 with AI',8,'가치관',80,'Day 080','인생의 의미 The Meaning of Life',80),
(164,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',81,'Day 081','기술 격차 Digital Divide',81),
(165,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',82,'Day 082','가짜 뉴스 Fake News',82),
(166,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',83,'Day 083','정치에 대한 관심 Interest in Politics',83),
(167,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',84,'Day 084','물가 상승 Rising Costs',84),
(168,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',85,'Day 085','환경 오염 Environmental Pollution',85),
(169,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',86,'Day 086','타인과의 비교 Me vs. Others',86),
(170,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',87,'Day 087','인공지능 시대 Artificial Intelligence',87),
(171,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',88,'Day 088','저출산 Low Birth Rate',88),
(172,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',89,'Day 089','일자리 대체 Job Replacement',89),
(173,2,'영어 프리토킹 100일의 기적 with AI',9,'사회적 이슈',90,'Day 090','100세 시대 Living to 100',90),
(174,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',91,'Day 091','자아 실현 Personal Fulfillment',91),
(175,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',92,'Day 092','재테크 Investment',92),
(176,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',93,'Day 093','파이어족 Early Retirement Goals',93),
(177,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',94,'Day 094','살고 싶은 집 Dream House',94),
(178,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',95,'Day 095','경제적 자유 Financial Freedom',95),
(179,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',96,'Day 096','어릴 적 꿈 Childhood Dreams',96),
(180,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',97,'Day 097','현재의 꿈 Current Goals',97),
(181,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',98,'Day 098','버킷리스트 Bucket List',98),
(182,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',99,'Day 099','5년 후 In Five Years',99),
(183,2,'영어 프리토킹 100일의 기적 with AI',10,'미래 계획',100,'Day 100','10년 후 In Ten Years',100);
/*!40000 ALTER TABLE `book_chapters` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=606 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_answers`
--

LOCK TABLES `exam_answers` WRITE;
/*!40000 ALTER TABLE `exam_answers` DISABLE KEYS */;
INSERT INTO `exam_answers` VALUES
(31,2,31,'9-to-5 job',0,NULL,NULL,'2026-01-21 03:02:17'),
(32,2,32,'take a risk',1,NULL,NULL,'2026-01-21 03:02:17'),
(33,2,33,'do a ponytail',1,NULL,NULL,'2026-01-21 03:02:17'),
(34,2,34,'take a passport photo',1,NULL,NULL,'2026-01-21 03:02:17'),
(35,2,35,'take a picture',1,NULL,NULL,'2026-01-21 03:02:17'),
(36,2,36,'take the vaccuming',0,NULL,NULL,'2026-01-21 03:02:17'),
(37,2,37,'do my nails',1,NULL,NULL,'2026-01-21 03:02:17'),
(38,2,38,'take a course',1,NULL,NULL,'2026-01-21 03:02:17'),
(39,2,39,'do my make up',1,NULL,NULL,'2026-01-21 03:02:17'),
(40,2,40,'hang out',1,NULL,NULL,'2026-01-21 03:02:17'),
(41,2,41,'all-rounder at home',1,NULL,NULL,'2026-01-21 03:02:17'),
(42,2,42,'do my homework',1,NULL,NULL,'2026-01-21 03:02:17'),
(43,2,43,'do my stuff',1,NULL,NULL,'2026-01-21 03:02:17'),
(44,2,44,'take a shower',1,NULL,NULL,'2026-01-21 03:02:17'),
(45,2,45,'take supplement',0,NULL,NULL,'2026-01-21 03:02:17'),
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
(63,3,33,'take a ponytail',0,NULL,NULL,'2026-01-21 03:10:07'),
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
(75,3,45,'take vitaming',0,NULL,NULL,'2026-01-21 03:10:07'),
(76,3,46,'do me a favor',1,NULL,NULL,'2026-01-21 03:10:07'),
(77,3,47,'get along great',0,NULL,NULL,'2026-01-21 03:10:07'),
(78,3,48,'take my bag',1,NULL,NULL,'2026-01-21 03:10:07'),
(79,3,49,'office worker',1,NULL,NULL,'2026-01-21 03:10:07'),
(80,3,50,'take a break',1,NULL,NULL,'2026-01-21 03:10:07'),
(81,3,51,'take action',1,NULL,NULL,'2026-01-21 03:10:07'),
(82,3,52,'a working couple',1,NULL,NULL,'2026-01-21 03:10:07'),
(83,3,53,'personality',1,NULL,NULL,'2026-01-21 03:10:07'),
(84,3,54,'quit',1,NULL,NULL,'2026-01-21 03:10:07'),
(85,3,55,'teke a class',1,NULL,NULL,'2026-01-21 03:10:07'),
(86,3,56,'do the chores',1,NULL,NULL,'2026-01-21 03:10:07'),
(87,3,57,'at work',1,NULL,NULL,'2026-01-21 03:10:07'),
(88,3,58,'an opposit in personality',1,NULL,NULL,'2026-01-21 03:10:07'),
(89,3,59,'take my hand',1,NULL,NULL,'2026-01-21 03:10:07'),
(90,3,60,'get along great',1,NULL,NULL,'2026-01-21 03:10:07'),
(91,4,31,'a 9 to 6 job',0,NULL,NULL,'2026-01-21 03:10:09'),
(92,4,32,'take a risk',1,NULL,NULL,'2026-01-21 03:10:09'),
(93,4,33,'take a ponytail',0,NULL,NULL,'2026-01-21 03:10:09'),
(94,4,34,'take a passport photo',1,NULL,NULL,'2026-01-21 03:10:09'),
(95,4,35,'take a photo.',1,NULL,NULL,'2026-01-21 03:10:09'),
(96,4,36,'take the vacuuming',0,NULL,NULL,'2026-01-21 03:10:09'),
(97,4,37,'do my nails',1,NULL,NULL,'2026-01-21 03:10:09'),
(98,4,38,'take a course',1,NULL,NULL,'2026-01-21 03:10:09'),
(99,4,39,'do my makeup',1,NULL,NULL,'2026-01-21 03:10:09'),
(100,4,40,'get along hang out',0,NULL,NULL,'2026-01-21 03:10:09'),
(101,4,41,'all-rounder at home',1,NULL,NULL,'2026-01-21 03:10:09'),
(102,4,42,'do my homework',1,NULL,NULL,'2026-01-21 03:10:09'),
(103,4,43,'do my stuff',1,NULL,NULL,'2026-01-21 03:10:09'),
(104,4,44,'take a shower',1,NULL,NULL,'2026-01-21 03:10:09'),
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
(123,5,33,'take a ponytail',0,NULL,NULL,'2026-01-21 03:19:23'),
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
(150,5,60,'get along great',1,NULL,NULL,'2026-01-21 03:19:23'),
(186,7,96,'make time',1,NULL,NULL,'2026-01-28 01:59:41'),
(187,7,97,'go shopping',1,NULL,NULL,'2026-01-28 01:59:41'),
(188,7,98,'make trouble',1,NULL,NULL,'2026-01-28 01:59:41'),
(189,7,99,'tough time',0,NULL,NULL,'2026-01-28 01:59:41'),
(190,7,100,'go on a trip',0,NULL,NULL,'2026-01-28 01:59:41'),
(191,7,101,'make a suggestion',1,NULL,NULL,'2026-01-28 01:59:41'),
(192,7,102,'go on a picnic',1,NULL,NULL,'2026-01-28 01:59:41'),
(193,7,103,'go for dinner',1,NULL,NULL,'2026-01-28 01:59:41'),
(194,7,104,'make a good impression',1,NULL,NULL,'2026-01-28 01:59:41'),
(195,7,105,'finding nice restaurants',1,NULL,NULL,'2026-01-28 01:59:41'),
(196,7,106,'nice restaurant',1,NULL,NULL,'2026-01-28 01:59:41'),
(197,7,107,'be in charge of',1,NULL,NULL,'2026-01-28 01:59:41'),
(198,7,108,'go for lunch',1,NULL,NULL,'2026-01-28 01:59:41'),
(199,7,109,'make a different',0,NULL,NULL,'2026-01-28 01:59:41'),
(200,7,110,'anymore',1,NULL,NULL,'2026-01-28 01:59:41'),
(201,7,111,'tough',1,NULL,NULL,'2026-01-28 01:59:41'),
(202,7,112,'go for a walk',1,NULL,NULL,'2026-01-28 01:59:41'),
(203,7,113,'go to work',1,NULL,NULL,'2026-01-28 01:59:41'),
(204,7,114,'meeting up',1,NULL,NULL,'2026-01-28 01:59:41'),
(205,7,115,'go to the grocery store',1,NULL,NULL,'2026-01-28 01:59:41'),
(206,7,116,'make a wish',1,NULL,NULL,'2026-01-28 01:59:41'),
(207,7,117,'bond',1,NULL,NULL,'2026-01-28 01:59:41'),
(208,7,118,'make a mistake',1,NULL,NULL,'2026-01-28 01:59:41'),
(209,7,119,'help each other',1,NULL,NULL,'2026-01-28 01:59:41'),
(210,7,120,'make noise',1,NULL,NULL,'2026-01-28 01:59:41'),
(211,7,121,'when it comes of',0,NULL,NULL,'2026-01-28 01:59:41'),
(212,7,122,'go to the drugstore',1,NULL,NULL,'2026-01-28 01:59:41'),
(213,7,123,'last',1,NULL,NULL,'2026-01-28 01:59:41'),
(214,7,124,'sell',1,NULL,NULL,'2026-01-28 01:59:41'),
(215,7,125,'doing the laundry',1,NULL,NULL,'2026-01-28 01:59:41'),
(216,7,126,'do my makeup',1,NULL,NULL,'2026-01-28 01:59:41'),
(217,7,127,'take a call',1,NULL,NULL,'2026-01-28 01:59:41'),
(218,7,128,'opposide people',0,NULL,NULL,'2026-01-28 01:59:41'),
(219,7,129,'do the chores',1,NULL,NULL,'2026-01-28 01:59:41'),
(220,7,130,'typical korean family',1,NULL,NULL,'2026-01-28 01:59:41'),
(221,8,96,'make time',1,NULL,NULL,'2026-01-28 03:34:44'),
(222,8,97,'go shopping',1,NULL,NULL,'2026-01-28 03:34:44'),
(223,8,98,'make trouble',1,NULL,NULL,'2026-01-28 03:34:44'),
(224,8,99,'tough times',1,NULL,NULL,'2026-01-28 03:34:44'),
(225,8,100,'go on a tour',1,NULL,NULL,'2026-01-28 03:34:44'),
(226,8,101,'make a suggestion',1,NULL,NULL,'2026-01-28 03:34:44'),
(227,8,102,'go on a picnic',1,NULL,NULL,'2026-01-28 03:34:44'),
(228,8,103,'go for dinner',1,NULL,NULL,'2026-01-28 03:34:44'),
(229,8,104,'make a good impression',1,NULL,NULL,'2026-01-28 03:34:44'),
(230,8,105,'finding nice restaurants',1,NULL,NULL,'2026-01-28 03:34:44'),
(231,8,106,'nice restaurant',1,NULL,NULL,'2026-01-28 03:34:44'),
(232,8,107,'be in charge of',1,NULL,NULL,'2026-01-28 03:34:44'),
(233,8,108,'go for lunch',1,NULL,NULL,'2026-01-28 03:34:44'),
(234,8,109,'make a difference',1,NULL,NULL,'2026-01-28 03:34:44'),
(235,8,110,'anymore',1,NULL,NULL,'2026-01-28 03:34:44'),
(236,8,111,'tough',1,NULL,NULL,'2026-01-28 03:34:44'),
(237,8,112,'go for a walk',1,NULL,NULL,'2026-01-28 03:34:44'),
(238,8,113,'go to work',1,NULL,NULL,'2026-01-28 03:34:44'),
(239,8,114,'meeting up',1,NULL,NULL,'2026-01-28 03:34:44'),
(240,8,115,'go to the grocery store',1,NULL,NULL,'2026-01-28 03:34:44'),
(241,8,116,'make a wish',1,NULL,NULL,'2026-01-28 03:34:44'),
(242,8,117,'bond',1,NULL,NULL,'2026-01-28 03:34:44'),
(243,8,118,'make a mistake',1,NULL,NULL,'2026-01-28 03:34:44'),
(244,8,119,'help each other',1,NULL,NULL,'2026-01-28 03:34:44'),
(245,8,120,'make noise',1,NULL,NULL,'2026-01-28 03:34:44'),
(246,8,121,'when it comes to',1,NULL,NULL,'2026-01-28 03:34:44'),
(247,8,122,'go to the drug store',1,NULL,NULL,'2026-01-28 03:34:44'),
(248,8,123,'last',1,NULL,NULL,'2026-01-28 03:34:44'),
(249,8,124,'sell',1,NULL,NULL,'2026-01-28 03:34:44'),
(250,8,125,'doing the laundry',1,NULL,NULL,'2026-01-28 03:34:44'),
(251,8,126,'take my makeup',0,NULL,NULL,'2026-01-28 03:34:44'),
(252,8,127,'take a call',1,NULL,NULL,'2026-01-28 03:34:44'),
(253,8,128,'an opposite in personality',0,NULL,NULL,'2026-01-28 03:34:44'),
(254,8,129,'do the chores',1,NULL,NULL,'2026-01-28 03:34:44'),
(255,8,130,'typical korean family',1,NULL,NULL,'2026-01-28 03:34:44'),
(256,9,96,'make time',1,NULL,NULL,'2026-01-28 03:34:47'),
(257,9,97,'go shopping',1,NULL,NULL,'2026-01-28 03:34:47'),
(258,9,98,'make trouble',1,NULL,NULL,'2026-01-28 03:34:47'),
(259,9,99,'tough times',1,NULL,NULL,'2026-01-28 03:34:47'),
(260,9,100,'go on a tour',1,NULL,NULL,'2026-01-28 03:34:47'),
(261,9,101,'make a decision',0,NULL,NULL,'2026-01-28 03:34:47'),
(262,9,102,'go on a picnic',1,NULL,NULL,'2026-01-28 03:34:47'),
(263,9,103,'go for dinner',1,NULL,NULL,'2026-01-28 03:34:47'),
(264,9,104,'make a good impression',1,NULL,NULL,'2026-01-28 03:34:47'),
(265,9,105,'finding nice restaurants',1,NULL,NULL,'2026-01-28 03:34:47'),
(266,9,106,'nice restaurant',1,NULL,NULL,'2026-01-28 03:34:47'),
(267,9,107,'be in charge of ~',1,NULL,NULL,'2026-01-28 03:34:47'),
(268,9,108,'go for lunch',1,NULL,NULL,'2026-01-28 03:34:47'),
(269,9,109,'make a difference',1,NULL,NULL,'2026-01-28 03:34:47'),
(270,9,110,'anymore',1,NULL,NULL,'2026-01-28 03:34:47'),
(271,9,111,'tough',1,NULL,NULL,'2026-01-28 03:34:47'),
(272,9,112,'go for a walk',1,NULL,NULL,'2026-01-28 03:34:47'),
(273,9,113,'go to work',1,NULL,NULL,'2026-01-28 03:34:47'),
(274,9,114,'meeting up',1,NULL,NULL,'2026-01-28 03:34:47'),
(275,9,115,'go to the grocery store.',1,NULL,NULL,'2026-01-28 03:34:47'),
(276,9,116,'make a wish',1,NULL,NULL,'2026-01-28 03:34:47'),
(277,9,117,'bond',1,NULL,NULL,'2026-01-28 03:34:47'),
(278,9,118,'make a mistake',1,NULL,NULL,'2026-01-28 03:34:47'),
(279,9,119,'help each other',1,NULL,NULL,'2026-01-28 03:34:47'),
(280,9,120,'make noise',1,NULL,NULL,'2026-01-28 03:34:47'),
(281,9,121,'when it comes to',1,NULL,NULL,'2026-01-28 03:34:47'),
(282,9,122,'go to the drugstore',1,NULL,NULL,'2026-01-28 03:34:47'),
(283,9,123,'last',1,NULL,NULL,'2026-01-28 03:34:47'),
(284,9,124,'sell',1,NULL,NULL,'2026-01-28 03:34:47'),
(285,9,125,'doing the laundry',1,NULL,NULL,'2026-01-28 03:34:47'),
(286,9,126,'do make up',0,NULL,NULL,'2026-01-28 03:34:47'),
(287,9,127,'take a call',1,NULL,NULL,'2026-01-28 03:34:47'),
(288,9,128,'an opposite in personality',0,NULL,NULL,'2026-01-28 03:34:47'),
(289,9,129,'do the chore',0,NULL,NULL,'2026-01-28 03:34:47'),
(290,9,130,'tranditional korean family',0,NULL,NULL,'2026-01-28 03:34:47'),
(291,10,96,'make time',1,NULL,NULL,'2026-01-28 03:34:56'),
(292,10,97,'go shopping',1,NULL,NULL,'2026-01-28 03:34:56'),
(293,10,98,'make trouble',1,NULL,NULL,'2026-01-28 03:34:56'),
(294,10,99,'tough times',1,NULL,NULL,'2026-01-28 03:34:56'),
(295,10,100,'go for a tour',0,NULL,NULL,'2026-01-28 03:34:56'),
(296,10,101,'make a suggestion',1,NULL,NULL,'2026-01-28 03:34:56'),
(297,10,102,'go for a picnic',0,NULL,NULL,'2026-01-28 03:34:56'),
(298,10,103,'go for dinner',1,NULL,NULL,'2026-01-28 03:34:56'),
(299,10,104,'make a good impression',1,NULL,NULL,'2026-01-28 03:34:56'),
(300,10,105,'finding nice restaurants',1,NULL,NULL,'2026-01-28 03:34:56'),
(301,10,106,'nice restaurant',1,NULL,NULL,'2026-01-28 03:34:56'),
(302,10,107,'be in charge of',1,NULL,NULL,'2026-01-28 03:34:56'),
(303,10,108,'go for lunch',1,NULL,NULL,'2026-01-28 03:34:56'),
(304,10,109,'make a difference',1,NULL,NULL,'2026-01-28 03:34:56'),
(305,10,110,'anymore',1,NULL,NULL,'2026-01-28 03:34:56'),
(306,10,111,'tough',1,NULL,NULL,'2026-01-28 03:34:56'),
(307,10,112,'go for a walk',1,NULL,NULL,'2026-01-28 03:34:56'),
(308,10,113,'go to work',1,NULL,NULL,'2026-01-28 03:34:56'),
(309,10,114,'meeting',0,NULL,NULL,'2026-01-28 03:34:56'),
(310,10,115,'go to the grocery store',1,NULL,NULL,'2026-01-28 03:34:56'),
(311,10,116,'make a wish',1,NULL,NULL,'2026-01-28 03:34:56'),
(312,10,117,'bond',1,NULL,NULL,'2026-01-28 03:34:56'),
(313,10,118,'make',0,NULL,NULL,'2026-01-28 03:34:56'),
(314,10,119,'help each other',1,NULL,NULL,'2026-01-28 03:34:56'),
(315,10,120,'make noise',1,NULL,NULL,'2026-01-28 03:34:56'),
(316,10,121,'when it comes to',1,NULL,NULL,'2026-01-28 03:34:56'),
(317,10,122,'go to the drugstore',1,NULL,NULL,'2026-01-28 03:34:56'),
(318,10,123,'for hours',0,NULL,NULL,'2026-01-28 03:34:56'),
(319,10,124,'sell',1,NULL,NULL,'2026-01-28 03:34:56'),
(320,10,125,'doing the laundry',1,NULL,NULL,'2026-01-28 03:34:56'),
(321,10,126,'do makeup',0,NULL,NULL,'2026-01-28 03:34:56'),
(322,10,127,'get a call',0,NULL,NULL,'2026-01-28 03:34:56'),
(323,10,128,'an opposite in personality',0,NULL,NULL,'2026-01-28 03:34:56'),
(324,10,129,'do the chore',0,NULL,NULL,'2026-01-28 03:34:56'),
(325,10,130,'The typical Korean family',0,NULL,NULL,'2026-01-28 03:34:56'),
(326,11,131,'Wrap up',1,NULL,NULL,'2026-02-04 03:45:44'),
(327,11,132,'Be busy',1,NULL,NULL,'2026-02-04 03:45:44'),
(328,11,133,'Be at home',1,NULL,NULL,'2026-02-04 03:45:44'),
(329,11,134,'Be on time',1,NULL,NULL,'2026-02-04 03:45:44'),
(330,11,135,'enjoy',1,NULL,NULL,'2026-02-04 03:45:44'),
(331,11,136,'rainy days',1,NULL,NULL,'2026-02-04 03:45:44'),
(332,11,137,'Check the weather forecast',1,NULL,NULL,'2026-02-04 03:45:44'),
(333,11,138,'Peaceful',1,NULL,NULL,'2026-02-04 03:45:44'),
(334,11,139,'Put off',1,NULL,NULL,'2026-02-04 03:45:44'),
(335,11,140,'I\'m going to have breakfast',1,NULL,NULL,'2026-02-04 03:45:44'),
(336,11,141,'I\'m doing yoga',0,NULL,NULL,'2026-02-04 03:45:44'),
(337,11,142,'finish everything',1,NULL,NULL,'2026-02-04 03:45:44'),
(338,11,143,'Clean',1,NULL,NULL,'2026-02-04 03:45:44'),
(339,11,144,'try',1,NULL,NULL,'2026-02-04 03:45:44'),
(340,11,145,'finish',1,NULL,NULL,'2026-02-04 03:45:44'),
(341,11,146,'I do my hair everyday',1,NULL,NULL,'2026-02-04 03:45:44'),
(342,11,147,'finish reading the book',1,NULL,NULL,'2026-02-04 03:45:44'),
(343,11,148,'they are going for a walk',1,NULL,NULL,'2026-02-04 03:45:44'),
(344,11,149,'I\'m doing my hair',1,NULL,NULL,'2026-02-04 03:45:44'),
(345,11,150,'feel enegized',0,NULL,NULL,'2026-02-04 03:45:44'),
(346,11,151,'Be in first place',1,NULL,NULL,'2026-02-04 03:45:44'),
(347,11,152,'every morning',1,NULL,NULL,'2026-02-04 03:45:44'),
(348,11,153,'Just',1,NULL,NULL,'2026-02-04 03:45:44'),
(349,11,154,'in their own way',1,NULL,NULL,'2026-02-04 03:45:44'),
(350,11,155,'Be lagular customer',0,NULL,NULL,'2026-02-04 03:45:44'),
(351,11,156,'Be rich',1,NULL,NULL,'2026-02-04 03:45:44'),
(352,11,157,'Be at work',1,NULL,NULL,'2026-02-04 03:45:44'),
(353,11,158,'favorite',1,NULL,NULL,'2026-02-04 03:45:44'),
(354,11,159,'Be hot',1,NULL,NULL,'2026-02-04 03:45:44'),
(355,11,160,'sunny',1,NULL,NULL,'2026-02-04 03:45:44'),
(356,11,161,'go on a picnic',1,NULL,NULL,'2026-02-04 03:45:44'),
(357,11,162,'finding nice restaurants',1,NULL,NULL,'2026-02-04 03:45:44'),
(358,11,163,'any more',1,NULL,NULL,'2026-02-04 03:45:44'),
(359,11,164,'go on a tour',1,NULL,NULL,'2026-02-04 03:45:44'),
(360,11,165,'get along',1,NULL,NULL,'2026-02-04 03:45:44'),
(361,12,131,'wrap up',1,NULL,NULL,'2026-02-04 03:55:05'),
(362,12,132,'busy',0,NULL,NULL,'2026-02-04 03:55:05'),
(363,12,133,'be at home',1,NULL,NULL,'2026-02-04 03:55:05'),
(364,12,134,'be on time',1,NULL,NULL,'2026-02-04 03:55:05'),
(365,12,135,'enjoy',1,NULL,NULL,'2026-02-04 03:55:05'),
(366,12,136,'rainy days',1,NULL,NULL,'2026-02-04 03:55:05'),
(367,12,137,'check the weather forecast',1,NULL,NULL,'2026-02-04 03:55:05'),
(368,12,138,'peaceful',1,NULL,NULL,'2026-02-04 03:55:05'),
(369,12,139,'put off',1,NULL,NULL,'2026-02-04 03:55:05'),
(370,12,140,'I\'m going to have breakfast',1,NULL,NULL,'2026-02-04 03:55:05'),
(371,12,141,'I\'m doing yoga now',1,NULL,NULL,'2026-02-04 03:55:05'),
(372,12,142,'finish everything',1,NULL,NULL,'2026-02-04 03:55:05'),
(373,12,143,'clean',1,NULL,NULL,'2026-02-04 03:55:05'),
(374,12,144,'try',1,NULL,NULL,'2026-02-04 03:55:05'),
(375,12,145,'finish',1,NULL,NULL,'2026-02-04 03:55:05'),
(376,12,146,'I do my hair everyday',1,NULL,NULL,'2026-02-04 03:55:05'),
(377,12,147,'finish reading the book',1,NULL,NULL,'2026-02-04 03:55:05'),
(378,12,148,'They\'re going for a walk.',1,NULL,NULL,'2026-02-04 03:55:05'),
(379,12,149,'I\'m doing my hair',1,NULL,NULL,'2026-02-04 03:55:05'),
(380,12,150,'feel energized',1,NULL,NULL,'2026-02-04 03:55:05'),
(381,12,151,'be in first place',1,NULL,NULL,'2026-02-04 03:55:05'),
(382,12,152,'every morning',1,NULL,NULL,'2026-02-04 03:55:05'),
(383,12,153,'just',1,NULL,NULL,'2026-02-04 03:55:05'),
(384,12,154,'on their own way',0,NULL,NULL,'2026-02-04 03:55:05'),
(385,12,155,'be a regular customer',1,NULL,NULL,'2026-02-04 03:55:05'),
(386,12,156,'be rich',1,NULL,NULL,'2026-02-04 03:55:05'),
(387,12,157,'be at work',1,NULL,NULL,'2026-02-04 03:55:05'),
(388,12,158,'favorite',1,NULL,NULL,'2026-02-04 03:55:05'),
(389,12,159,'be hot',1,NULL,NULL,'2026-02-04 03:55:05'),
(390,12,160,'sunny',1,NULL,NULL,'2026-02-04 03:55:05'),
(391,12,161,'go on a picnic',1,NULL,NULL,'2026-02-04 03:55:05'),
(392,12,162,'finding nice restaurants',1,NULL,NULL,'2026-02-04 03:55:05'),
(393,12,163,'anymore',1,NULL,NULL,'2026-02-04 03:55:05'),
(394,12,164,'go on a tour',1,NULL,NULL,'2026-02-04 03:55:05'),
(395,12,165,'get along',1,NULL,NULL,'2026-02-04 03:55:05'),
(396,13,131,'wrap up',1,NULL,NULL,'2026-02-04 03:55:09'),
(397,13,132,'be busy',1,NULL,NULL,'2026-02-04 03:55:09'),
(398,13,133,'be at home',1,NULL,NULL,'2026-02-04 03:55:09'),
(399,13,134,'be on time',1,NULL,NULL,'2026-02-04 03:55:09'),
(400,13,135,'enjoy',1,NULL,NULL,'2026-02-04 03:55:09'),
(401,13,136,'rainy days',1,NULL,NULL,'2026-02-04 03:55:09'),
(402,13,137,'check the weather forecast',1,NULL,NULL,'2026-02-04 03:55:09'),
(403,13,138,'peaceful',1,NULL,NULL,'2026-02-04 03:55:09'),
(404,13,139,'put off',1,NULL,NULL,'2026-02-04 03:55:09'),
(405,13,140,'I\'m going to have breakfast.',1,NULL,NULL,'2026-02-04 03:55:09'),
(406,13,141,'I\'m doing yoga now.',1,NULL,NULL,'2026-02-04 03:55:09'),
(407,13,142,'finish everything',1,NULL,NULL,'2026-02-04 03:55:09'),
(408,13,143,'clean',1,NULL,NULL,'2026-02-04 03:55:09'),
(409,13,144,'try',1,NULL,NULL,'2026-02-04 03:55:09'),
(410,13,145,'finish',1,NULL,NULL,'2026-02-04 03:55:09'),
(411,13,146,'I do my hair everyday.',1,NULL,NULL,'2026-02-04 03:55:09'),
(412,13,147,'finish reading the book.',1,NULL,NULL,'2026-02-04 03:55:09'),
(413,13,148,'They are going to go for a walk.',0,NULL,NULL,'2026-02-04 03:55:09'),
(414,13,149,'I am doing my hair.',1,NULL,NULL,'2026-02-04 03:55:09'),
(415,13,150,'feel energized',1,NULL,NULL,'2026-02-04 03:55:09'),
(416,13,151,'be in first place',1,NULL,NULL,'2026-02-04 03:55:09'),
(417,13,152,'every morning',1,NULL,NULL,'2026-02-04 03:55:09'),
(418,13,153,'just',1,NULL,NULL,'2026-02-04 03:55:09'),
(419,13,154,'in their own day',0,NULL,NULL,'2026-02-04 03:55:09'),
(420,13,155,'be a regular customer',1,NULL,NULL,'2026-02-04 03:55:09'),
(421,13,156,'be rich',1,NULL,NULL,'2026-02-04 03:55:09'),
(422,13,157,'be at work',1,NULL,NULL,'2026-02-04 03:55:09'),
(423,13,158,'favorite',1,NULL,NULL,'2026-02-04 03:55:09'),
(424,13,159,'be hot',1,NULL,NULL,'2026-02-04 03:55:09'),
(425,13,160,'sunny',1,NULL,NULL,'2026-02-04 03:55:09'),
(426,13,161,'go on a picnic.',1,NULL,NULL,'2026-02-04 03:55:09'),
(427,13,162,'finding nice restaurants',1,NULL,NULL,'2026-02-04 03:55:09'),
(428,13,163,'anymore',1,NULL,NULL,'2026-02-04 03:55:09'),
(429,13,164,'go on a tour',1,NULL,NULL,'2026-02-04 03:55:09'),
(430,13,165,'belong',0,NULL,NULL,'2026-02-04 03:55:09'),
(431,14,131,'wrap up',1,NULL,NULL,'2026-02-04 03:55:21'),
(432,14,132,'be busy.',1,NULL,NULL,'2026-02-04 03:55:21'),
(433,14,133,'be at home.',1,NULL,NULL,'2026-02-04 03:55:21'),
(434,14,134,'be on time.',1,NULL,NULL,'2026-02-04 03:55:21'),
(435,14,135,'enjoy.',1,NULL,NULL,'2026-02-04 03:55:21'),
(436,14,136,'rainy days.',1,NULL,NULL,'2026-02-04 03:55:21'),
(437,14,137,'check the weather forecast.',1,NULL,NULL,'2026-02-04 03:55:21'),
(438,14,138,'peaceful',1,NULL,NULL,'2026-02-04 03:55:21'),
(439,14,139,'put off.',1,NULL,NULL,'2026-02-04 03:55:21'),
(440,14,140,'I\'m going to have breakfast.',1,NULL,NULL,'2026-02-04 03:55:21'),
(441,14,141,'I\'m doing Pilates',0,NULL,NULL,'2026-02-04 03:55:21'),
(442,14,142,'finish everything.',1,NULL,NULL,'2026-02-04 03:55:21'),
(443,14,143,'clean',1,NULL,NULL,'2026-02-04 03:55:21'),
(444,14,144,'try.',1,NULL,NULL,'2026-02-04 03:55:21'),
(445,14,145,'be over.',0,NULL,NULL,'2026-02-04 03:55:21'),
(446,14,146,'I do my hair everyday.',1,NULL,NULL,'2026-02-04 03:55:21'),
(447,14,147,'finish reading the book.',1,NULL,NULL,'2026-02-04 03:55:21'),
(448,14,148,'They are going for a walk.',1,NULL,NULL,'2026-02-04 03:55:21'),
(449,14,149,'I\'m doing my hair.',1,NULL,NULL,'2026-02-04 03:55:21'),
(450,14,150,'feel energized.',1,NULL,NULL,'2026-02-04 03:55:21'),
(451,14,151,'be in first place.',1,NULL,NULL,'2026-02-04 03:55:21'),
(452,14,152,'every morning.',1,NULL,NULL,'2026-02-04 03:55:21'),
(453,14,153,'just.',1,NULL,NULL,'2026-02-04 03:55:21'),
(454,14,154,'in their own way',1,NULL,NULL,'2026-02-04 03:55:21'),
(455,14,155,'be a regular customer.',1,NULL,NULL,'2026-02-04 03:55:21'),
(456,14,156,'be rich.',1,NULL,NULL,'2026-02-04 03:55:21'),
(457,14,157,'be at work.',1,NULL,NULL,'2026-02-04 03:55:21'),
(458,14,158,'favorite.',1,NULL,NULL,'2026-02-04 03:55:21'),
(459,14,159,'be hot.',1,NULL,NULL,'2026-02-04 03:55:21'),
(460,14,160,'sunny.',1,NULL,NULL,'2026-02-04 03:55:21'),
(461,14,161,'go for picnic.',0,NULL,NULL,'2026-02-04 03:55:21'),
(462,14,162,'finding nice restaurants.',1,NULL,NULL,'2026-02-04 03:55:21'),
(463,14,163,'anymore.',1,NULL,NULL,'2026-02-04 03:55:21'),
(464,14,164,'go for tour.',0,NULL,NULL,'2026-02-04 03:55:21'),
(465,14,165,'get along',1,NULL,NULL,'2026-02-04 03:55:21'),
(466,15,166,'drive',1,NULL,NULL,'2026-02-11 03:37:55'),
(467,15,167,'I have gotten Lasik surgery',1,NULL,NULL,'2026-02-11 03:37:55'),
(468,15,168,'more often',1,NULL,NULL,'2026-02-11 03:37:55'),
(469,15,169,'drive a supercar',1,NULL,NULL,'2026-02-11 03:37:55'),
(470,15,170,'department store',1,NULL,NULL,'2026-02-11 03:37:55'),
(471,15,171,'I have been taking my medicine',1,NULL,NULL,'2026-02-11 03:37:55'),
(472,15,172,'I made a vow yesterday',1,NULL,NULL,'2026-02-11 03:37:55'),
(473,15,173,'I have to get a flu shot',1,NULL,NULL,'2026-02-11 03:37:55'),
(474,15,174,'I have to take a passport photo.',1,NULL,NULL,'2026-02-11 03:37:55'),
(475,15,175,'on the weekend',1,NULL,NULL,'2026-02-11 03:37:55'),
(476,15,176,'I have been doing yoga for two hours.',1,NULL,NULL,'2026-02-11 03:37:55'),
(477,15,177,'I have just gotten an e-mail',1,NULL,NULL,'2026-02-11 03:37:55'),
(478,15,178,'I did yoga yesterday',1,NULL,NULL,'2026-02-11 03:37:55'),
(479,15,179,'I did yoga yesterday',1,NULL,NULL,'2026-02-11 03:37:55'),
(480,15,180,'weekend',1,NULL,NULL,'2026-02-11 03:37:55'),
(481,15,181,'outfit',1,NULL,NULL,'2026-02-11 03:37:55'),
(482,15,182,'I have to do yoga',1,NULL,NULL,'2026-02-11 03:37:55'),
(483,15,183,'I have to do the vacuuming',1,NULL,NULL,'2026-02-11 03:37:55'),
(484,15,184,'I have done yoga before',1,NULL,NULL,'2026-02-11 03:37:55'),
(485,15,185,'I have to get a job',1,NULL,NULL,'2026-02-11 03:37:55'),
(486,15,186,'I have made a vow before',1,NULL,NULL,'2026-02-11 03:37:55'),
(487,15,187,'I made a promise yesterday',1,NULL,NULL,'2026-02-11 03:37:55'),
(488,15,188,'get around',1,NULL,NULL,'2026-02-11 03:37:55'),
(489,15,189,'order',1,NULL,NULL,'2026-02-11 03:37:55'),
(490,15,190,'feel like',1,NULL,NULL,'2026-02-11 03:37:55'),
(491,15,191,'get my hair colored',1,NULL,NULL,'2026-02-11 03:37:55'),
(492,15,192,'I have just taken my medicine',1,NULL,NULL,'2026-02-11 03:37:55'),
(493,15,193,'I have to go to the grocery store',1,NULL,NULL,'2026-02-11 03:37:55'),
(494,15,194,'on weekends',1,NULL,NULL,'2026-02-11 03:37:55'),
(495,15,195,'without my car',1,NULL,NULL,'2026-02-11 03:37:55'),
(496,15,196,'I am doing Pilates',1,NULL,NULL,'2026-02-11 03:37:55'),
(497,15,197,'I do yoga everyday',1,NULL,NULL,'2026-02-11 03:37:55'),
(498,15,198,'take a call',1,NULL,NULL,'2026-02-11 03:37:55'),
(499,15,199,'an opposite in personality',1,NULL,NULL,'2026-02-11 03:37:55'),
(500,15,200,'survey',0,NULL,NULL,'2026-02-11 03:37:55'),
(501,16,166,'Drive',1,NULL,NULL,'2026-02-11 03:38:01'),
(502,16,167,'I\'ve gotten Lasic Surgery',0,NULL,NULL,'2026-02-11 03:38:01'),
(503,16,168,'more often',1,NULL,NULL,'2026-02-11 03:38:01'),
(504,16,169,'Drive a supercar',1,NULL,NULL,'2026-02-11 03:38:01'),
(505,16,170,'Department Store',1,NULL,NULL,'2026-02-11 03:38:01'),
(506,16,171,'I\'ve been taking my medicine',1,NULL,NULL,'2026-02-11 03:38:01'),
(507,16,172,'I made a vow yesterday',1,NULL,NULL,'2026-02-11 03:38:01'),
(508,16,173,'I have to get a flu shot',1,NULL,NULL,'2026-02-11 03:38:01'),
(509,16,174,'I have to take a passport photo',1,NULL,NULL,'2026-02-11 03:38:01'),
(510,16,175,'on the weekend',1,NULL,NULL,'2026-02-11 03:38:01'),
(511,16,176,'I\'ve been doing yoga for two hours',1,NULL,NULL,'2026-02-11 03:38:01'),
(512,16,177,'I\'ve just gotten an email',1,NULL,NULL,'2026-02-11 03:38:01'),
(513,16,178,'I did yoga yesterday',1,NULL,NULL,'2026-02-11 03:38:01'),
(514,16,179,'I did yoga yesterday',1,NULL,NULL,'2026-02-11 03:38:01'),
(515,16,180,'weekend',1,NULL,NULL,'2026-02-11 03:38:01'),
(516,16,181,'Outfit',1,NULL,NULL,'2026-02-11 03:38:01'),
(517,16,182,'I have to yoga',0,NULL,NULL,'2026-02-11 03:38:01'),
(518,16,183,'I have to do the vacuuming',1,NULL,NULL,'2026-02-11 03:38:01'),
(519,16,184,'I\'ve done yoga before',1,NULL,NULL,'2026-02-11 03:38:01'),
(520,16,185,'I have to get a job',1,NULL,NULL,'2026-02-11 03:38:01'),
(521,16,186,'I\'ve made a vow before',1,NULL,NULL,'2026-02-11 03:38:01'),
(522,16,187,'I made a promise yesterday',1,NULL,NULL,'2026-02-11 03:38:01'),
(523,16,188,'get around',1,NULL,NULL,'2026-02-11 03:38:01'),
(524,16,189,'order',1,NULL,NULL,'2026-02-11 03:38:01'),
(525,16,190,'feel like',1,NULL,NULL,'2026-02-11 03:38:01'),
(526,16,191,'get my hair colored',1,NULL,NULL,'2026-02-11 03:38:01'),
(527,16,192,'I\'ve just taken my medicine',1,NULL,NULL,'2026-02-11 03:38:01'),
(528,16,193,'I have to go to the grosory store',0,NULL,NULL,'2026-02-11 03:38:01'),
(529,16,194,'on weekends',1,NULL,NULL,'2026-02-11 03:38:01'),
(530,16,195,'without my car',1,NULL,NULL,'2026-02-11 03:38:01'),
(531,16,196,'I am doing pilates',1,NULL,NULL,'2026-02-11 03:38:01'),
(532,16,197,'I do yoga everyday',1,NULL,NULL,'2026-02-11 03:38:01'),
(533,16,198,'take a call',1,NULL,NULL,'2026-02-11 03:38:01'),
(534,16,199,'an opposite person',0,NULL,NULL,'2026-02-11 03:38:01'),
(535,16,200,'find',0,NULL,NULL,'2026-02-11 03:38:01'),
(536,17,166,'drive',1,NULL,NULL,'2026-02-11 03:38:12'),
(537,17,167,'I\'ve gotten Lasik surgery.',1,NULL,NULL,'2026-02-11 03:38:12'),
(538,17,168,'often more',0,NULL,NULL,'2026-02-11 03:38:12'),
(539,17,169,'drive a supercar',1,NULL,NULL,'2026-02-11 03:38:12'),
(540,17,170,'department store',1,NULL,NULL,'2026-02-11 03:38:12'),
(541,17,171,'I\'ve been taking my medicine.',1,NULL,NULL,'2026-02-11 03:38:12'),
(542,17,172,'I got a vow yesterday.',0,NULL,NULL,'2026-02-11 03:38:12'),
(543,17,173,'I have to get a flu shot.',1,NULL,NULL,'2026-02-11 03:38:12'),
(544,17,174,'I have to take a passport photo.',1,NULL,NULL,'2026-02-11 03:38:12'),
(545,17,175,'on the weekend',1,NULL,NULL,'2026-02-11 03:38:12'),
(546,17,176,'I\'ve been doing yoga for two hours.',1,NULL,NULL,'2026-02-11 03:38:12'),
(547,17,177,'I\'ve just gotten an e-mail.',1,NULL,NULL,'2026-02-11 03:38:12'),
(548,17,178,'I did yoga yesterday.',1,NULL,NULL,'2026-02-11 03:38:12'),
(549,17,179,'I did yoga yesterday.',1,NULL,NULL,'2026-02-11 03:38:12'),
(550,17,180,'weekend',1,NULL,NULL,'2026-02-11 03:38:12'),
(551,17,181,'outfit',1,NULL,NULL,'2026-02-11 03:38:12'),
(552,17,182,'I have to do yoga.',1,NULL,NULL,'2026-02-11 03:38:12'),
(553,17,183,'I have to do the vacuuming.',1,NULL,NULL,'2026-02-11 03:38:12'),
(554,17,184,'I\'ve just done yoga before.',0,NULL,NULL,'2026-02-11 03:38:12'),
(555,17,185,'I have to get a job.',1,NULL,NULL,'2026-02-11 03:38:12'),
(556,17,186,'I\'ve just gotten a vow before.',0,NULL,NULL,'2026-02-11 03:38:12'),
(557,17,187,'I made a promise yesterday.',1,NULL,NULL,'2026-02-11 03:38:12'),
(558,17,188,'get around',1,NULL,NULL,'2026-02-11 03:38:12'),
(559,17,189,'order',1,NULL,NULL,'2026-02-11 03:38:12'),
(560,17,190,'feel like',1,NULL,NULL,'2026-02-11 03:38:12'),
(561,17,191,'get my hair colored',1,NULL,NULL,'2026-02-11 03:38:12'),
(562,17,192,'I\'ve just taken my medicine.',1,NULL,NULL,'2026-02-11 03:38:12'),
(563,17,193,'I have to go to the grocery store',0,NULL,NULL,'2026-02-11 03:38:12'),
(564,17,194,'on weekends',1,NULL,NULL,'2026-02-11 03:38:12'),
(565,17,195,'without car',0,NULL,NULL,'2026-02-11 03:38:12'),
(566,17,196,'I\'m doing Pilates.',1,NULL,NULL,'2026-02-11 03:38:12'),
(567,17,197,'I do yoga everyday.',1,NULL,NULL,'2026-02-11 03:38:12'),
(568,17,198,'take a call',1,NULL,NULL,'2026-02-11 03:38:12'),
(569,17,199,'opposite',0,NULL,NULL,'2026-02-11 03:38:12'),
(570,17,200,'take a research',0,NULL,NULL,'2026-02-11 03:38:12'),
(571,18,166,'drive.',1,NULL,NULL,'2026-02-11 03:38:33'),
(572,18,167,'I have gotten Lasik surgery.',1,NULL,NULL,'2026-02-11 03:38:33'),
(573,18,168,'more often.',1,NULL,NULL,'2026-02-11 03:38:33'),
(574,18,169,'drive a supercar.',1,NULL,NULL,'2026-02-11 03:38:33'),
(575,18,170,'department store.',1,NULL,NULL,'2026-02-11 03:38:33'),
(576,18,171,'I have been taking my medicine.',1,NULL,NULL,'2026-02-11 03:38:33'),
(577,18,172,'I made a vow yesterday.',1,NULL,NULL,'2026-02-11 03:38:33'),
(578,18,173,'I have to get a flu shot.',1,NULL,NULL,'2026-02-11 03:38:33'),
(579,18,174,'I have to take a passport photo.',1,NULL,NULL,'2026-02-11 03:38:33'),
(580,18,175,'on weekend.',0,NULL,NULL,'2026-02-11 03:38:33'),
(581,18,176,'I have been doing yoga for two hours.',1,NULL,NULL,'2026-02-11 03:38:33'),
(582,18,177,'I have just gotten an email.',1,NULL,NULL,'2026-02-11 03:38:33'),
(583,18,178,'I did yoga yesterday.',1,NULL,NULL,'2026-02-11 03:38:33'),
(584,18,179,'I did yoga yesterday.',1,NULL,NULL,'2026-02-11 03:38:33'),
(585,18,180,'weekend',1,NULL,NULL,'2026-02-11 03:38:33'),
(586,18,181,'outfits.',0,NULL,NULL,'2026-02-11 03:38:33'),
(587,18,182,'I have to do yoga.',1,NULL,NULL,'2026-02-11 03:38:33'),
(588,18,183,'I have to do vacuuming.',0,NULL,NULL,'2026-02-11 03:38:33'),
(589,18,184,'I have done yoga before.',1,NULL,NULL,'2026-02-11 03:38:33'),
(590,18,185,'I have to get a job.',1,NULL,NULL,'2026-02-11 03:38:33'),
(591,18,186,'I have made a vow before.',1,NULL,NULL,'2026-02-11 03:38:33'),
(592,18,187,'I made a promise yesterday.',1,NULL,NULL,'2026-02-11 03:38:33'),
(593,18,188,'get around.',1,NULL,NULL,'2026-02-11 03:38:33'),
(594,18,189,'order.',1,NULL,NULL,'2026-02-11 03:38:33'),
(595,18,190,'feel like.',1,NULL,NULL,'2026-02-11 03:38:33'),
(596,18,191,'get the hair permed.',0,NULL,NULL,'2026-02-11 03:38:33'),
(597,18,192,'get the hair colored.',0,NULL,NULL,'2026-02-11 03:38:33'),
(598,18,193,'I have just taken my medicine.',0,NULL,NULL,'2026-02-11 03:38:33'),
(599,18,194,'on weekends.',1,NULL,NULL,'2026-02-11 03:38:33'),
(600,18,195,'Without my car.',1,NULL,NULL,'2026-02-11 03:38:33'),
(601,18,196,'I\'m doing pilates.',1,NULL,NULL,'2026-02-11 03:38:33'),
(602,18,197,'Im doing yoga everyday.',0,NULL,NULL,'2026-02-11 03:38:33'),
(603,18,198,'take a call',1,NULL,NULL,'2026-02-11 03:38:33'),
(604,18,199,'an opposite personality',0,NULL,NULL,'2026-02-11 03:38:33'),
(605,18,200,'research',0,NULL,NULL,'2026-02-11 03:38:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES
(2,1,1,'OFFLINE',30,27,27.00,1,'COMPLETED','2026-01-21 03:02:17','2026-01-21 03:20:45'),
(3,3,1,'OFFLINE',30,27,27.00,1,'COMPLETED','2026-01-21 03:10:07','2026-01-21 03:19:44'),
(4,2,1,'OFFLINE',30,26,26.00,1,'COMPLETED','2026-01-21 03:10:09','2026-01-21 03:17:58'),
(5,4,1,'OFFLINE',30,29,29.00,1,'COMPLETED','2026-01-21 03:19:23','2026-01-21 03:21:51'),
(7,1,2,'OFFLINE',35,29,30.00,1,'COMPLETED','2026-01-28 01:59:41','2026-01-28 03:48:52'),
(8,4,2,'OFFLINE',35,33,33.00,1,'COMPLETED','2026-01-28 03:34:44','2026-01-28 03:45:44'),
(9,3,2,'OFFLINE',35,30,30.00,1,'COMPLETED','2026-01-28 03:34:47','2026-01-28 03:46:40'),
(10,2,2,'OFFLINE',35,25,25.00,1,'COMPLETED','2026-01-28 03:34:56','2026-01-28 03:45:16'),
(11,1,3,'OFFLINE',35,32,32.00,1,'COMPLETED','2026-02-04 03:45:44','2026-02-04 04:08:47'),
(12,4,3,'OFFLINE',35,33,33.00,1,'COMPLETED','2026-02-04 03:55:05','2026-02-04 04:10:10'),
(13,3,3,'OFFLINE',35,32,32.00,1,'COMPLETED','2026-02-04 03:55:09','2026-02-04 04:05:29'),
(14,2,3,'OFFLINE',35,31,31.00,1,'COMPLETED','2026-02-04 03:55:21','2026-02-04 04:07:08'),
(15,4,4,'OFFLINE',35,34,34.00,1,'COMPLETED','2026-02-11 03:37:55','2026-02-11 03:49:28'),
(16,1,4,'OFFLINE',35,30,30.00,1,'COMPLETED','2026-02-11 03:38:01','2026-02-11 03:54:00'),
(17,3,4,'OFFLINE',35,28,28.00,1,'COMPLETED','2026-02-11 03:38:12','2026-02-11 03:52:37'),
(18,2,4,'OFFLINE',35,26,26.00,1,'COMPLETED','2026-02-11 03:38:33','2026-02-11 03:50:30');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_settings`
--

DROP TABLE IF EXISTS `log_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_settings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(200) NOT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_settings`
--

LOCK TABLES `log_settings` WRITE;
/*!40000 ALTER TABLE `log_settings` DISABLE KEYS */;
INSERT INTO `log_settings` VALUES
(1,'retention_days','90','2026-02-11 07:45:04'),
(2,'auto_delete_enabled','true','2026-02-11 07:45:04'),
(3,'log_login','true','2026-02-11 07:45:04'),
(4,'log_exam','true','2026-02-11 07:45:04'),
(5,'log_file','true','2026-02-11 07:45:04'),
(6,'log_admin','true','2026-02-11 07:45:04'),
(7,'log_error','true','2026-02-11 07:45:04');
/*!40000 ALTER TABLE `log_settings` ENABLE KEYS */;
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
  `is_review` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_questions_round_id` (`round_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES
(31,1,'MEDIUM','TEXT','일반 직장','a 9-to-5 job',NULL,NULL,NULL,NULL,NULL,1,'2026-01-21 03:01:38',0),
(32,1,'MEDIUM','TEXT','위험을 감수하다','take a risk',NULL,NULL,NULL,NULL,NULL,2,'2026-01-21 03:01:38',0),
(33,1,'MEDIUM','TEXT','머리를 묶다','do a ponytail',NULL,NULL,NULL,NULL,NULL,3,'2026-01-21 03:01:38',0),
(34,1,'MEDIUM','TEXT','여권 사진을 찍다','take a passport photo',NULL,NULL,NULL,NULL,NULL,4,'2026-01-21 03:01:38',0),
(35,1,'MEDIUM','TEXT','사진을 찍다','take a picture',NULL,NULL,NULL,NULL,NULL,5,'2026-01-21 03:01:38',0),
(36,1,'MEDIUM','TEXT','청소기를 돌리다','do the vacuuming',NULL,NULL,NULL,NULL,NULL,6,'2026-01-21 03:01:38',0),
(37,1,'MEDIUM','TEXT','내 손톱을 손질하다','do my nails',NULL,NULL,NULL,NULL,NULL,7,'2026-01-21 03:01:38',0),
(38,1,'MEDIUM','TEXT','강좌를 수강하다','take a course',NULL,NULL,NULL,NULL,NULL,8,'2026-01-21 03:01:38',0),
(39,1,'MEDIUM','TEXT','화장을 하다','do my makeup',NULL,NULL,NULL,NULL,NULL,9,'2026-01-21 03:01:38',0),
(40,1,'MEDIUM','TEXT','함께 어울려 시간을 보내다','hang out',NULL,NULL,NULL,NULL,NULL,10,'2026-01-21 03:01:38',0),
(41,1,'MEDIUM','TEXT','만능 살림꾼','all-rounder at home',NULL,NULL,NULL,NULL,NULL,11,'2026-01-21 03:01:38',0),
(42,1,'MEDIUM','TEXT','숙제를 하다','do my homework',NULL,NULL,NULL,NULL,NULL,12,'2026-01-21 03:01:38',0),
(43,1,'MEDIUM','TEXT','내 할 일을 하다','do my stuff',NULL,NULL,NULL,NULL,NULL,13,'2026-01-21 03:01:38',0),
(44,1,'MEDIUM','TEXT','샤워를 하다','take a shower.',NULL,NULL,NULL,NULL,NULL,14,'2026-01-21 03:01:38',0),
(45,1,'MEDIUM','TEXT','보충제를 섭취하다','take supplements',NULL,NULL,NULL,NULL,NULL,15,'2026-01-21 03:01:38',0),
(46,1,'MEDIUM','TEXT','나에게 호의를 베풀다','do me a favor',NULL,NULL,NULL,NULL,NULL,16,'2026-01-21 03:01:38',0),
(47,1,'MEDIUM','TEXT','잘 지내다','get along',NULL,NULL,NULL,NULL,NULL,17,'2026-01-21 03:01:38',0),
(48,1,'MEDIUM','TEXT','내 가방을 가져가다','take my bag',NULL,NULL,NULL,NULL,NULL,18,'2026-01-21 03:01:38',0),
(49,1,'MEDIUM','TEXT','회사원','office worker',NULL,NULL,NULL,NULL,NULL,19,'2026-01-21 03:01:38',0),
(50,1,'MEDIUM','TEXT','휴식을 취하다','take a break',NULL,NULL,NULL,NULL,NULL,20,'2026-01-21 03:01:38',0),
(51,1,'MEDIUM','TEXT','조치를 취하다','take action',NULL,NULL,NULL,NULL,NULL,21,'2026-01-21 03:01:38',0),
(52,1,'MEDIUM','TEXT','맞벌이 부부','a working couple',NULL,NULL,NULL,NULL,NULL,22,'2026-01-21 03:01:38',0),
(53,1,'MEDIUM','TEXT','성격','personality',NULL,NULL,NULL,NULL,NULL,23,'2026-01-21 03:01:38',0),
(54,1,'MEDIUM','TEXT','그만두다','quit',NULL,NULL,NULL,NULL,NULL,24,'2026-01-21 03:01:38',0),
(55,1,'MEDIUM','TEXT','수업을 듣다','take a class',NULL,NULL,NULL,NULL,NULL,25,'2026-01-21 03:01:38',0),
(56,1,'MEDIUM','TEXT','집안일/허드렛일을 하다','do the chores',NULL,NULL,NULL,NULL,NULL,26,'2026-01-21 03:01:38',0),
(57,1,'MEDIUM','TEXT','내가 하는 일에서','at work',NULL,NULL,NULL,NULL,NULL,27,'2026-01-21 03:01:38',0),
(58,1,'MEDIUM','TEXT','성격이 정반대인 사람','an opposite in personality',NULL,NULL,NULL,NULL,NULL,28,'2026-01-21 03:01:38',0),
(59,1,'MEDIUM','TEXT','내 손을 잡다','take my hand',NULL,NULL,NULL,NULL,NULL,29,'2026-01-21 03:01:38',0),
(60,1,'MEDIUM','TEXT','죽이 잘 맞다','get along great',NULL,NULL,NULL,NULL,NULL,30,'2026-01-21 03:01:38',0),
(96,2,'WORD','TEXT','시간을 내다','make time',NULL,NULL,NULL,NULL,NULL,1,'2026-01-28 01:59:31',NULL),
(97,2,'WORD','TEXT','쇼핑하러 가다','go shopping',NULL,NULL,NULL,NULL,NULL,2,'2026-01-28 01:59:31',NULL),
(98,2,'WORD','TEXT','말썽을 피우다','make trouble',NULL,NULL,NULL,NULL,NULL,3,'2026-01-28 01:59:31',NULL),
(99,2,'WORD','TEXT','힘든 시간들','tough times',NULL,NULL,NULL,NULL,NULL,4,'2026-01-28 01:59:31',NULL),
(100,2,'WORD','TEXT','관광하러 가다','go on a tour',NULL,NULL,NULL,NULL,NULL,5,'2026-01-28 01:59:31',NULL),
(101,2,'WORD','TEXT','제안을 하다','make a suggestion',NULL,NULL,NULL,NULL,NULL,6,'2026-01-28 01:59:31',NULL),
(102,2,'WORD','TEXT','소풍 가다','go on a picnic',NULL,NULL,NULL,NULL,NULL,7,'2026-01-28 01:59:31',NULL),
(103,2,'WORD','TEXT','저녁 먹으러 가다','go for dinner',NULL,NULL,NULL,NULL,NULL,8,'2026-01-28 01:59:31',NULL),
(104,2,'WORD','TEXT','좋은 인상을 심다','make a good impression',NULL,NULL,NULL,NULL,NULL,9,'2026-01-28 01:59:31',NULL),
(105,2,'WORD','TEXT','맛집 찾기','finding nice restaurants',NULL,NULL,NULL,NULL,NULL,10,'2026-01-28 01:59:31',NULL),
(106,2,'WORD','TEXT','맛집','nice restaurant',NULL,NULL,NULL,NULL,NULL,11,'2026-01-28 01:59:31',NULL),
(107,2,'WORD','TEXT','~을 담당하다','be in charge of',NULL,NULL,NULL,NULL,NULL,12,'2026-01-28 01:59:31',NULL),
(108,2,'WORD','TEXT','점심 먹으러 가다','go for lunch',NULL,NULL,NULL,NULL,NULL,13,'2026-01-28 01:59:31',NULL),
(109,2,'WORD','TEXT','변화를 만들다','make a difference',NULL,NULL,NULL,NULL,NULL,14,'2026-01-28 01:59:31',NULL),
(110,2,'WORD','TEXT','더 이상','anymore',NULL,NULL,NULL,NULL,NULL,15,'2026-01-28 01:59:31',NULL),
(111,2,'WORD','TEXT','힘든','tough',NULL,NULL,NULL,NULL,NULL,16,'2026-01-28 01:59:31',NULL),
(112,2,'WORD','TEXT','산책하러 가다','go for a walk',NULL,NULL,NULL,NULL,NULL,17,'2026-01-28 01:59:31',NULL),
(113,2,'WORD','TEXT','회사에 가다','go to work',NULL,NULL,NULL,NULL,NULL,18,'2026-01-28 01:59:31',NULL),
(114,2,'WORD','TEXT','만나기','meeting up',NULL,NULL,NULL,NULL,NULL,19,'2026-01-28 01:59:31',NULL),
(115,2,'WORD','TEXT','식료품점에 가다','go to the grocery store',NULL,NULL,NULL,NULL,NULL,20,'2026-01-28 01:59:31',NULL),
(116,2,'WORD','TEXT','소원을 빌다','make a wish',NULL,NULL,NULL,NULL,NULL,21,'2026-01-28 01:59:31',NULL),
(117,2,'WORD','TEXT','유대감, 관계','bond',NULL,NULL,NULL,NULL,NULL,22,'2026-01-28 01:59:31',NULL),
(118,2,'WORD','TEXT','실수를 하다','make a mistake',NULL,NULL,NULL,NULL,NULL,23,'2026-01-28 01:59:31',NULL),
(119,2,'WORD','TEXT','서로 돕다','help each other',NULL,NULL,NULL,NULL,NULL,24,'2026-01-28 01:59:31',NULL),
(120,2,'WORD','TEXT','시끄럽게 하다','make noise',NULL,NULL,NULL,NULL,NULL,25,'2026-01-28 01:59:31',NULL),
(121,2,'WORD','TEXT','~에 관해서라면','when it comes to',NULL,NULL,NULL,NULL,NULL,26,'2026-01-28 01:59:31',NULL),
(122,2,'WORD','TEXT','약국에 가다','go to the drugstore',NULL,NULL,NULL,NULL,NULL,27,'2026-01-28 01:59:31',NULL),
(123,2,'WORD','TEXT','지속되다','last',NULL,NULL,NULL,NULL,NULL,28,'2026-01-28 01:59:31',NULL),
(124,2,'WORD','TEXT','팔다','sell',NULL,NULL,NULL,NULL,NULL,29,'2026-01-28 01:59:31',NULL),
(125,2,'WORD','TEXT','빨래','doing the laundry',NULL,NULL,NULL,NULL,NULL,30,'2026-01-28 01:59:31',NULL),
(126,2,'WORD','TEXT','화장을 하다','do my makeup',NULL,NULL,NULL,NULL,NULL,1,'2026-01-28 01:59:36',1),
(127,2,'WORD','TEXT','전화를 받다','take a call',NULL,NULL,NULL,NULL,NULL,2,'2026-01-28 01:59:36',1),
(128,2,'WORD','TEXT','정반대인 사람','opposite',NULL,NULL,NULL,NULL,NULL,3,'2026-01-28 01:59:36',1),
(129,2,'WORD','TEXT','집안일/허드렛일을 하다','do the chores',NULL,NULL,NULL,NULL,NULL,4,'2026-01-28 01:59:36',1),
(130,2,'WORD','TEXT','전형적인 한국 가족','typical Korean family',NULL,NULL,NULL,NULL,NULL,5,'2026-01-28 01:59:36',1),
(131,3,'WORD','TEXT','마무리하다','wrap up',NULL,NULL,NULL,NULL,NULL,1,'2026-02-04 03:45:21',NULL),
(132,3,'WORD','TEXT','바쁘다','be busy',NULL,NULL,NULL,NULL,NULL,2,'2026-02-04 03:45:21',NULL),
(133,3,'WORD','TEXT','집에 있다','be at home',NULL,NULL,NULL,NULL,NULL,3,'2026-02-04 03:45:21',NULL),
(134,3,'WORD','TEXT','시간을 잘 지키다','be on time',NULL,NULL,NULL,NULL,NULL,4,'2026-02-04 03:45:21',NULL),
(135,3,'WORD','TEXT','좋아하다','enjoy',NULL,NULL,NULL,NULL,NULL,5,'2026-02-04 03:45:21',NULL),
(136,3,'WORD','TEXT','비 오는 날','rainy days',NULL,NULL,NULL,NULL,NULL,6,'2026-02-04 03:45:21',NULL),
(137,3,'WORD','TEXT','일기예보를 확인하다','check the weather forecast',NULL,NULL,NULL,NULL,NULL,7,'2026-02-04 03:45:21',NULL),
(138,3,'WORD','TEXT','평화로운','peaceful',NULL,NULL,NULL,NULL,NULL,8,'2026-02-04 03:45:21',NULL),
(139,3,'WORD','TEXT','미루다','put off',NULL,NULL,NULL,NULL,NULL,9,'2026-02-04 03:45:21',NULL),
(140,3,'WORD','TEXT','나 아침 먹으려고 해','I\'m going to have breakfast',NULL,NULL,NULL,NULL,NULL,10,'2026-02-04 03:45:21',NULL),
(141,3,'WORD','TEXT','나는 지금 요가하는 중이야','I am doing yoga now',NULL,NULL,NULL,NULL,NULL,11,'2026-02-04 03:45:21',NULL),
(142,3,'WORD','TEXT','모든 것을 끝내다','finish everything',NULL,NULL,NULL,NULL,NULL,12,'2026-02-04 03:45:21',NULL),
(143,3,'WORD','TEXT','정리하다, 청소하다','clean',NULL,NULL,NULL,NULL,NULL,13,'2026-02-04 03:45:21',NULL),
(144,3,'WORD','TEXT','처음으로 해보다, 시도하다','try',NULL,NULL,NULL,NULL,NULL,14,'2026-02-04 03:45:21',NULL),
(145,3,'WORD','TEXT','끝내다','finish',NULL,NULL,NULL,NULL,NULL,15,'2026-02-04 03:45:21',NULL),
(146,3,'WORD','TEXT','나 매일 머리를 손질해','I do my hair every day',NULL,NULL,NULL,NULL,NULL,16,'2026-02-04 03:45:21',NULL),
(147,3,'WORD','TEXT','책을 다 읽다','finish reading the book',NULL,NULL,NULL,NULL,NULL,17,'2026-02-04 03:45:21',NULL),
(148,3,'WORD','TEXT','걔네 산책하러 가는 중이야','They are going for a walk',NULL,NULL,NULL,NULL,NULL,18,'2026-02-04 03:45:21',NULL),
(149,3,'WORD','TEXT','나 머리를 손질하는 중이야','I\'m doing my hair',NULL,NULL,NULL,NULL,NULL,19,'2026-02-04 03:45:21',NULL),
(150,3,'WORD','TEXT','에너지가 넘치다','feel energized',NULL,NULL,NULL,NULL,NULL,20,'2026-02-04 03:45:21',NULL),
(151,3,'WORD','TEXT','일 등을 하다','be in first place',NULL,NULL,NULL,NULL,NULL,21,'2026-02-04 03:45:21',NULL),
(152,3,'WORD','TEXT','매일 아침','every morning',NULL,NULL,NULL,NULL,NULL,22,'2026-02-04 03:45:21',NULL),
(153,3,'WORD','TEXT','막, 방금','just',NULL,NULL,NULL,NULL,NULL,23,'2026-02-04 03:45:21',NULL),
(154,3,'WORD','TEXT','나름대로','in their own way',NULL,NULL,NULL,NULL,NULL,24,'2026-02-04 03:45:21',NULL),
(155,3,'WORD','TEXT','단골이다','be a regular customer',NULL,NULL,NULL,NULL,NULL,25,'2026-02-04 03:45:21',NULL),
(156,3,'WORD','TEXT','부유하다','be rich',NULL,NULL,NULL,NULL,NULL,26,'2026-02-04 03:45:21',NULL),
(157,3,'WORD','TEXT','회사에 있다','be at work',NULL,NULL,NULL,NULL,NULL,27,'2026-02-04 03:45:21',NULL),
(158,3,'WORD','TEXT','가장 좋아하는','favorite',NULL,NULL,NULL,NULL,NULL,28,'2026-02-04 03:45:21',NULL),
(159,3,'WORD','TEXT','뜨겁다','be hot',NULL,NULL,NULL,NULL,NULL,29,'2026-02-04 03:45:21',NULL),
(160,3,'WORD','TEXT','화창한','sunny',NULL,NULL,NULL,NULL,NULL,30,'2026-02-04 03:45:21',NULL),
(161,3,'WORD','TEXT','소풍 가다','go on a picnic',NULL,NULL,NULL,NULL,NULL,1,'2026-02-04 03:45:26',1),
(162,3,'WORD','TEXT','맛집 찾기','finding nice restaurants',NULL,NULL,NULL,NULL,NULL,2,'2026-02-04 03:45:26',1),
(163,3,'WORD','TEXT','더 이상','anymore',NULL,NULL,NULL,NULL,NULL,3,'2026-02-04 03:45:26',1),
(164,3,'WORD','TEXT','관광하러 가다','go on a tour',NULL,NULL,NULL,NULL,NULL,4,'2026-02-04 03:45:26',1),
(165,3,'MEDIUM','TEXT','잘 지내다','get along',NULL,NULL,NULL,NULL,NULL,5,'2026-02-04 03:45:26',1),
(166,4,'WORD','TEXT','운전하다','drive',NULL,NULL,NULL,NULL,NULL,1,'2026-02-11 03:37:36',NULL),
(167,4,'WORD','TEXT','나 라식 수술을 받은 적이 있어','I have gotten Lasik surgery',NULL,NULL,NULL,NULL,NULL,2,'2026-02-11 03:37:36',NULL),
(168,4,'WORD','TEXT','더 자주','more often',NULL,NULL,NULL,NULL,NULL,3,'2026-02-11 03:37:36',NULL),
(169,4,'WORD','TEXT','슈퍼카를 몰다','drive a supercar',NULL,NULL,NULL,NULL,NULL,4,'2026-02-11 03:37:36',NULL),
(170,4,'WORD','TEXT','백화점','department store',NULL,NULL,NULL,NULL,NULL,5,'2026-02-11 03:37:36',NULL),
(171,4,'WORD','TEXT','나는 약을 복용해 오는 중이야','I have been taking my medicine',NULL,NULL,NULL,NULL,NULL,6,'2026-02-11 03:37:36',NULL),
(172,4,'WORD','TEXT','나 어제 맹세를 했어','I made a vow yesterday',NULL,NULL,NULL,NULL,NULL,7,'2026-02-11 03:37:36',NULL),
(173,4,'WORD','TEXT','나는 독감 주사를 맞아야 해','I have to get a flu shot',NULL,NULL,NULL,NULL,NULL,8,'2026-02-11 03:37:36',NULL),
(174,4,'WORD','TEXT','나는 여권 사진을 찍어야 해','I have to take a passport photo',NULL,NULL,NULL,NULL,NULL,9,'2026-02-11 03:37:36',NULL),
(175,4,'WORD','TEXT','주말에','on the weekend',NULL,NULL,NULL,NULL,NULL,10,'2026-02-11 03:37:36',NULL),
(176,4,'WORD','TEXT','나 두 시간 동안 요가를 하고 있어','I have been doing yoga for two hours',NULL,NULL,NULL,NULL,NULL,11,'2026-02-11 03:37:36',NULL),
(177,4,'WORD','TEXT','나 막 메일 하나를 받았어','I\'ve just gotten an e-mail',NULL,NULL,NULL,NULL,NULL,12,'2026-02-11 03:37:36',NULL),
(178,4,'WORD','TEXT','나 어제 요가를 했어','I did yoga yesterday',NULL,NULL,NULL,NULL,NULL,13,'2026-02-11 03:37:36',NULL),
(179,4,'WORD','TEXT','나 어제 요가를 했어','I did yoga yesterday',NULL,NULL,NULL,NULL,NULL,14,'2026-02-11 03:37:36',NULL),
(180,4,'WORD','TEXT','주말','weekend',NULL,NULL,NULL,NULL,NULL,15,'2026-02-11 03:37:36',NULL),
(181,4,'WORD','TEXT','외출복','outfit',NULL,NULL,NULL,NULL,NULL,16,'2026-02-11 03:37:36',NULL),
(182,4,'WORD','TEXT','나 요가를 해야 해','I have to do yoga',NULL,NULL,NULL,NULL,NULL,17,'2026-02-11 03:37:36',NULL),
(183,4,'WORD','TEXT','나는 청소기를 돌려야 해','I have to do the vacuuming',NULL,NULL,NULL,NULL,NULL,18,'2026-02-11 03:37:36',NULL),
(184,4,'WORD','TEXT','나 전에 요가를 해 본 적이 있어','I\'ve done yoga before',NULL,NULL,NULL,NULL,NULL,19,'2026-02-11 03:37:36',NULL),
(185,4,'WORD','TEXT','나는 취직을 해야 해','I have to get a job',NULL,NULL,NULL,NULL,NULL,20,'2026-02-11 03:37:36',NULL),
(186,4,'WORD','TEXT','나 전에 맹세를 한 적이 있어','I\'ve made a vow before',NULL,NULL,NULL,NULL,NULL,21,'2026-02-11 03:37:36',NULL),
(187,4,'WORD','TEXT','나 어제 약속을 하나 했어','I made a promise yesterday',NULL,NULL,NULL,NULL,NULL,22,'2026-02-11 03:37:36',NULL),
(188,4,'WORD','TEXT','돌아다니다','get around',NULL,NULL,NULL,NULL,NULL,23,'2026-02-11 03:37:36',NULL),
(189,4,'WORD','TEXT','주문하다','order',NULL,NULL,NULL,NULL,NULL,24,'2026-02-11 03:37:36',NULL),
(190,4,'WORD','TEXT','기분이 들다','feel like',NULL,NULL,NULL,NULL,NULL,25,'2026-02-11 03:37:36',NULL),
(191,4,'WORD','TEXT','염색을 하다','get my hair colored',NULL,NULL,NULL,NULL,NULL,26,'2026-02-11 03:37:36',NULL),
(192,4,'WORD','TEXT','나 막 내 약을 복용했어','I\'ve just taken my medicine',NULL,NULL,NULL,NULL,NULL,27,'2026-02-11 03:37:36',NULL),
(193,4,'WORD','TEXT','나는 장을 보러 가야 해','I have to go to the grocery store',NULL,NULL,NULL,NULL,NULL,28,'2026-02-11 03:37:36',NULL),
(194,4,'WORD','TEXT','주말마다','on weekends',NULL,NULL,NULL,NULL,NULL,29,'2026-02-11 03:37:36',NULL),
(195,4,'WORD','TEXT','차 없이','without my car',NULL,NULL,NULL,NULL,NULL,30,'2026-02-11 03:37:36',NULL),
(196,4,'WORD','TEXT','나 필라테스를 하는 중이야','I\'m doing Pilates',NULL,NULL,NULL,NULL,NULL,1,'2026-02-11 03:37:44',1),
(197,4,'WORD','TEXT','난 매일 요가해','I do yoga every day',NULL,NULL,NULL,NULL,NULL,2,'2026-02-11 03:37:44',1),
(198,4,'WORD','TEXT','전화를 받다','take a call',NULL,NULL,NULL,NULL,NULL,3,'2026-02-11 03:37:44',1),
(199,4,'WORD','TEXT','성격이 정반대인 사람','an opposite in personality',NULL,NULL,NULL,NULL,NULL,4,'2026-02-11 03:37:44',1),
(200,4,'WORD','TEXT','조사를 하다','do some research',NULL,NULL,NULL,NULL,NULL,5,'2026-02-11 03:37:44',1);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `round_chapters`
--

DROP TABLE IF EXISTS `round_chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `round_chapters` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `round_id` bigint(20) NOT NULL,
  `chapter_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_round_chapter` (`round_id`,`chapter_id`),
  KEY `idx_round_chapters_round` (`round_id`),
  KEY `idx_round_chapters_chapter` (`chapter_id`),
  CONSTRAINT `round_chapters_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `round_chapters_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `book_chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `round_chapters`
--

LOCK TABLES `round_chapters` WRITE;
/*!40000 ALTER TABLE `round_chapters` DISABLE KEYS */;
/*!40000 ALTER TABLE `round_chapters` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `round_materials`
--

LOCK TABLES `round_materials` WRITE;
/*!40000 ALTER TABLE `round_materials` DISABLE KEYS */;
INSERT INTO `round_materials` VALUES
(1,2,'YOUTUBE','YouTube Video','https://youtu.be/tn38fmhoxa0?si=aFIiKQjsGhqz-Kwf',NULL,1,'2026-01-26 01:22:47'),
(2,2,'YOUTUBE','YouTube Video','https://youtu.be/ER06dU_enUk?si=N_4tRqD0NaLeQQ2e',NULL,2,'2026-01-26 01:22:59'),
(3,2,'PPT','Make_Not_Build.pdf','/uploads/materials/823f55f5-676b-4978-94f4-52b6f5bc2bdc.pdf','Make_Not_Build.pdf',3,'2026-01-26 01:25:47'),
(4,2,'PPT','The_GO_Verb_Map.pdf','/uploads/materials/43420bd9-3529-4bae-bd85-2bfe0608927d.pdf','The_GO_Verb_Map.pdf',4,'2026-01-26 01:25:54'),
(5,3,'YOUTUBE','YouTube Video','https://youtu.be/61IOm4Xs-DU?si=VF40_vN3Q0XNfxIi',NULL,1,'2026-01-28 05:10:51'),
(6,3,'YOUTUBE','YouTube Video','https://youtu.be/WTd6B_1ogko?si=zSgDY0Abp8qKe_g2',NULL,2,'2026-01-28 05:11:00'),
(7,3,'PPT','unit7_Be.pdf','/uploads/materials/3fe187db-c64b-42a3-bb66-2dbbdc50d1c6.pdf','unit7_Be.pdf',3,'2026-01-28 05:21:15'),
(8,3,'PPT','unit8_현재시재.pdf','/uploads/materials/95954f4c-831e-44c9-8137-740ca09a2cb2.pdf','unit8_현재시재.pdf',4,'2026-01-28 05:21:20'),
(9,4,'YOUTUBE','YouTube Video','https://youtu.be/8LfO5Yi2WeI?si=2JNamDinfbuA-L1n',NULL,1,'2026-02-04 05:15:11'),
(10,4,'YOUTUBE','YouTube Video','https://youtu.be/DzRXi2IYZt0?si=8wYY9vOWb-CQuYBZ',NULL,2,'2026-02-04 05:15:27'),
(11,4,'PPT','unit9_have p.p_2.pdf','/uploads/materials/0a2c2231-6a0d-4548-9d13-d596fdbc484b.pdf','unit9_have p.p_2.pdf',3,'2026-02-04 05:15:38'),
(12,4,'PPT','unit10_have been ing.pdf','/uploads/materials/83319ad9-1ecf-4204-aecc-116f0ef78c30.pdf','unit10_have been ing.pdf',4,'2026-02-04 05:15:43'),
(13,4,'PPT','day9 day10.pdf','/uploads/materials/44963129-85a9-4f10-8267-027cc436130b.pdf','day9 day10.pdf',5,'2026-02-04 05:15:48');
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
) ENGINE=InnoDB AUTO_INCREMENT=272 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `round_vocabulary`
--

LOCK TABLES `round_vocabulary` WRITE;
/*!40000 ALTER TABLE `round_vocabulary` DISABLE KEYS */;
INSERT INTO `round_vocabulary` VALUES
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
(42,1,'do my stuff','내 할 일을 하다','',42,'2026-01-21 02:44:55'),
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
(71,1,'get along','잘 지내다','/ɡet əˈlɔːŋ/',71,'2026-01-21 02:44:55'),
(72,2,'cleaning','청소','/ˈkliːnɪŋ/',1,'2026-01-26 01:22:14'),
(73,2,'cooking','요리','/ˈkʊkɪŋ/',2,'2026-01-26 01:22:14'),
(74,2,'doing the laundry','빨래','/ˈduːɪŋ ðə ˈlɔːndri/',3,'2026-01-26 01:22:14'),
(75,2,'be in charge of','~을 담당하다','/bi ɪn ˈtʃɑːrdʒ əv/',4,'2026-01-26 01:22:14'),
(76,2,'sell things I don\'t use anymore','더 이상 안 쓰는 물건을 팔다','/sɛl θɪŋz aɪ doʊnt juːz ˌɛniˈmɔːr/',5,'2026-01-26 01:22:14'),
(77,2,'organizing','정리','/ˈɔːrɡənaɪzɪŋ/',6,'2026-01-26 01:22:14'),
(78,2,'secondhand marketplace app','중고거래 앱','/ˈsɛkəndˌhænd ˈmɑːrkɪtplɛɪs æp/',7,'2026-01-26 01:22:14'),
(79,2,'pile up','(물건 등이) 쌓이다','/paɪl ʌp/',8,'2026-01-26 01:22:14'),
(80,2,'when it comes to','~에 관해서라면','/wɛn ɪt kʌmz tuː/',9,'2026-01-26 01:22:14'),
(81,2,'especially','특히','/əˈspɛʃəli/',10,'2026-01-26 01:22:14'),
(82,2,'sell','팔다','/sɛl/',11,'2026-01-26 01:22:14'),
(83,2,'anymore','더 이상','/ˌɛniˈmɔːr/',12,'2026-01-26 01:22:14'),
(84,2,'secondhand','중고의','/ˈsɛkəndˌhænd/',13,'2026-01-26 01:22:14'),
(85,2,'pile up','쌓이다','/paɪl ʌp/',14,'2026-01-26 01:22:14'),
(86,2,'meeting up','만나기','/ˈmiːtɪŋ ʌp/',15,'2026-01-26 01:22:14'),
(87,2,'finding nice restaurants','맛집 찾기','/ˈfaɪndɪŋ naɪs ˈrɛstərənts/',16,'2026-01-26 01:22:14'),
(88,2,'chatting','수다 떨기','/ˈtʃætɪŋ/',17,'2026-01-26 01:22:14'),
(89,2,'for hours','몇 시간 동안','/fər ˈaʊərz/',18,'2026-01-26 01:22:14'),
(90,2,'Friendships last forever','우정은 영원하다','/ˈfrɛndʃɪps læst fərˈɛvər/',19,'2026-01-26 01:22:14'),
(91,2,'help each other','서로 돕다','/hɛlp iːtʃ ˈʌðər/',20,'2026-01-26 01:22:14'),
(92,2,'tough times','힘든 시간들','/tʌf taɪmz/',21,'2026-01-26 01:22:14'),
(93,2,'make our bond stronger','유대감이 끈끈해지다','/meɪk ˈaʊər bɑːnd ˈstrɔːŋɡər/',22,'2026-01-26 01:22:14'),
(94,2,'meet up','약속을 잡고 만나다','/miːt ʌp/',23,'2026-01-26 01:22:14'),
(95,2,'each other','서로','/iːtʃ ˈʌðər/',24,'2026-01-26 01:22:14'),
(96,2,'nice restaurant','맛집','/naɪs ˈrɛstərənt/',25,'2026-01-26 01:22:14'),
(97,2,'tough','힘든','/tʌf/',26,'2026-01-26 01:22:14'),
(98,2,'chat','수다를 떨다','/tʃæt/',27,'2026-01-26 01:22:14'),
(99,2,'bond','유대감, 관계','/bɑːnd/',28,'2026-01-26 01:22:14'),
(100,2,'last','지속되다','/læst/',29,'2026-01-26 01:22:14'),
(102,2,'make a mistake','실수를 하다','/meɪk ə mɪˈsteɪk/',31,'2026-01-26 01:22:14'),
(103,2,'make noise','시끄럽게 하다','/meɪk nɔɪz/',32,'2026-01-26 01:22:14'),
(104,2,'make a friend','친구를 사귀다','/meɪk ə frɛnd/',33,'2026-01-26 01:22:14'),
(105,2,'make trouble','말썽을 피우다','/meɪk ˈtrʌbəl/',34,'2026-01-26 01:22:14'),
(106,2,'make a mess','지저분하게 만들다','/meɪk ə mɛs/',35,'2026-01-26 01:22:14'),
(107,2,'make a fuss','소란을 피우다','/meɪk ə fʌs/',36,'2026-01-26 01:22:14'),
(108,2,'make a difference','변화를 만들다','/meɪk ə ˈdɪfərəns/',37,'2026-01-26 01:22:14'),
(109,2,'make a lot of money','많은 돈을 벌다','/meɪk ə lɑːt əv ˈmʌni/',38,'2026-01-26 01:22:14'),
(110,2,'make time','시간을 내다','/meɪk taɪm/',39,'2026-01-26 01:22:14'),
(111,2,'make a wish','소원을 빌다','/meɪk ə wɪʃ/',40,'2026-01-26 01:22:14'),
(112,2,'make a vow','맹세를 하다','/meɪk ə vaʊ/',41,'2026-01-26 01:22:14'),
(113,2,'make excuses','변명을 하다','/meɪk ɪkˈskjuːzɪz/',42,'2026-01-26 01:22:14'),
(114,2,'make a good impression','좋은 인상을 심다','/meɪk ə ɡʊd ɪmˈprɛʃən/',43,'2026-01-26 01:22:14'),
(115,2,'make a suggestion','제안을 하다','/meɪk ə səɡˈdʒɛstʃən/',44,'2026-01-26 01:22:14'),
(116,2,'make a decision','결정을 내리다','/meɪk ə dɪˈsɪʒən/',45,'2026-01-26 01:22:14'),
(117,2,'make a list','리스트를 만들다','/meɪk ə lɪst/',46,'2026-01-26 01:22:14'),
(118,2,'make a call','전화를 걸다','/meɪk ə kɔːl/',47,'2026-01-26 01:22:14'),
(119,2,'go to Seoul','서울에 가다','/ɡoʊ tə soʊl/',48,'2026-01-26 01:22:14'),
(120,2,'go on a vacation','휴가를 떠나다','/ɡoʊ ɑːn ə veɪˈkeɪʃən/',49,'2026-01-26 01:22:14'),
(121,2,'go for lunch','점심 먹으러 가다','/ɡoʊ fər lʌntʃ/',50,'2026-01-26 01:22:14'),
(122,2,'go shopping','쇼핑하러 가다','/ɡoʊ ˈʃɑːpɪŋ/',51,'2026-01-26 01:22:14'),
(124,2,'go to work','회사에 가다','/ɡoʊ tə wɜːrk/',53,'2026-01-26 01:22:14'),
(125,2,'go to bed','자러 가다','/ɡoʊ tə bɛd/',54,'2026-01-26 01:22:14'),
(126,2,'go to the gym','헬스장에 가다','/ɡoʊ tə ðə dʒɪm/',55,'2026-01-26 01:22:14'),
(127,2,'go to the grocery store','식료품점에 가다','/ɡoʊ tə ðə ˈɡroʊsəri stɔːr/',56,'2026-01-26 01:22:14'),
(128,2,'go to the concert','콘서트에 가다','/ɡoʊ tə ðə ˈkɑːnsərt/',57,'2026-01-26 01:22:14'),
(129,2,'go to the drugstore','약국에 가다','/ɡoʊ tə ðə ˈdrʌɡstɔːr/',58,'2026-01-26 01:22:14'),
(131,2,'go on a tour','관광하러 가다','/ɡoʊ ɑːn ə tʊr/',60,'2026-01-26 01:22:14'),
(132,2,'go on a picnic','소풍 가다','/ɡoʊ ɑːn ə ˈpɪknɪk/',61,'2026-01-26 01:22:14'),
(133,2,'go for a walk','산책하러 가다','/ɡoʊ fər ə wɔːk/',62,'2026-01-26 01:22:14'),
(134,2,'go for dinner','저녁 먹으러 가다','/ɡoʊ fər ˈdɪnər/',63,'2026-01-26 01:22:14'),
(135,2,'go swimming','수영하러 가다','/ɡoʊ ˈswɪmɪŋ/',64,'2026-01-26 01:22:14'),
(136,2,'go jogging','조깅하러 가다','/ɡoʊ ˈdʒɑːɡɪŋ/',65,'2026-01-26 01:22:14'),
(137,2,'go skiing','스키를 타러 가다','/ɡoʊ ˈskiːɪŋ/',66,'2026-01-26 01:22:14'),
(138,3,'every morning','매일 아침','/ˈɛvri ˈmɔrnɪŋ/',1,'2026-01-28 05:27:11'),
(139,3,'on my phone','핸드폰으로','/ɑn maɪ foʊn/',2,'2026-01-28 05:27:11'),
(140,3,'sunny','화창한','/ˈsʌni/',3,'2026-01-28 05:27:11'),
(141,3,'fluffy clouds','뭉게구름','/ˈflʌfi klaʊdz/',4,'2026-01-28 05:27:11'),
(142,3,'feel energized','에너지가 넘치다','/fil ˈɛnərdʒaɪzd/',5,'2026-01-28 05:27:11'),
(143,3,'rainy days','비 오는 날','/ˈreɪni deɪz/',6,'2026-01-28 05:27:11'),
(144,3,'in their own way','나름대로','/ɪn ðɛr oʊn weɪ/',7,'2026-01-28 05:27:11'),
(145,3,'just','막, 방금','/dʒʌst/',8,'2026-01-28 05:27:11'),
(146,3,'check','확인하다','/tʃɛk/',9,'2026-01-28 05:27:11'),
(147,3,'favorite','가장 좋아하는','/ˈfeɪvərɪt/',10,'2026-01-28 05:27:11'),
(148,3,'make','만들다, ~하게 하다','/meɪk/',11,'2026-01-28 05:27:11'),
(149,3,'enjoy','좋아하다','/ɪnˈdʒɔɪ/',12,'2026-01-28 05:27:11'),
(150,3,'peaceful','평화로운','/ˈpisfəl/',13,'2026-01-28 05:27:11'),
(151,3,'finish everything','모든 것을 끝내다','/ˈfɪnɪʃ ˈɛvriˌθɪŋ/',14,'2026-01-28 05:27:11'),
(152,3,'put off','미루다','/pʊt ɔf/',15,'2026-01-28 05:27:11'),
(153,3,'for months','몇 달간','/fər mʌnθs/',16,'2026-01-28 05:27:11'),
(154,3,'wrap up','마무리하다','/ræp ʌp/',17,'2026-01-28 05:27:11'),
(155,3,'to-do list','할 일 목록','/təˈdu lɪst/',18,'2026-01-28 05:27:11'),
(156,3,'finish reading the book','책을 다 읽다','/ˈfɪnɪʃ ˈridɪŋ ðə bʊk/',19,'2026-01-28 05:27:11'),
(157,3,'try the new cafe','새로운 카페에 가 보다','/traɪ ðə nu kæˈfeɪ/',20,'2026-01-28 05:27:11'),
(158,3,'a busy but rewarding day','바쁘지만 보람찬 하루','/ə ˈbɪzi bʌt rɪˈwɔrdɪŋ deɪ/',21,'2026-01-28 05:27:11'),
(159,3,'finish','끝내다','/ˈfɪnɪʃ/',22,'2026-01-28 05:27:11'),
(160,3,'clean','정리하다, 청소하다','/klin/',23,'2026-01-28 05:27:11'),
(161,3,'try','처음으로 해보다, 시도하다','/traɪ/',24,'2026-01-28 05:27:11'),
(162,3,'amazing','굉장한, 매우 좋은','/əˈmeɪzɪŋ/',25,'2026-01-28 05:27:11'),
(163,3,'rewarding','보람찬','/rɪˈwɔrdɪŋ/',26,'2026-01-28 05:27:11'),
(164,3,'I got married','결혼했다 (결혼식을 올렸다/행동)','/aɪ ɡɑt ˈmɛrid/',27,'2026-01-28 05:27:11'),
(165,3,'I am married','기혼이다 (결혼한 사람이다/상태)','/aɪ æm ˈmɛrid/',28,'2026-01-28 05:27:11'),
(166,3,'be a student','학생이다','/bi ə ˈstudənt/',29,'2026-01-28 05:27:11'),
(167,3,'be busy','바쁘다','/bi ˈbɪzi/',30,'2026-01-28 05:27:11'),
(168,3,'be off','떠나다 / 출근하지 않는다','/bi ɔf/',31,'2026-01-28 05:27:11'),
(169,3,'be in trouble','큰일 나다','/bi ɪn ˈtrʌbəl/',32,'2026-01-28 05:27:11'),
(170,3,'be a teacher','선생님이다','/bi ə ˈtitʃər/',33,'2026-01-28 05:27:11'),
(171,3,'be a regular customer','단골이다','/bi ə ˈrɛɡjələr ˈkʌstəmər/',34,'2026-01-28 05:27:11'),
(172,3,'be worried','걱정하다','/bi ˈwɜrid/',35,'2026-01-28 05:27:11'),
(173,3,'be wrong','틀렸다','/bi rɔŋ/',36,'2026-01-28 05:27:11'),
(174,3,'be rich','부유하다','/bi rɪtʃ/',37,'2026-01-28 05:27:11'),
(175,3,'be hot','뜨겁다','/bi hɑt/',38,'2026-01-28 05:27:11'),
(176,3,'be away','부재중이다','/bi əˈweɪ/',39,'2026-01-28 05:27:11'),
(177,3,'be over','끝났다','/bi ˈoʊvər/',40,'2026-01-28 05:27:11'),
(178,3,'be on a diet','다이어트 중이다','/bi ɑn ə ˈdaɪət/',41,'2026-01-28 05:27:11'),
(179,3,'be into','푹 빠져 있다','/bi ˈɪntu/',42,'2026-01-28 05:27:11'),
(180,3,'be at home','집에 있다','/bi æt hoʊm/',43,'2026-01-28 05:27:11'),
(181,3,'be at work','회사에 있다','/bi æt wɜrk/',44,'2026-01-28 05:27:11'),
(182,3,'be in style','유행이다','/bi ɪn staɪl/',45,'2026-01-28 05:27:11'),
(183,3,'be on time','시간을 잘 지키다','/bi ɑn taɪm/',46,'2026-01-28 05:27:11'),
(184,3,'be in first place','일 등을 하다','/bi ɪn fɜrst pleɪs/',47,'2026-01-28 05:27:11'),
(185,3,'I do yoga every day','난 매일 요가해','/aɪ du ˈjoʊɡə ˈɛvri deɪ/',48,'2026-01-28 05:27:11'),
(186,3,'I am doing yoga now','나는 지금 요가하는 중이야','/aɪ æm ˈduɪŋ ˈjoʊɡə naʊ/',49,'2026-01-28 05:27:11'),
(187,3,'I am going to do yoga','나 요가하려고','/aɪ æm ˈɡoʊɪŋ tə du ˈjoʊɡə/',50,'2026-01-28 05:27:11'),
(188,3,'I have breakfast','나 아침을 먹어','/aɪ hæv ˈbrɛkfəst/',51,'2026-01-28 05:27:11'),
(189,3,'I\'m having breakfast','나 아침 먹는 중이야','/aɪm ˈhævɪŋ ˈbrɛkfəst/',52,'2026-01-28 05:27:11'),
(190,3,'I\'m going to have breakfast','나 아침 먹으려고 해','/aɪm ˈɡoʊɪŋ tə hæv ˈbrɛkfəst/',53,'2026-01-28 05:27:11'),
(191,3,'I take a shower every day','나 매일 샤워해','/aɪ teɪk ə ˈʃaʊər ˈɛvri deɪ/',54,'2026-01-28 05:27:11'),
(192,3,'I\'m taking a shower','나 샤워하는 중이야','/aɪm ˈteɪkɪŋ ə ˈʃaʊər/',55,'2026-01-28 05:27:11'),
(193,3,'I\'m going to take a shower','나 샤워하려고 해','/aɪm ˈɡoʊɪŋ tə teɪk ə ˈʃaʊər/',56,'2026-01-28 05:27:11'),
(194,3,'I do the dishes every day','나 매일 설거지를 해','/aɪ du ðə ˈdɪʃɪz ˈɛvri deɪ/',57,'2026-01-28 05:27:11'),
(195,3,'I\'m doing the dishes','나 설거지를 하는 중이야','/aɪm ˈduɪŋ ðə ˈdɪʃɪz/',58,'2026-01-28 05:27:11'),
(196,3,'I\'m going to do the dishes','나 설거지를 하려고 해','/aɪm ˈɡoʊɪŋ tə du ðə ˈdɪʃɪz/',59,'2026-01-28 05:27:11'),
(197,3,'I do Pilates every day','나 매일 필라테스를 해','/aɪ du pəˈlɑtiz ˈɛvri deɪ/',60,'2026-01-28 05:27:11'),
(198,3,'I\'m doing Pilates','나 필라테스를 하는 중이야','/aɪm ˈduɪŋ pəˈlɑtiz/',61,'2026-01-28 05:27:11'),
(199,3,'I\'m going to do Pilates','나 필라테스를 하려고 해','/aɪm ˈɡoʊɪŋ tə du pəˈlɑtiz/',62,'2026-01-28 05:27:11'),
(200,3,'I do my hair every day','나 매일 머리를 손질해','/aɪ du maɪ hɛr ˈɛvri deɪ/',63,'2026-01-28 05:27:11'),
(201,3,'I\'m doing my hair','나 머리를 손질하는 중이야','/aɪm ˈduɪŋ maɪ hɛr/',64,'2026-01-28 05:27:11'),
(202,3,'I\'m going to do my hair','나 머리를 손질하려고 해','/aɪm ˈɡoʊɪŋ tə du maɪ hɛr/',65,'2026-01-28 05:27:11'),
(203,3,'They go for a walk every day','걔네 매일 산책하러 가','/ðeɪ ɡoʊ fər ə wɔk ˈɛvri deɪ/',66,'2026-01-28 05:27:11'),
(204,3,'They are going for a walk','걔네 산책하러 가는 중이야','/ðeɪ ɑr ˈɡoʊɪŋ fər ə wɔk/',67,'2026-01-28 05:27:11'),
(205,3,'They are going to go for a walk','걔네 산책하러 가려고 해','/ðeɪ ɑr ˈɡoʊɪŋ tə ɡoʊ fər ə wɔk/',68,'2026-01-28 05:27:11'),
(206,3,'check the weather forecast','일기예보를 확인하다','/tʃɛk ðə ˈwɛðər ˈfɔrˌkæst/',69,'2026-01-28 05:27:11'),
(207,4,'get my hair permed','파마를 하다','/ɡɛt maɪ hɛr pɜːrmd/',1,'2026-02-04 05:14:37'),
(208,4,'get my hair colored','염색을 하다','/ɡɛt maɪ hɛr ˈkʌlərd/',2,'2026-02-04 05:14:37'),
(209,4,'this weekend','이번 주말','/ðɪs ˈwiːkˌɛnd/',3,'2026-02-04 05:14:37'),
(210,4,'during the week','주중에','/ˈdʊrɪŋ ðə wiːk/',4,'2026-02-04 05:14:37'),
(211,4,'on the weekend','주말에','/ɑːn ðə ˈwiːkˌɛnd/',5,'2026-02-04 05:14:37'),
(212,4,'buy a nice outfit','좋은 옷을 사다','/baɪ ə naɪs ˈaʊtfɪt/',6,'2026-02-04 05:14:37'),
(213,4,'order fried chicken','치킨을 시켜 먹다','/ˈɔːrdər fraɪd ˈtʃɪkən/',7,'2026-02-04 05:14:37'),
(214,4,'on weekends','주말마다','/ɑːn ˈwiːkˌɛndz/',8,'2026-02-04 05:14:37'),
(215,4,'weekend','주말','/ˈwiːkˌɛnd/',9,'2026-02-04 05:14:37'),
(216,4,'hair salon','미용실','/hɛr səˈlɑːn/',10,'2026-02-04 05:14:37'),
(217,4,'department store','백화점','/dɪˈpɑːrtmənt stɔːr/',11,'2026-02-04 05:14:37'),
(218,4,'outfit','외출복','/ˈaʊtfɪt/',12,'2026-02-04 05:14:37'),
(219,4,'order','주문하다','/ˈɔːrdər/',13,'2026-02-04 05:14:37'),
(220,4,'come out','출시되다','/kʌm aʊt/',14,'2026-02-04 05:14:37'),
(221,4,'use buses and subways','버스와 지하철을 이용하다','/juːz ˈbʌsəz ænd ˈsʌbˌweɪz/',15,'2026-02-04 05:14:37'),
(222,4,'go to other cities','다른 도시로 가다','/ɡoʊ tu ˈʌðər ˈsɪtiz/',16,'2026-02-04 05:14:37'),
(223,4,'drive','운전하다','/draɪv/',17,'2026-02-04 05:14:37'),
(224,4,'convenient','편리한','/kənˈviːniənt/',18,'2026-02-04 05:14:37'),
(225,4,'without my car','차 없이','/wɪˈðaʊt maɪ kɑːr/',19,'2026-02-04 05:14:37'),
(226,4,'drive a supercar','슈퍼카를 몰다','/draɪv ə ˈsuːpərˌkɑːr/',20,'2026-02-04 05:14:37'),
(227,4,'most of the time','대부분의 시간','/moʊst əv ðə taɪm/',21,'2026-02-04 05:14:37'),
(228,4,'get around','돌아다니다','/ɡɛt əˈraʊnd/',22,'2026-02-04 05:14:37'),
(229,4,'more often','더 자주','/mɔːr ˈɔːfən/',23,'2026-02-04 05:14:37'),
(230,4,'feel like','기분이 들다','/fiːl laɪk/',24,'2026-02-04 05:14:37'),
(231,4,'I did yoga yesterday','나 어제 요가를 했어','/aɪ dɪd ˈjoʊɡə ˈjɛstərdeɪ/',25,'2026-02-04 05:14:37'),
(232,4,'I have done yoga before','나 전에 요가를 해 본 적이 있어','/aɪ hæv dʌn ˈjoʊɡə bɪˈfɔːr/',26,'2026-02-04 05:14:37'),
(233,4,'I got Lasik surgery last month','나 지난달에 라식 수술을 받았어','/aɪ ɡɑːt ˈleɪsɪk ˈsɜːrdʒəri læst mʌnθ/',27,'2026-02-04 05:14:37'),
(234,4,'I did weight training yesterday','나 어제 근력 운동을 했어','/aɪ dɪd weɪt ˈtreɪnɪŋ ˈjɛstərdeɪ/',28,'2026-02-04 05:14:37'),
(235,4,'I have gotten Lasik surgery','나 라식 수술을 받은 적이 있어','/aɪ hæv ˈɡɑːtən ˈleɪsɪk ˈsɜːrdʒəri/',29,'2026-02-04 05:14:37'),
(236,4,'I\'ve done weight training before','나 전에 근력 운동을 해 본 적이 있어','/aɪv dʌn weɪt ˈtreɪnɪŋ bɪˈfɔːr/',30,'2026-02-04 05:14:37'),
(237,4,'I got an e-mail yesterday','나 어제 메일을 하나 받았어','/aɪ ɡɑːt ən ˈiːmeɪl ˈjɛstərdeɪ/',31,'2026-02-04 05:14:37'),
(238,4,'I\'ve just gotten an e-mail','나 막 메일 하나를 받았어','/aɪv dʒʌst ˈɡɑːtən ən ˈiːmeɪl/',32,'2026-02-04 05:14:37'),
(239,4,'I got a new car yesterday','나 어제 새 차를 뽑았어','/aɪ ɡɑːt ə nuː kɑːr ˈjɛstərdeɪ/',33,'2026-02-04 05:14:37'),
(240,4,'I\'ve just gotten a new car','나 막 새 차를 뽑았어','/aɪv dʒʌst ˈɡɑːtən ə nuː kɑːr/',34,'2026-02-04 05:14:37'),
(241,4,'I got a flu shot yesterday','나 어제 독감 주사를 맞았어','/aɪ ɡɑːt ə fluː ʃɑːt ˈjɛstərdeɪ/',35,'2026-02-04 05:14:37'),
(242,4,'I\'ve gotten a flu shot before','나 전에 독감 주사를 맞은 적이 있어','/aɪ hæv ˈɡɑːtən ə fluː ʃɑːt bɪˈfɔːr/',36,'2026-02-04 05:14:37'),
(243,4,'I took my medicine yesterday','나 어제 약을 복용했어','/aɪ tʊk maɪ ˈmɛdəsən ˈjɛstərdeɪ/',37,'2026-02-04 05:14:37'),
(244,4,'I\'ve just taken my medicine','나 막 내 약을 복용했어','/aɪv dʒʌst ˈteɪkən maɪ ˈmɛdəsən/',38,'2026-02-04 05:14:37'),
(245,4,'I did yoga yesterday','나 어제 요가를 했어','/aɪ dɪd ˈjoʊɡə ˈjɛstərdeɪ/',39,'2026-02-04 05:14:37'),
(246,4,'I\'ve done yoga before','나 전에 요가를 해 본 적이 있어','/aɪv dʌn ˈjoʊɡə bɪˈfɔːr/',40,'2026-02-04 05:14:37'),
(247,4,'I did leather crafts yesterday','나 어제 가죽 공예를 했어','/aɪ dɪd ˈlɛðər kræfts ˈjɛstərdeɪ/',41,'2026-02-04 05:14:37'),
(248,4,'I\'ve done leather crafts before','나 전에 가죽 공예를 해 본 적이 있어','/aɪv dʌn ˈlɛðər kræfts bɪˈfɔːr/',42,'2026-02-04 05:14:37'),
(249,4,'I made a vow yesterday','나 어제 맹세를 했어','/aɪ meɪd ə vaʊ ˈjɛstərdeɪ/',43,'2026-02-04 05:14:37'),
(250,4,'I\'ve made a vow before','나 전에 맹세를 한 적이 있어','/aɪv meɪd ə vaʊ bɪˈfɔːr/',44,'2026-02-04 05:14:37'),
(251,4,'I made a promise yesterday','나 어제 약속을 하나 했어','/aɪ meɪd ə ˈprɑːmɪs ˈjɛstərdeɪ/',45,'2026-02-04 05:14:37'),
(252,4,'I have to do yoga','나 요가를 해야 해','/aɪ hæv tu duː ˈjoʊɡə/',46,'2026-02-04 05:14:37'),
(253,4,'I have been doing yoga for two hours','나 두 시간 동안 요가를 하고 있어','/aɪ hæv bɪn ˈduːɪŋ ˈjoʊɡə fɔːr tuː ˈaʊərz/',47,'2026-02-04 05:14:37'),
(254,4,'I have to take my medicine','나는 약을 복용해야 해','/aɪ hæv tu teɪk maɪ ˈmɛdəsən/',48,'2026-02-04 05:14:37'),
(255,4,'I have been taking my medicine','나는 약을 복용해 오는 중이야','/aɪ hæv bɪn ˈteɪkɪŋ maɪ ˈmɛdəsən/',49,'2026-02-04 05:14:37'),
(256,4,'I have just taken my medicine','나 막 내 약을 복용했어','/aɪ hæv dʒʌst ˈteɪkən maɪ ˈmɛdəsən/',50,'2026-02-04 05:14:37'),
(257,4,'I have to get a table','나는 테이블을 맡아야 해','/aɪ hæv tu ɡɛt ə ˈteɪbəl/',51,'2026-02-04 05:14:37'),
(258,4,'I have to get a refund','나는 환불을 받아야 해','/aɪ hæv tu ɡɛt ə ˈriːfʌnd/',52,'2026-02-04 05:14:37'),
(259,4,'I have to get a job','나는 취직을 해야 해','/aɪ hæv tu ɡɛt ə dʒɑːb/',53,'2026-02-04 05:14:37'),
(260,4,'I have to get a flu shot','나는 독감 주사를 맞아야 해','/aɪ hæv tu ɡɛt ə fluː ʃɑːt/',54,'2026-02-04 05:14:37'),
(261,4,'I have to take a course','나는 강좌를 수강해야 해','/aɪ hæv tu teɪk ə kɔːrs/',55,'2026-02-04 05:14:37'),
(262,4,'I have to take a passport photo','나는 여권 사진을 찍어야 해','/aɪ hæv tu teɪk ə ˈpæspɔːrt ˈfoʊtoʊ/',56,'2026-02-04 05:14:37'),
(263,4,'I have to do the vacuuming','나는 청소기를 돌려야 해','/aɪ hæv tu duː ðə ˈvækjuːmɪŋ/',57,'2026-02-04 05:14:37'),
(264,4,'I have to go to the grocery store','나는 장을 보러 가야 해','/aɪ hæv tu ɡoʊ tu ðə ˈɡroʊsəri stɔːr/',58,'2026-02-04 05:14:37'),
(265,4,'I have to go to Seoul','나는 서울에 가야 해','/aɪ hæv tu ɡoʊ tu soʊl/',59,'2026-02-04 05:14:37'),
(266,4,'I have been doing office work for three months','나는 사무 업무를 3개월 동안 해 오는 중이야','/aɪ hæv bɪn ˈduːɪŋ ˈɔːfəs wɜːrk fɔːr θriː mʌnθs/',60,'2026-02-04 05:14:37'),
(267,4,'I have been doing yoga for three months','나는 요가를 3개월 동안 해 오는 중이야','/aɪ hæv bɪn ˈduːɪŋ ˈjoʊɡə fɔːr θriː mʌnθs/',61,'2026-02-04 05:14:37'),
(268,4,'I have been doing Pilates for three months','나는 필라테스를 3개월 동안 해 오는 중이야','/aɪ hæv bɪn ˈduːɪŋ pəˈlɑːtiːz fɔːr θriː mʌnθs/',62,'2026-02-04 05:14:37'),
(269,4,'I have been doing leather crafts for three months','나는 가죽 공예를 3개월 동안 해 오는 중이야','/aɪ hæv bɪn ˈduːɪŋ ˈlɛðər kræfts fɔːr θriː mʌnθs/',63,'2026-02-04 05:14:37'),
(270,4,'I have been making videos for three months','나는 영상 제작을 3개월 동안 해 오는 중이야','/aɪ hæv bɪn ˈmeɪkɪŋ ˈvɪdioʊz fɔːr θriː mʌnθs/',64,'2026-02-04 05:14:37'),
(271,4,'I have been going to the gym for three months','나는 헬스장을 3개월 동안 다니는 중이야','/aɪ hæv bɪn ˈɡoʊɪŋ tu ðə dʒɪm fɔːr θriː mʌnθs/',65,'2026-02-04 05:14:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rounds`
--

LOCK TABLES `rounds` WRITE;
/*!40000 ALTER TABLE `rounds` DISABLE KEYS */;
INSERT INTO `rounds` VALUES
(1,'1. take, do','',30,'MEDIUM','COMPLETED',24,'2026-01-21 02:40:42'),
(2,'2. make, go','2. make, go',30,'MEDIUM','COMPLETED',24,'2026-01-26 00:55:49'),
(3,'3. Be, 현재시제, 날씨이야기, 오늘 있었던일','3. Be, 현재시제, 날씨이야기, 오늘 있었던일',30,'MEDIUM','COMPLETED',24,'2026-01-28 04:42:27'),
(4,'4. have p.p, have to, have been ing','',30,'MEDIUM','COMPLETED',24,'2026-02-04 04:43:55');
/*!40000 ALTER TABLE `rounds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `achievement_id` varchar(50) NOT NULL,
  `tier` varchar(20) DEFAULT NULL,
  `current_value` int(11) DEFAULT 0,
  `unlocked_at` timestamp NULL DEFAULT current_timestamp(),
  `is_notified` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement_tier` (`user_id`,`achievement_id`,`tier`),
  KEY `achievement_id` (`achievement_id`),
  KEY `idx_user_achievements_user` (`user_id`),
  KEY `idx_user_achievements_notified` (`user_id`,`is_notified`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES
(1,1,'FIRST_LOGIN',NULL,1,'2026-02-11 07:48:58',1),
(2,1,'FIRST_EXAM',NULL,4,'2026-02-11 07:48:58',1),
(3,1,'FIRST_PASS',NULL,4,'2026-02-11 07:48:58',1),
(4,1,'FIRST_OFFLINE',NULL,4,'2026-02-11 07:48:58',1);
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_action_counters`
--

DROP TABLE IF EXISTS `user_action_counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_action_counters` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `action` varchar(50) NOT NULL,
  `count` int(11) DEFAULT 0,
  `last_performed_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_action` (`user_id`,`action`),
  KEY `idx_user_action_counters_user` (`user_id`),
  CONSTRAINT `user_action_counters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_action_counters`
--

LOCK TABLES `user_action_counters` WRITE;
/*!40000 ALTER TABLE `user_action_counters` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_action_counters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badges` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `badge_id` varchar(50) NOT NULL,
  `slot_number` int(11) DEFAULT NULL,
  `earned_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_badge` (`user_id`,`badge_id`),
  UNIQUE KEY `uk_user_slot` (`user_id`,`slot_number`),
  KEY `badge_id` (`badge_id`),
  KEY `idx_user_badges_user` (`user_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
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
-- Dumping routines for database 'engtest'
--

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

-- Dump completed on 2026-02-11  7:51:56

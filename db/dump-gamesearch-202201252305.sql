-- MySQL dump 10.13  Distrib 5.5.62, for Win64 (AMD64)
--
-- Host: localhost    Database: gamesearch
-- ------------------------------------------------------
-- Server version	5.7.24

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `gameresults`
--

DROP TABLE IF EXISTS `gameresults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gameresults` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `search_id` int(10) unsigned DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `img` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `provider` varchar(40) DEFAULT NULL,
  `price` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `game_search_id_fk_constraint` (`search_id`),
  CONSTRAINT `game_search_id_fk_constraint` FOREIGN KEY (`search_id`) REFERENCES `searches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gameresults`
--

LOCK TABLES `gameresults` WRITE;
/*!40000 ALTER TABLE `gameresults` DISABLE KEYS */;
INSERT INTO `gameresults` VALUES (101,73,'https://www.technopolis.bg','5e2e65dcbd0d66b92dd7dfd5deb77419686c906d620b1a71119b0c3998258cc7.png','Игра RED DEAD REDEMPTION 2  PS4','Technopolis',89.99),(102,73,'https://www.technopolis.bg','e99526d7afc8f4bf202e5be542943d8eea6d6365703dc4fff81e3b39c0250fac.png','Игра RED DEAD REDEMPTION 2  XBOX ONE','Technopolis',89.99),(103,73,'https://www.ozone.bg/product/red-dead-redemption-2-ps4','1f106ba1499ddd76f900c6c7107f8c912614ce941c2af46218ebe9dec52dd4d1.png','Red Dead Redemption 2 (PS4)','Ozone',59.99),(104,73,'https://www.ozone.bg/product/red-dead-redemption-2-xbox-one','fbd67efaa7a1f1c84d349f983452b249584f2e73e9e3006d56c735b90a6f0d0b.png','Red Dead Redemption 2 (Xbox One)','Ozone',59.99),(105,74,'https://www.ozone.bg/product/deathloop-ps5','829914bebaf79d658fd4c28a8ce5048ba25e1549ea8eb769b563061c224b9899.png','Deathloop (PS5)','Ozone',109),(106,74,'https://www.ozone.bg/product/deathloop','14bc1c0aaed72f2591b7a5c401a8862c64765fce89c8df30d875c687cdefa92d.png','Deathloop (PC)','Ozone',99.99),(107,74,'https://www.ozone.bg/product/deathloop-deluxe-edition','bcc021646dcc713b1b411e106ee566651300e38c6ccd66aa26766487b73e6d22.png','Deathloop Deluxe Edition (PC)','Ozone',129),(108,75,'https://www.ozone.bg/product/spyro-reignited-trilogy-xbox-one','ef7a528c7ce883a4cd28ff514e44e245161ac33f2717f03ee6c17aa35e21c872.png','Spyro Reignited Trilogy (Xbox One)','Ozone',54.99),(109,77,'https://www.ozone.bg/product/luigi-s-mansion-3-nintendo-switch','805d35523057e71dacd4da97343238b532ff8ac1c0bdef03d87387aa29401574.png','Luigi\'s Mansion 3 (Nintendo Switch)','Ozone',119),(110,84,'https://www.technopolis.bg','1c3b695aa3c5885a4fee2ae8e74980bb2de4d35234e97ea2f2499e2b09714e17.png','Игра ASSASSIN\'S CREED 3&LIBERATION  SWITCH','Technopolis',59.99),(111,84,'https://www.technopolis.bg','73eca9b823dce2ad1e7295abd6aa76f01d0bcc274c4d83ebb74fae24bba50c1d.png','Игра ASSASSIN\'S CREED REBEL COLL.  SWITCH','Technopolis',59.99),(112,84,'https://www.technopolis.bg','e62b4f84827a6910ab0b98278252239f50d614776843b61bd035fe2efb0f9641.png','Игра ASSASSIN\'S CREED ODYSSEY  PS4','Technopolis',39.99),(113,84,'https://www.technopolis.bg','3ac7141872533386980c6b9f89fae27c12014edd322db92fe83b3dc18d1b4715.png','Игра ASSASSIN\'S CREED ODYSSEY  XBOX ONE','Technopolis',39.99),(114,84,'https://www.technopolis.bg','fc749f6d59bcc742aa11dcca4a0a78bee82449b19f8b12732995ac58b3299a00.png','Игра ASSASSIN\'S CREED VALHALLA  XBOX ONE','Technopolis',59.99),(115,84,'https://www.technopolis.bg','4be137caaa29bef9b93acaa86a5b45c025799fd905b709dc5082b82aa5d90c78.png','Игра ASSASSIN\'S CREED SYNDICATE  PS4','Technopolis',39.9),(116,84,'https://www.technopolis.bg','7bd55690ce842b7446e850423db7f0e9f5735f43946a0db9fc4cebb24e0e9c15.png','Игра ASSASSIN\'S CREED CHRONICLES  PS4','Technopolis',39.9),(117,84,'https://www.technopolis.bg','a8b604d8427a73e2270e8e886003ba5acae9abaa00adfd7b451b91b23dd58e63.png','Игра ASSASSIN\'S CREED ROGUE REMASTE  PS4','Technopolis',39.9),(118,84,'https://www.technopolis.bg','d5325fb966e1a7645ff6cb2fa80f19354dad3aaa3ef1344ca6ca117ec51ab1f5.png','Игра ASSASSIN\'S CREED 3&AC LIBERATI  PS4','Technopolis',79),(119,84,'https://www.technopolis.bg','30ad04b6cde29121529d9c694f173487c48e06964883b4fa95ba0fdf697e1ba0.png','Игра ASSASSIN\'S CREED 4 BLACK FLAG  PS4','Technopolis',29.99),(120,84,'https://www.technopolis.bg','0779166784743bdc0d7caeb2592064646363deb2209ad4bd34d5067167b8c023.png','Игра ASSASSIN\'S CREED THE EZIO  PS4','Technopolis',39.9),(121,84,'https://www.technopolis.bg','1d9e119e27f08e786088bc13999b8a6181717b9ad7ee4b40a7909c54dddeea08.png','Игра ASSASSIN\'S CREED UNITY ST.ED.  PS4','Technopolis',39.9),(122,84,'https://www.ozone.bg/product/assassin-s-creed-the-ezio-collection-ps4','d7772306414addde5ce5b2f9e49d5d46b39da36412d89ab5ff5b883e2d07277b.png','Assassin\'s Creed: The Ezio Collection (PS4)','Ozone',28.99),(123,84,'https://www.ozone.bg/product/assassin-s-creed-valhalla-ps4-428801','b7232fc2fa9ae96e8f32a990d4bb96b9849a7d95b97fedc1009f4b9863c892ea.png','Assassin\'s Creed Valhalla (PS4)','Ozone',139),(124,84,'https://www.ozone.bg/product/assassin-s-creed-origins-ps4','7ffdd4ac13841e810106bd1de8d2b3e6a30c2389e70d278b7c92485df42fd362.png','Assassin\'s Creed Origins (PS4)','Ozone',27.99),(125,84,'https://www.ozone.bg/product/assassin-s-creed-odyssey-ps4','e492e5bc767e8b2d8b56841d96ef35c1fd82f1eff2224e3fb7d8110ffac08ea4.png','Assassin\'s Creed Odyssey (PS4)','Ozone',39.99),(126,84,'https://www.ozone.bg/product/ac-valhalla-standart-edition-ps5','0dd78dc91d45b819a66fbe7b91e40bb6a32cdfaccf6ff4aff38cd9baeaf6504b.png','Assassin\'s Creed Valhalla (PS5)','Ozone',139),(127,84,'https://www.ozone.bg/product/assassin-s-creed-unity-ps4','3962dbbca329b825892fc5798d94eab65a60699cd66d180c8c17c635d537a8b7.png','Assassin\'s Creed Unity (PS4)','Ozone',27.99),(128,84,'https://www.ozone.bg/product/assassin-s-creed-3-liberation-hd-remaster-ps4','6af4bdd58aea3c02de1930c3ee7b907b4100a4bf8a81fe1c36705e923e6f4ea4.png','Assassin\'s Creed III Remastered + All Solo DLC & Assassin\'s Creed Liberation (PS4)','Ozone',39.99),(129,84,'https://www.ozone.bg/product/assassin-s-creed-iv-black-flag-ps4','bfad48ddeb01293f502f98f0903a8a70893cbb9bed3380e37b521e7fd2645fa5.png','Assassin\'s Creed IV: Black Flag (PS4)','Ozone',29.99),(130,84,'https://www.ozone.bg/product/assassin-s-creed-syndicate-ps4','1ed10a6fedc2266a886e7381401e489d99ff279e19ab04da8a5a754331d98f0f.png','Assassin\'s Creed: Syndicate (PS4)','Ozone',39.99),(131,84,'https://www.ozone.bg/product/assassin-s-creed-valhalla-dawn-of-ragnarok-ps4-code-in-a-box','662817a98edfd7a907f97b4c583b68568712ecf96f1e9abbaa833557483fc4d8.png','Assassin\'s Creed Valhalla - Dawn Of Ragnarok (PS4)','Ozone',79.99),(132,84,'https://www.ozone.bg/product/assassin-s-creed-valhalla-dawn-of-ragnarok-ps5-code-in-a-box','4297e9a72fbc96b0dc6567b3952481866cd5ca51fcf8521817f5de0b7e7af159.png','Assassin\'s Creed Valhalla - Dawn Of Ragnarok (PS5)','Ozone',79.99),(133,84,'https://www.ozone.bg/product/assassins-creed-valhalla-standard-edition-xbox','90917f03e4b2fb650fc79489c6fed294e253f2849e4c9abbb0e30ff5ccf7584f.png','Assassin\'s Creed Valhalla (Xbox One)','Ozone',139),(134,84,'https://www.ozone.bg/product/assassin-s-creed-rogue-remastered-ps4','a4ecd19e6e7d64562e9ae80c5d9b68ab9faabccde85e18e0eb332e15516d7f54.png','Assassin’s Creed Rogue Remastered (PS4)','Ozone',29.99),(135,84,'https://www.ozone.bg/product/assassin-s-creed-the-rebel-collection-nintendo-switch','a1eed5ffe54ad9f03b94f73a70b27ee410074e2b76bca635d23049bbe1dee70f.png','Assassin\'s Creed: The Rebel Collection (Nintendo Switch)','Ozone',59.99),(136,84,'https://www.ozone.bg/product/assassin-s-creed-valhalla-dawn-of-ragnarok-xbox-code-in-a-box','b0cf48f3ee01b0a5a50c2ad42c2d49da81aaf944e661e634a3054366979c7b66.png','Assassin\'s Creed Valhalla - Dawn Of Ragnarok (Xbox One/Series SX)','Ozone',79.99),(137,84,'https://www.ozone.bg/product/assassin-s-creed-odyssey-xbox-one','76d8a300f12f54f995a49d7a176ec2758b31dcce47ebd8a381ed1675d5beb7df.png','Assassin\'s Creed Odyssey (Xbox One)','Ozone',39.99),(138,84,'https://www.ozone.bg/product/assassin-s-creed-the-ezio-collection-nsw','496e8fd952de9709959898a9dea3f1f0891bc86a25a78209c0120e98ef18a61b.png','Assassin\'s Creed: The Ezio Collection (Nintendo Switch)','Ozone',99.99),(139,84,'https://www.ozone.bg/product/assassin-s-creed-3-liberation-hd-remaster-nintendo-switch','fae339a7623e9b3bc8100abc65f01605f5819cb2b9340017912cc58161d8a43e.png','Assassin\'s Creed III Remastered + All Solo DLC & Assassin\'s Creed Liberation (Nintendo Switch)','Ozone',69.99),(140,84,'https://www.ozone.bg/product/assassin-s-creed-rogue-remastered-xbox-one','cfbc0f384de0bc5cd18d5e58f6dfc6da4219e43ce95e1f1e5d0ad41671ea3eae.png','Assassin’s Creed Rogue Remastered (Xbox One)','Ozone',39.99);
/*!40000 ALTER TABLE `gameresults` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `priceresults`
--

DROP TABLE IF EXISTS `priceresults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `priceresults` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `search_id` int(10) unsigned DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `search_id` (`search_id`),
  CONSTRAINT `price_search_id_fk_constraint` FOREIGN KEY (`search_id`) REFERENCES `searches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priceresults`
--

LOCK TABLES `priceresults` WRITE;
/*!40000 ALTER TABLE `priceresults` DISABLE KEYS */;
INSERT INTO `priceresults` VALUES (83,73,'https://www.pricecharting.com/game/pal-playstation-4/red-dead-redemption-2','Red Dead Redemption 2 PAL Playstation 4',17.45),(84,73,'https://www.pricecharting.com/game/pal-xbox-one/red-dead-redemption-2','Red Dead Redemption 2 PAL Xbox One',12.95),(85,73,'https://www.pricecharting.com/game/pal-playstation-4/red-dead-redemption-2-special-edition','Red Dead Redemption 2 [Special Edition] PAL Playstation 4',20.12),(86,73,'https://www.pricecharting.com/game/pal-xbox-one/red-dead-redemption-2-special-edition','Red Dead Redemption 2 [Special Edition] PAL Xbox One',21.69),(87,73,'https://www.pricecharting.com/game/pal-playstation-4/red-dead-redemption-2-steelbook-edition','Red Dead Redemption 2 [Steelbook Edition] PAL Playstation 4',31.25),(88,73,'https://www.pricecharting.com/game/pal-playstation-4/red-dead-redemption-2-ultimate-edition','Red Dead Redemption 2 [Ultimate Edition] PAL Playstation 4',34.63),(89,75,'https://www.pricecharting.com/game/pal-gameboy-advance/crash-&-spyro-super-pack-volume-1','Crash & Spyro Super Pack Volume 1 PAL GameBoy Advance',0),(90,75,'https://www.pricecharting.com/game/pal-gameboy-advance/crash-and-spyro-super-pack-volume-2','Crash and Spyro Super Pack Volume 2 PAL GameBoy Advance',0),(91,75,'https://www.pricecharting.com/game/pal-playstation-4/crash-team-racing-&-spyro-reignited-trilogy','Crash Team Racing & Spyro Reignited Trilogy PAL Playstation 4',0),(92,75,'https://www.pricecharting.com/game/pal-gameboy-advance/legend-of-spyro-a-new-beginning','Legend of Spyro A New Beginning PAL GameBoy Advance',15.56),(93,75,'https://www.pricecharting.com/game/pal-gamecube/legend-of-spyro-a-new-beginning','Legend of Spyro A New Beginning PAL Gamecube',30.17),(94,75,'https://www.pricecharting.com/game/pal-nintendo-ds/legend-of-spyro-a-new-beginning','Legend of Spyro A New Beginning PAL Nintendo DS',6.43),(95,75,'https://www.pricecharting.com/game/pal-playstation-2/legend-of-spyro-a-new-beginning','Legend of Spyro A New Beginning PAL Playstation 2',6.63),(96,75,'https://www.pricecharting.com/game/pal-xbox/legend-of-spyro-a-new-beginning','Legend of Spyro A New Beginning PAL Xbox',13.73),(97,76,'https://www.pricecharting.com/game/pal-playstation-3/bayonetta','Bayonetta PAL Playstation 3',5.72),(98,76,'https://www.pricecharting.com/game/pal-wii-u/bayonetta','Bayonetta PAL Wii U',22.15),(99,76,'https://www.pricecharting.com/game/pal-xbox-360/bayonetta','Bayonetta PAL Xbox 360',8.35),(100,76,'https://www.pricecharting.com/game/pal-playstation-4/bayonetta-+-vanquish-10th-anniversary-bundle','Bayonetta + Vanquish 10th Anniversary Bundle PAL Playstation 4',20.93),(101,76,'https://www.pricecharting.com/game/pal-wii-u/bayonetta-1-&-2-special-edition','Bayonetta 1 & 2 [Special Edition] PAL Wii U',32.7),(102,76,'https://www.pricecharting.com/game/pal-nintendo-switch/bayonetta-2','Bayonetta 2 PAL Nintendo Switch',40.78),(103,76,'https://www.pricecharting.com/game/pal-wii-u/bayonetta-2','Bayonetta 2 PAL Wii U',14.89),(104,76,'https://www.pricecharting.com/game/pal-wii-u/bayonetta-2-first-print-edition','Bayonetta 2 [First Print Edition] PAL Wii U',86.23),(105,77,'https://www.pricecharting.com/game/gamecube/luigi%27s-mansion','Luigi\'s Mansion Gamecube',60),(106,77,'https://www.pricecharting.com/game/nintendo-3ds/luigi%27s-mansion','Luigi\'s Mansion Nintendo 3DS',35.22),(107,77,'https://www.pricecharting.com/game/pal-gamecube/luigi%27s-mansion','Luigi\'s Mansion PAL Gamecube',43.72),(108,77,'https://www.pricecharting.com/game/pal-nintendo-3ds/luigi%27s-mansion','Luigi\'s Mansion PAL Nintendo 3DS',36.72),(109,77,'https://www.pricecharting.com/game/pal-nintendo-3ds/luigi%27s-mansion-2','Luigi\'s Mansion 2 PAL Nintendo 3DS',13.62),(110,77,'https://www.pricecharting.com/game/pal-nintendo-3ds/luigi%27s-mansion-2-nintendo-selects','Luigi\'s Mansion 2 [Nintendo Selects] PAL Nintendo 3DS',13.67),(111,77,'https://www.pricecharting.com/game/nintendo-switch/luigi%27s-mansion-3','Luigi\'s Mansion 3 Nintendo Switch',37),(112,77,'https://www.pricecharting.com/game/pal-nintendo-switch/luigi%27s-mansion-3','Luigi\'s Mansion 3 PAL Nintendo Switch',39.8),(113,84,'https://www.pricecharting.com/game/jp-xbox-360/assassin%27s-creed','Assassin\'s Creed JP Xbox 360',3.63),(114,84,'https://www.pricecharting.com/game/pal-playstation-3/assassin%27s-creed','Assassin\'s Creed PAL Playstation 3',3.82),(115,84,'https://www.pricecharting.com/game/pal-xbox-360/assassin%27s-creed','Assassin\'s Creed PAL Xbox 360',2.89),(116,84,'https://www.pricecharting.com/game/playstation-3/assassin%27s-creed','Assassin\'s Creed Playstation 3',7.34),(117,84,'https://www.pricecharting.com/game/xbox-360/assassin%27s-creed','Assassin\'s Creed Xbox 360',5.9),(118,84,'https://www.pricecharting.com/game/pal-playstation-3/assassin%27s-creed-2-&-assassin%27s-creed','Assassin\'s Creed 2 & Assassin\'s Creed PAL Playstation 3',12.41),(119,84,'https://www.pricecharting.com/game/pal-playstation-3/assassin%27s-creed-anthology','Assassin\'s Creed Anthology PAL Playstation 3',57.25),(120,84,'https://www.pricecharting.com/game/pal-xbox-360/assassin%27s-creed-anthology','Assassin\'s Creed Anthology PAL Xbox 360',42.16);
/*!40000 ALTER TABLE `priceresults` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `searches`
--

DROP TABLE IF EXISTS `searches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `searches` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `query_string` varchar(60) NOT NULL,
  `search_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `query_string` (`query_string`),
  UNIQUE KEY `searches_un` (`query_string`),
  KEY `searches_query_string_IDX` (`query_string`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `searches`
--

LOCK TABLES `searches` WRITE;
/*!40000 ALTER TABLE `searches` DISABLE KEYS */;
INSERT INTO `searches` VALUES (73,'red dead redemption 2','2022-01-23 14:35:14'),(74,'deathloop','2022-01-23 15:10:51'),(75,'spyro','2022-01-23 15:12:57'),(76,'bayonetta','2022-01-23 15:22:07'),(77,'luigi\'s mansion','2022-01-23 15:22:27'),(82,'luigi\'s%20mansion','2022-01-23 15:28:26'),(84,'assassin\'s creed','2022-01-23 15:29:23');
/*!40000 ALTER TABLE `searches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videoresults`
--

DROP TABLE IF EXISTS `videoresults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `videoresults` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `search_id` int(10) unsigned DEFAULT NULL,
  `video_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `search_id` (`search_id`) USING BTREE,
  CONSTRAINT `video_search_id_fk_constraint` FOREIGN KEY (`search_id`) REFERENCES `searches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videoresults`
--

LOCK TABLES `videoresults` WRITE;
/*!40000 ALTER TABLE `videoresults` DISABLE KEYS */;
INSERT INTO `videoresults` VALUES (8,74,'sIbb2RVwQug'),(10,76,'62ZoFjBD6u8'),(12,82,'OnaOXte1GJg');
/*!40000 ALTER TABLE `videoresults` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wikiresults`
--

DROP TABLE IF EXISTS `wikiresults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wikiresults` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `search_id` int(10) unsigned DEFAULT NULL,
  `link` varchar(100) DEFAULT NULL,
  `img` varchar(100) DEFAULT NULL,
  `text_info` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wikiresults_ibfk_1` (`search_id`),
  CONSTRAINT `wiki_search_id_fk_constraint` FOREIGN KEY (`search_id`) REFERENCES `searches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wikiresults`
--

LOCK TABLES `wikiresults` WRITE;
/*!40000 ALTER TABLE `wikiresults` DISABLE KEYS */;
INSERT INTO `wikiresults` VALUES (9,73,'https://en.wikipedia.org//wiki/Red_Dead_Redemption_2','36b8c3f29502cc54c5bb35c49a01fbb0f5a818eadb43593a29143aeef90486e4.png','[{\"name\":\"Developer(s)\",\"value\":\"Rockstar Studios\"},{\"name\":\"Publisher(s)\",\"value\":\"Rockstar Games\"},{\"name\":\"Platform(s)\",\"value\":\"PlayStation 4\"},{\"name\":\"Genre(s)\",\"value\":\"Action-adventure\"},{\"name\":\"Metacritic\",\"value\":\"97/100\"},{\"name\":\"Metacritic\",\"value\":\"93/100\"}]'),(10,74,'https://en.wikipedia.org//wiki/Deathloop','6dcede317a2568e4cdb279cd918eb4ba87c9cc672410933b2170f5f8fdf1a140.png','[{\"name\":\"Developer(s)\",\"value\":\"Arkane Studios\"},{\"name\":\"Publisher(s)\",\"value\":\"Bethesda Softworks\"},{\"name\":\"Platform(s)\",\"value\":\"Microsoft Windows\"},{\"name\":\"Genre(s)\",\"value\":\"First-person shooter\"},{\"name\":\"Metacritic\",\"value\":\"(PC) 86/100(PS5) 88/100\"}]'),(11,75,'https://en.wikipedia.org//wiki/Spyro_the_Dragon','9dcdd765b8c93db098c77a53f7697d2ac5021c953f23500d9f4c8b3c1bd8ffdc.png','[{\"name\":\"Developer(s)\",\"value\":\"Insomniac Games\"},{\"name\":\"Publisher(s)\",\"value\":\"Sony Computer Entertainment\"},{\"name\":\"Platform(s)\",\"value\":\"PlayStation\"},{\"name\":\"Genre(s)\",\"value\":\"Platform\"},{\"name\":\"GameRankings\",\"value\":\"85%\"}]'),(12,76,'https://en.wikipedia.org//wiki/Bayonetta_(video_game)','796b17c2a516fa76e5727bd61012edf37aa41167b656d9b5843c349c12786767.png','[{\"name\":\"Developer(s)\",\"value\":\"PlatinumGames\"},{\"name\":\"Publisher(s)\",\"value\":\"Sega\"},{\"name\":\"Platform(s)\",\"value\":\"PlayStation 3\"},{\"name\":\"Genre(s)\",\"value\":\"Action-adventure\"},{\"name\":\"Metacritic\",\"value\":\"PS3: 87/100X360: 90/100WIIU: 86/100PC: 90/100NS: 84/100PS4: 81/100\"}]'),(13,77,'https://en.wikipedia.org//wiki/Luigi%27s_Mansion','c753b6424b0304bee78fe5c62f71330542bd889e9661c1fe005e7b77be8528b8.png','[{\"name\":\"Developer(s)\",\"value\":\"Nintendo EAD\"},{\"name\":\"Publisher(s)\",\"value\":\"Nintendo\"},{\"name\":\"Platform(s)\",\"value\":\"GameCube\"},{\"name\":\"Genre(s)\",\"value\":\"Action-adventure\"},{\"name\":\"Metacritic\",\"value\":\"74/100\"}]'),(14,82,'https://en.wikipedia.org//wiki/Luigi%27s_Mansion','c753b6424b0304bee78fe5c62f71330542bd889e9661c1fe005e7b77be8528b8.png','[{\"name\":\"Developer(s)\",\"value\":\"Nintendo EAD\"},{\"name\":\"Publisher(s)\",\"value\":\"Nintendo\"},{\"name\":\"Platform(s)\",\"value\":\"GameCube\"},{\"name\":\"Genre(s)\",\"value\":\"Action-adventure\"},{\"name\":\"Metacritic\",\"value\":\"74/100\"}]'),(15,84,'https://en.wikipedia.org//wiki/Assassin%27s_Creed_(video_game)','96481f7d2515705eb8868fa5792cd04ccd593a3feddc2af341d8c235b90d4e42.png','[{\"name\":\"Developer(s)\",\"value\":\"Ubisoft Montreal\"},{\"name\":\"Publisher(s)\",\"value\":\"Ubisoft\"},{\"name\":\"Platform(s)\",\"value\":\"PlayStation 3\"},{\"name\":\"Genre(s)\",\"value\":\"Action-adventure\"},{\"name\":\"Metacritic\",\"value\":\"(PS3) 81/100(X360) 81/100(PC) 79/100\"}]');
/*!40000 ALTER TABLE `wikiresults` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gamesearch'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-01-25 23:05:35

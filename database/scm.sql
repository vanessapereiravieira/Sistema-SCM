-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sistema_scm
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `chamados`
--

DROP TABLE IF EXISTS `chamados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chamados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `descricao` text NOT NULL,
  `local` varchar(50) NOT NULL,
  `nome_sala` varchar(100) NOT NULL,
  `urgencia` enum('Baixa','Média','Alta') NOT NULL DEFAULT 'Baixa',
  `status` enum('Aberto','Em andamento','Concluído','Cancelado','Excluído') NOT NULL DEFAULT 'Aberto',
  `usuario_id` int NOT NULL,
  `setor_destino` varchar(50) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_usuario` (`usuario_id`),
  CONSTRAINT `fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamados`
--

LOCK TABLES `chamados` WRITE;
/*!40000 ALTER TABLE `chamados` DISABLE KEYS */;
INSERT INTO `chamados` VALUES (2,'Projetor queimado - Sala 11','NEP','Projetor da sala 11 não está ligando','Sala','Sala 11','Média','Em andamento',1,'NEP','2026-06-05 05:36:22'),(4,'Ar condicionado - Sala 13','NEP','Ar condicionado da sala 13 não está gelando','Sala','Sala 13','Média','Aberto',1,'NEP','2026-06-05 05:36:22'),(5,'Tomada com defeito - Sala 14','NEP','Tomadas da sala 14 não estão funcionando','Sala','Sala 14','Baixa','Aberto',1,'NEP','2026-06-05 05:36:22'),(6,'Monitor queimado - Sala 15','TI','Monitor da sala 15 não está ligando','Sala','Sala 15','Alta','Aberto',1,'TI','2026-06-05 05:36:22'),(7,'Computadores lentos - Lab Informática','TI','Computadores do laboratório de informática estão lentos','Laboratório','Laboratório de Informática','Alta','Concluído',2,'TI','2026-06-05 05:36:36'),(8,'Produtos químicos - Lab Química','NEP','Falta produtos químicos no laboratório de química','Laboratório','Laboratório de Química','Média','Cancelado',2,'NEP','2026-06-05 05:36:36'),(9,'Impressora 3D - Lab Maker','TI','Impressora 3D do laboratório maker com defeito','Laboratório','Laboratório Maker','Alta','Aberto',2,'TI','2026-06-05 05:36:36'),(10,'Equipamentos - Lab Logística','NEP','Equipamentos do laboratório de logística com defeito','Laboratório','Laboratório de Logística','Média','Aberto',2,'NEP','2026-06-05 05:36:36'),(11,'Osciloscópio - Lab Eletrotécnica','TI','Osciloscópio do laboratório de eletrotécnica quebrado','Laboratório','Laboratório de Eletrotécnica','Alta','Aberto',2,'TI','2026-06-05 05:36:36'),(12,'teste','NEP','jnmm m','Sala','Sala 13','Baixa','Cancelado',1,'NEP','2026-06-05 06:17:54'),(13,'teste 31','TI','kkk','Sala','Sala 12','Baixa','Em andamento',1,'TI','2026-06-05 06:24:37'),(15,'Manutenção em maquina deee á laser','NEP','jjjlvanessa','Laboratorio','Laboratório de Logística','Média','Aberto',1,'NEP','2026-06-05 07:00:03'),(16,'Manutenção em maquina laser','TI','Máquina travou.','Laboratorio','Laboratório Maker','Média','Aberto',2,'TI','2026-06-06 23:23:53'),(17,'teste','TI','kkkkk','Sala','Sala 12','Baixa','Aberto',2,'TI','2026-06-06 23:26:42'),(18,'problema no monitor','TI','monitor não liga','Laboratorio','Laboratório Maker','Média','Aberto',2,'TI','2026-06-06 23:30:39'),(19,'falha na rede','TI','internet caiu','Sala','Sala 13','Alta','Aberto',1,'TI','2026-06-07 01:12:47'),(20,'computador não retorna vídeo','TI','Computador não exibi nada','Sala','Sala 12','Média','Aberto',1,'TI','2026-06-07 01:36:32'),(21,'projetor não retorna vídeo','TI','Projetor não está exibindo nada','Laboratorio','Laboratório Maker','Média','Cancelado',2,'TI','2026-06-07 01:49:49');
/*!40000 ALTER TABLE `chamados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manutencoes_preventivas`
--

DROP TABLE IF EXISTS `manutencoes_preventivas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manutencoes_preventivas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipamento` varchar(255) NOT NULL,
  `responsavel` varchar(255) NOT NULL,
  `local` varchar(50) NOT NULL,
  `nome_sala` varchar(255) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `periodicidade` varchar(50) NOT NULL,
  `data_ultima` date NOT NULL,
  `data_proxima` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `urgencia` varchar(20) DEFAULT 'Baixa',
  `observacoes` text,
  `imagem` varchar(500) DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `setor_destino` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `manutencoes_preventivas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manutencoes_preventivas`
--

LOCK TABLES `manutencoes_preventivas` WRITE;
/*!40000 ALTER TABLE `manutencoes_preventivas` DISABLE KEYS */;
INSERT INTO `manutencoes_preventivas` VALUES (3,'teste','teste','Laboratório','Laboratório Maker','TI','Mensal','2026-06-07','2026-06-24','Pendente','Baixa','teste','/uploads/manutencoes/manutencao-1780829939372-149856797.gif',1,'TI','2026-06-07 10:58:59','2026-06-07 14:17:17'),(4,'t','t','Sala','Sala 10','TI','Mensal','2026-06-02','2026-06-17','Aberto','Baixa','t','/uploads/manutencoes/manutencao-1780855934398-871337806.jpg',1,'TI','2026-06-07 12:29:52','2026-06-07 18:12:14'),(5,'tttttttttttt','t','Sala','Sala 15','TI','Mensal','2026-06-16','2026-06-18','Aberto','Baixa','taaa uuu','/uploads/manutencoes/manutencao-1780855451132-343457799.png',1,'TI','2026-06-07 12:33:55','2026-06-07 18:04:11'),(6,'t','t','Sala','Sala 15','TI','Mensal','2026-06-17','2026-06-27','Aberto','Baixa','ttt','/uploads/manutencoes/manutencao-1780857594086-836799117.jpg',1,'TI','2026-06-07 12:43:59','2026-06-07 18:39:54'),(10,'m','j','Sala','Sala 14','TI','Mensal','2026-06-03','2026-06-09','Aberto','Baixa','et','/uploads/manutencoes/manutencao-1780855613863-722036592.png',1,'TI','2026-06-07 12:59:58','2026-06-07 18:06:53'),(13,'ttttttt','ukkkiiiiiiiiiiiiiiiiiiiiiiiiiiiii','Sala','Sala 10','TI','Mensal','2026-06-10','2026-06-21','Aberto','Baixa','gggsbxnxzbcnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxzbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','/uploads/manutencoes/manutencao-1780857615724-809613721.jpg',1,'TI','2026-06-07 16:56:16','2026-06-07 21:52:11'),(15,'teste','teste','Sala','Sala 12','NEP','Mensal','2026-06-07','2026-06-10','Aberto','Baixa','teste','/uploads/manutencoes/manutencao-1780865120886-710435620.jpg',1,'NEP','2026-06-07 20:45:20','2026-06-07 20:45:20'),(16,'teste','teste','Laboratório','Laboratório de Logística','TI','semanal','2026-06-02','2026-06-06','Aberto','Baixa','teste','/uploads/manutencoes/manutencao-1780868409139-667277162.jpg',1,'TI','2026-06-07 21:40:09','2026-06-07 22:04:02'),(17,'testeeee','teste','Sala','Sala 12','TI','mensal','2026-06-25','2026-06-30','Cancelado','Média','teste','/uploads/manutencoes/manutencao-1780868532826-614700140.jpg',1,'TI','2026-06-07 21:42:12','2026-06-09 21:07:19'),(18,'teste','teste','Sala','Sala 10','TI','Semanal','2026-06-07','2026-06-09','Aberto','Baixa','teste','/uploads/manutencoes/manutencao-1780869893959-179711830.jpg',1,'TI','2026-06-07 22:04:53','2026-06-07 22:04:53'),(19,'teste','teste','Sala','Sala 10','TI','Semanal','2026-06-07','2026-06-08','Aberto','Baixa','teste','/uploads/manutencoes/manutencao-1780870098788-120647237.jpg',1,'TI','2026-06-07 22:08:18','2026-06-07 22:08:18'),(20,'teste','teste','Sala','Sala 11','TI','Semanal','2026-06-07','2026-06-08','Aberto','Baixa','teste','/uploads/manutencoes/manutencao-1780870307525-845437754.jpg',1,'TI','2026-06-07 22:11:47','2026-06-07 22:11:47'),(21,'teste','teste','Sala','Sala 12','TI','Mensal','2026-06-07','2026-06-25','Aberto','Baixa','ttt','/uploads/manutencoes/manutencao-1780870370653-543927944.jpg',1,'TI','2026-06-07 22:12:50','2026-06-07 22:12:50'),(22,'teste','teste','Sala','Sala 11','TI','Mensal','2026-06-07','2026-06-08','Aberto','Baixa','teste','/uploads/manutencoes/manutencao-1780870476566-237010650.jpg',1,'TI','2026-06-07 22:14:36','2026-06-07 22:14:36'),(23,'teste','teste','Sala','Sala 11','TI','semanal','2026-06-08','2026-06-10','Aberto','Baixa','ll','/uploads/manutencoes/manutencao-1780870614074-984638607.jpg',1,'TI','2026-06-07 22:16:54','2026-06-07 22:17:48'),(24,'teste','teste','Sala','Sala 10','TI','Mensal','2026-06-08','2026-06-10','Em andamento','Baixa','jtw','/uploads/manutencoes/manutencao-1780870796098-119572743.jpg',1,'TI','2026-06-07 22:19:56','2026-06-09 20:16:50');
/*!40000 ALTER TABLE `manutencoes_preventivas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `setor` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Vanessa','contato.vanessapereira06@gmail.com','Nessa@06','user','TI'),(2,'Iedro','iedro.santos@ba.estudante.senai.br','iedro@01','admin','NEP');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10  3:02:19

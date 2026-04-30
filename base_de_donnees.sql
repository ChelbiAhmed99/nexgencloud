-- Base de données pour le projet NexGen Cloud
-- Compatible avec XAMPP (MySQL/MariaDB)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Création de la base de données
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `hosting_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hosting_db`;

-- --------------------------------------------------------
-- Table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `googleId` varchar(255) DEFAULT NULL,
  `githubId` varchar(255) DEFAULT NULL,
  `isTwoFactorEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `twoFactorSecret` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `apps`
-- --------------------------------------------------------
CREATE TABLE `apps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dockerImage` varchar(255) NOT NULL,
  `containerName` varchar(255) NOT NULL,
  `status` enum('creating','running','stopped','error') NOT NULL DEFAULT 'creating',
  `customDomain` varchar(255) DEFAULT NULL,
  `ownerId` int(11) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_containerName` (`containerName`),
  KEY `FK_apps_owner` (`ownerId`),
  CONSTRAINT `FK_apps_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `domains`
-- --------------------------------------------------------
CREATE TABLE `domains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `appId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_url` (`url`),
  UNIQUE KEY `REL_domains_app` (`appId`),
  CONSTRAINT `FK_domains_app` FOREIGN KEY (`appId`) REFERENCES `apps` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `quotas`
-- --------------------------------------------------------
CREATE TABLE `quotas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `storageLimit` int(11) NOT NULL DEFAULT 1024,
  `instanceLimit` int(11) NOT NULL DEFAULT 5,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_quotas_user` (`userId`),
  CONSTRAINT `FK_quotas_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `statistics`
-- --------------------------------------------------------
CREATE TABLE `statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cpuUsage` float NOT NULL,
  `ramUsage` float NOT NULL,
  `bandwidth` float NOT NULL,
  `timestamp` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `appId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_statistics_app` (`appId`),
  CONSTRAINT `FK_statistics_app` FOREIGN KEY (`appId`) REFERENCES `apps` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Insertion de données initiales (Admin par défaut)
-- Login: admin@gmail.com / Password: admin123
-- --------------------------------------------------------
INSERT INTO `users` (`email`, `password`, `firstName`, `lastName`, `role`, `isTwoFactorEnabled`) VALUES
('admin@gmail.com', '$2b$10$uw7vw4/B17BulOjXilGNrux.3kHFAO0t5od5CD9C7RNBfRnVugOp2', 'Administrateur', 'Système', 'admin', 0);

-- Création d'un quota par défaut pour l'admin
INSERT INTO `quotas` (`storageLimit`, `instanceLimit`, `userId`) VALUES (5120, 10, 1);

COMMIT;

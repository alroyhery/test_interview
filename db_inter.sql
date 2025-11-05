/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 8.0.41 : Database - inter
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`inter` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `inter`;

/*Table structure for table `banners` */

DROP TABLE IF EXISTS `banners`;

CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `banner_name` varchar(255) DEFAULT NULL,
  `banner_image` varchar(500) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `banners` */

insert  into `banners`(`id`,`banner_name`,`banner_image`,`description`) values 
(1,'Banner 1','https://nutech-integrasi.app/dummy.jpg','Lorem Ipsum Dolor sit amet'),
(2,'Banner 2','https://nutech-integrasi.app/dummy.jpg','Lorem Ipsum Dolor sit amet'),
(3,'Banner 3','https://nutech-integrasi.app/dummy.jpg','Lorem Ipsum Dolor sit amet'),
(4,'Banner 4','https://nutech-integrasi.app/dummy.jpg','Lorem Ipsum Dolor sit amet'),
(5,'Banner 5','https://nutech-integrasi.app/dummy.jpg','Lorem Ipsum Dolor sit amet'),
(6,'Banner 6','https://nutech-integrasi.app/dummy.jpg','Lorem Ipsum Dolor sit amet');

/*Table structure for table `services` */

DROP TABLE IF EXISTS `services`;

CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_code` varchar(50) DEFAULT NULL,
  `service_name` varchar(100) DEFAULT NULL,
  `service_icon` varchar(255) DEFAULT NULL,
  `service_tariff` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `services` */

insert  into `services`(`id`,`service_code`,`service_name`,`service_icon`,`service_tariff`) values 
(1,'PAJAK','Pajak PBB','https://nutech-integrasi.app/dummy.jpg',40000),
(2,'PLN','Listrik','https://nutech-integrasi.app/dummy.jpg',10000),
(3,'PDAM','PDAM Berlangganan','https://nutech-integrasi.app/dummy.jpg',40000),
(4,'PULSA','Pulsa','https://nutech-integrasi.app/dummy.jpg',40000),
(5,'PGN','PGN Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000),
(6,'MUSIK','Musik Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000),
(7,'TV','TV Berlangganan','https://nutech-integrasi.app/dummy.jpg',50000),
(8,'PAKET_DATA','Paket data','https://nutech-integrasi.app/dummy.jpg',50000),
(9,'VOUCHER_GAME','Voucher Game','https://nutech-integrasi.app/dummy.jpg',100000),
(10,'VOUCHER_MAKANAN','Voucher Makanan','https://nutech-integrasi.app/dummy.jpg',100000),
(11,'QURBAN','Qurban','https://nutech-integrasi.app/dummy.jpg',200000),
(12,'ZAKAT','Zakat','https://nutech-integrasi.app/dummy.jpg',300000);

/*Table structure for table `topups` */

DROP TABLE IF EXISTS `topups`;

CREATE TABLE `topups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topup_id` varchar(100) NOT NULL,
  `id_regis` int NOT NULL,
  `amount` decimal(20,2) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topup_regis` (`id_regis`),
  CONSTRAINT `fk_topup_user` FOREIGN KEY (`id_regis`) REFERENCES `users` (`id_regis`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `topups` */

insert  into `topups`(`id`,`topup_id`,`id_regis`,`amount`,`reference`,`created_at`) values 
(1,'ced8ef4f-a73e-4045-a003-63e898560b4d',4,1000000.00,NULL,'2025-11-04 08:09:36');

/*Table structure for table `transactions` */

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `trx_id` varchar(100) NOT NULL,
  `id_regis` int NOT NULL,
  `service_code` varchar(50) DEFAULT NULL,
  `transaction_type` varchar(20) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`trx_id`),
  KEY `id_regis` (`id_regis`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`id_regis`) REFERENCES `users` (`id_regis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `transactions` */

insert  into `transactions`(`trx_id`,`id_regis`,`service_code`,`transaction_type`,`amount`,`status`,`created_at`,`invoice_number`) values 
('88f71faa-de7e-432e-b508-539bd7925f7d',4,'PAJAK','PAYMENT',40000.00,'success','2025-11-04 10:58:57','INV20251104035856795-397'),
('c0a1750f-e25b-463d-bd6d-0b0a26bf34d3',4,'PAJAK','PAYMENT',40000.00,'success','2025-11-04 08:40:46','INV20251104014046444-172'),
('c3d69e09-575e-4366-9c41-06cfc20e815e',4,'PAJAK','PAYMENT',40000.00,'success','2025-11-04 08:34:59','INV20251104013458817-400');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id_regis` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_image` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_regis`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

insert  into `users`(`id_regis`,`name`,`email`,`password`,`profile_image`,`created_at`,`updated_at`) values 
(1,'Alroy','alroy@example.com','$2b$10$.lfLlnb4xfnA0YbDVFhX.e2PYIg/cYLjGpvek.z0dSf8PJ.Fcq7Vy',NULL,'2025-11-03 21:42:08',NULL),
(2,'Alroy','bdi','$2b$10$PkoHoZD0Q4WS0AdHGnlkqOojJjeT9mDCBDY.ws8B/eNcM6r42YQ.G',NULL,'2025-11-03 21:43:00',NULL),
(3,'Alroy','hubaaaaa@gmail.com','$2b$10$fHfcYSbfKsdZTt9Qa3TOaewwFvEMXvBUEf5Q2rqshzh1ZbgzMREhm',NULL,'2025-11-03 21:46:17',NULL),
(4,'User Edited Nutech Edited','alroy@gmail.com','$2b$10$9DWlxjxWjeftqOnUdfI4se25cc1AQ3i/cA6suM35/hrAoHGSJA7VS','/uploads/profile/4_profile.png','2025-11-03 21:50:08',NULL);

/*Table structure for table `wallets` */

DROP TABLE IF EXISTS `wallets`;

CREATE TABLE `wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_regis` int NOT NULL,
  `balance` decimal(20,2) NOT NULL DEFAULT '0.00',
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_regis` (`id_regis`),
  CONSTRAINT `fk_wallet_user` FOREIGN KEY (`id_regis`) REFERENCES `users` (`id_regis`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `wallets` */

insert  into `wallets`(`id`,`id_regis`,`balance`,`updated_at`) values 
(1,1,0.00,'2025-11-03 21:42:08'),
(2,2,0.00,'2025-11-03 21:43:00'),
(3,3,0.00,'2025-11-03 21:46:17'),
(4,4,4885000.00,'2025-11-04 10:58:57');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

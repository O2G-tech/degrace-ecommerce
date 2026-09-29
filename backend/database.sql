-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: jumia_clone
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

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
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `address` text NOT NULL,
  `state` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,2,'2026-09-28 15:06:22');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,2,4,'2026-09-28 15:06:22'),(2,1,6,6,'2026-09-28 16:28:32'),(3,1,3,1,'2026-09-29 14:01:58');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,NULL,'Bespoke Suiting & Silks','bespoke-suiting','https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(5,NULL,'Designer Footwear','designer-footwear','https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(6,NULL,'Fine Statement Jewelry','fine-jewelry','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(7,NULL,'Soft shoes','soft-shoes',NULL,'active','2026-09-29 03:06:21'),(8,NULL,'bag man','bag-man',NULL,'active','2026-09-29 11:30:00'),(9,NULL,'Laptop','laptop',NULL,'active','2026-09-29 13:23:11');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Sovereign Gold Embroidered Silk Velvet Gown',345000.00,1,345000.00,'2026-09-28 16:19:14'),(2,1,2,'Venetian Midnight Double-Breasted Cashmere Blazer',280000.00,2,560000.00,'2026-09-28 16:19:14'),(3,2,3,'Florence Hand-Stitched Florentine Calfskin Tote',195000.00,1,195000.00,'2026-09-28 16:19:14'),(4,3,1,'Sovereign Gold Embroidered Silk Velvet Gown',345000.00,1,345000.00,'2026-09-28 16:19:14'),(5,4,2,'Venetian Midnight Double-Breasted Cashmere Blazer',280000.00,1,280000.00,'2026-09-28 16:19:14'),(6,4,4,'Celestial Chronometer 18K Rose Gold Edition',650000.00,1,650000.00,'2026-09-28 16:19:14');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_number` varchar(100) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `state` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(50) DEFAULT NULL,
  `delivery_method` varchar(100) DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `status` varchar(50) DEFAULT 'Pending',
  `subtotal` decimal(12,2) NOT NULL,
  `delivery_fee` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,'DG-2026-9801','Benjamin','09087055378','bkia2821@gmail.com','14 Victoria Island Boulevard, Penthouse Suite','Lagos State','Lagos','101241','White-Glove VIP Courier','Paystack Card','Completed','Processing',905000.00,15000.00,920000.00,'2026-09-28 16:19:14'),(2,3,'DG-2026-9802','Lady Catherine Dupont','08098765432','lady.catherine@degrace.com','22 Kensington High Street','FCT','Abuja','900108','Express Diplomatic Dispatch','Paystack Card','Completed','Cancelled',195000.00,15000.00,210000.00,'2026-09-28 16:19:14'),(3,2,'DG-2026-9803','Benjamin','09087055378','bkia2821@gmail.com','8 Avenue Montaigne, Atelier 4','Lagos State','Lagos','100001','Private Salon Courier','Bank Transfer','Completed','Delivered',345000.00,15000.00,360000.00,'2026-09-28 16:19:14'),(4,3,'DG-2026-9804','Lord Sterling Brooks','08012345678','customer@degrace.com','55 Banana Island Road, Villa Aurelia','Lagos State','Ikoyi, Lagos','101233','White-Glove VIP Courier','Cash on Delivery','Pending','Processing',930000.00,15000.00,945000.00,'2026-09-28 16:19:14');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `stock` int(11) DEFAULT 15,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,NULL,'Sovereign Gold Embroidered Silk Velvet Gown','sovereign-gold-embroidered-gown','An architectural masterpiece in heavy Italian silk velvet, hand-embroidered with 24K gold metallic thread along the bodice and train. Perfect for gala nights, private balls, and red carpet appearances.',345000.00,8,'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(2,2,'Venetian Midnight Double-Breasted Cashmere Blazer','venetian-midnight-cashmere-blazer','Hand-tailored from Grade-A Mongolian cashmere with pure silk grosgrain peak lapels. Featuring horn buttons with engraved DE-GRACE insignias and custom cupro lining.',280000.00,12,'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(3,NULL,'Florence Hand-Stitched Florentine Calfskin Tote','florence-hand-stitched-calfskin-tote','Meticulously crafted by third-generation Tuscan leather artisans. Rich full-grain calfskin, solid brushed brass hardware, and dual interior compartments lined in suede.',195000.00,15,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(4,NULL,'Celestial Chronometer 18K Rose Gold Edition','celestial-chronometer-rose-gold','Swiss automatic movement with 72-hour power reserve. Case crafted in solid 18K rose gold with sapphire crystal face and hand-stitched alligator strap.',650000.00,5,'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(5,6,'Starlight Diamond Cascade Chandelier Earrings','starlight-diamond-cascade-earrings','Featuring 4.8 carats of VVS lab-grown brilliant-cut diamonds handset in platinum prongs. Graceful articulated movement that captures ambient ballroom light.',420000.00,7,'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(6,5,'Monogrammed Milanese Suede Dress Loafers','monogrammed-milanese-suede-loafers','Italian suede loafers with Blake-stitched leather soles and memory-foam cushioned footbeds. Adorned with the subtle DE-GRACE gold horsebit ornament.',175000.00,20,'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(7,NULL,'Aura Pleated Metallic Lam├® Evening Cape','aura-pleated-metallic-lame-cape','Spectacular sunray-pleated metallic lam├® fabric that floats with effortless grace. Finished with a high neck velvet ribbon tie.',310000.00,10,'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(8,2,'Savile Row Silk Peak-Lapel Smoking Tuxedo','savile-row-silk-smoking-tuxedo','Timeless black-tie elegance. Tailored from super 150s worsted wool and mulberry silk facing with matching pleated formal trousers.',490000.00,9,'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80','active','2026-09-28 14:52:55'),(9,2,'backy bags','backy-bags-1790649816','',2000.00,10,NULL,'active','2026-09-29 02:43:36'),(10,2,'backy bags','backy-bags-1790649838','',2000.00,10,NULL,'active','2026-09-29 02:43:58'),(11,2,'Bucky bag','bucky-bag-1790650685','',2000.00,10,NULL,'active','2026-09-29 02:58:05');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'approved',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `admin_reply` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,1,5,'The craftsmanship of this piece is truly extraordinary. The fabric drape and bespoke detailing exceeded all my expectations for couture eveningwear.','approved','2026-09-28 16:20:34','Thank you for your gracious patronage. The atelier is honored to craft timeless elegance for your wardrobe.'),(2,3,2,5,'Arrived in immaculate white-glove packaging. Authentic horology masterpiece with all certificates in order.','approved','2026-09-28 16:20:34',NULL),(3,2,3,4,'Beautiful Tuscan leather finish. Luxurious feel and aroma, fast delivery to Abuja.','pending','2026-09-28 16:20:34',NULL);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'DE-GRACE Chief Curator','admin@degrace.com','+2348012345678','$2y$10$LETz.Ta0Y.A7zJ6YIWyUc.vNl9JOtYy.u8pSOHS6Cp5t7GukwyT1i','admin','active','2026-09-28 14:52:55'),(2,'Benjamin','bkia2821@gmail.com','09087055378','$2y$10$huFWjt3bN3Mod0Os6hwOFOVkkJo7eWHD8z9c3mypRkdvAp49qwZwe','customer','inactive','2026-09-28 15:04:57'),(3,'Test Customer','customer@degrace.com','08012345678','$2y$12$yHdo1JLCTPrfPrHP0S.5a.13HmwXv2TxM82Qeph1LNJSrh3hP4S9y','customer','active','2026-09-28 15:38:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-29 16:50:09

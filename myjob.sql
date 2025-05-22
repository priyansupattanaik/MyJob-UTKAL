-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2025 at 07:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myjob`
--

-- --------------------------------------------------------

--
-- Table structure for table `designation`
--

CREATE TABLE `designation` (
  `degId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `degName` varchar(255) NOT NULL,
  `sectorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdBy` int(11) NOT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `educationaldetails`
--

CREATE TABLE `educationaldetails` (
  `id` int(11) NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `degreeType` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `collegeName` varchar(255) DEFAULT NULL,
  `university` varchar(255) DEFAULT NULL,
  `graduationYear` int(11) DEFAULT NULL,
  `passingPercentage` float DEFAULT 0,
  `passingCGPA` float DEFAULT 0,
  `achievements` varchar(255) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `educationaldetails`
--

INSERT INTO `educationaldetails` (`id`, `userId`, `degreeType`, `specialization`, `collegeName`, `university`, `graduationYear`, `passingPercentage`, `passingCGPA`, `achievements`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`, `status`, `deletedAt`) VALUES
(6, 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', '2025-05-13 12:00:50', 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', '2025-05-13 12:00:50', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `eventId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `compId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `degName` varchar(255) NOT NULL,
  `strength` int(11) NOT NULL,
  `startingDate` datetime NOT NULL,
  `endingDate` datetime NOT NULL,
  `eventDescription` text NOT NULL,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `jobType` enum('Full-Time','Part-Time','Contract','Internship') NOT NULL,
  `workPlaceType` enum('Onsite','Hybrid','Remote') NOT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--

CREATE TABLE `organization` (
  `compId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `organizationName` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `phoneNo` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `socialMediaLink` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `since` date DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT 'Org',
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization`
--

INSERT INTO `organization` (`compId`, `organizationName`, `password`, `logo`, `address`, `description`, `phoneNo`, `email`, `website`, `socialMediaLink`, `industry`, `since`, `specialization`, `type`, `createdBy`, `updatedBy`, `status`, `createdAt`, `updatedAt`) VALUES
('b4211176-2747-48fb-a5a7-d43905bb1f2b', 'Google', '$2b$10$.iECISOYJexydv66rWaUn.M5E4OWzbASkgqtqI4ktmGR2BeEoyjwa', '1747132953428-organization_logo.png', 'Hydrabad, IN', 'Google, an Alphabet Inc. subsidiary, is a global tech leader in search, cloud, software, hardware, and AI.', '9876543210', 'google@gmail.com', 'https://www.google.com/', 'LinkedIn: https://www.linkedin.com/company/google/', 'Technology, Internet Services, Software, Artificial Intelligence ', '1998-09-04', 'Search Engine, Cloud Computing, Software Development (Android, Google Maps), Hardware (Pixel, Nest), Artificial Intelligence, Online Advertising, Data Analytics', 'Org', NULL, NULL, 1, '2025-05-13 10:42:33', '2025-05-13 10:42:33'),
('e00d3f73-10dd-4f39-92a6-8f06de7f1814', 'Tesla', '$2b$10$gsc1qtWgbsMZHmsuFfe4XusXwK4wR/VRJgSBSQmRD/08eArRbIMwS', '1747133616070-organization_logo.png', '13101 Tesla Road, Austin, TX 78725, USA', 'Tesla, Inc. is a leading electric vehicle and clean energy company focused on sustainable transportation and energy solutions.', '9876543210', 'tesla@gmail.com', 'https://www.tesla.com/', 'LinkedIn: https://www.linkedin.com/company/tesla-motors', 'Automotive, Clean Energy, Artificial Intelligence', '2003-07-01', 'Electric Vehicles (Model S, 3, X, Y, Cybertruck), Autonomous Driving Software, Energy Storage (Powerwall, Megapack), Solar Energy (Solar Roof, Panels), Fast-Charging Infrastructure', 'Org', NULL, NULL, 1, '2025-05-13 10:53:37', '2025-05-13 10:53:37'),
('e7df9381-2a88-478f-9fb9-b1dfd6ab66c3', 'Meta', '$2b$10$.0/9Un0hb/.Xy.ta4uY0x.VMARApeYASTbgHC8MX8iHlNQpAqjwAa', '1747133281385-organization_logo.png', '1 Hacker Way, Menlo Park, CA 94025, USA', 'Meta Platforms, Inc., formerly Facebook, is a global tech company focused on connecting people through social media and immersive technologies.', '9876543210', 'meta@gmail.com', 'https://www.meta.com/', 'LinkedIn: https://www.linkedin.com/company/meta', 'Technology, Social Media, Virtual Reality, Artificial Intelligence', '2004-02-04', 'Social Networking (Facebook, Instagram, WhatsApp, Messenger), Virtual Reality (Oculus), Augmented Reality, Artificial Intelligence, Digital Advertising, Metaverse Development', 'Org', NULL, NULL, 1, '2025-05-13 10:48:01', '2025-05-13 10:48:01'),
('e9971d03-e9d2-4434-9f07-8b0743fc9dd3', 'Microsoft', '$2b$10$r9C9HCM18XYVX0bbDddaWOum9GTuTDpULFAV43whMPkKa.RBURT0.', '1747133503935-organization_logo.png', 'One Microsoft Way, Redmond, WA 98052, USA', 'Microsoft Corporation is a global technology company known for its software, cloud services, and hardware, driving digital transformation across industries.', '9876543210', 'microsoft@gmail.com', 'https://www.microsoft.com/en-in/', 'LinkedIn: https://www.linkedin.com/company/microsoft/', 'Technology, Software, Cloud Computing, Artificial Intelligence ', '1975-04-04', 'Operating Systems (Windows), Productivity Software (Microsoft Office), Cloud Computing (Azure), Gaming (Xbox), Artificial Intelligence, Enterprise Solutions', 'Org', NULL, NULL, 1, '2025-05-13 10:51:44', '2025-05-13 10:51:44');

-- --------------------------------------------------------

--
-- Table structure for table `personaldetails`
--

CREATE TABLE `personaldetails` (
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `middleName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) NOT NULL,
  `coverImage` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `maritalStatus` enum('unmarried','married','other') DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `permanentAddress` text DEFAULT NULL,
  `pin` int(11) DEFAULT NULL,
  `primaryJobPreference` varchar(255) DEFAULT NULL,
  `type` enum('user','admin') DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `createdBy` varchar(255) DEFAULT '0',
  `updatedBy` varchar(255) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personaldetails`
--

INSERT INTO `personaldetails` (`userId`, `email`, `password`, `firstName`, `middleName`, `lastName`, `coverImage`, `dob`, `bio`, `maritalStatus`, `gender`, `phone`, `permanentAddress`, `pin`, `primaryJobPreference`, `type`, `status`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('b9d302c1-00d0-4ea1-a31f-3fe5d6201199', 'priyansu@gmail.com', '$2b$10$Q6b7pUvenhlCyP5RHmPfGOyM.dEMlOfSaZMfOXkul70Vognjdnpua', 'Priyansu', '', 'Pattanaik', NULL, '2004-05-14', '', 'unmarried', 'male', '9876543210', 'Bhubaneswar', 751015, 'SDE', 'user', 1, 'priyansu@gmail.com', 'priyansu@gmail.com', '2025-05-13 12:00:50', '2025-05-13 12:00:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `postedjob`
--

CREATE TABLE `postedjob` (
  `jobId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `compId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `degName` varchar(255) NOT NULL,
  `secName` varchar(255) NOT NULL,
  `jobLocation` varchar(255) NOT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`skills`)),
  `jobDescription` text NOT NULL,
  `yearsOfExperience` int(11) NOT NULL,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `jobType` enum('Full-Time','Part-Time','Contract','Internship') NOT NULL,
  `workPlaceType` enum('Onsite','Hybrid','Remote') NOT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `postedjob`
--

INSERT INTO `postedjob` (`jobId`, `compId`, `degName`, `secName`, `jobLocation`, `skills`, `jobDescription`, `yearsOfExperience`, `requirements`, `jobType`, `workPlaceType`, `createdBy`, `updatedBy`, `status`, `createdAt`, `updatedAt`) VALUES
('1fa28152-8056-41af-a935-09b9091dd28b', 'e00d3f73-10dd-4f39-92a6-8f06de7f1814', 'Automotive Engineer', 'Engineering', 'San Francisco, USA', '[\"Electrical Circuits\",\"Power Systems\",\"Robotics\",\"Control Systems\",\"Aerospace Engineering\",\"Renewable Energy\"]', 'Design and optimize electrical and robotic systems for Tesla’s electric vehicles and autonomous driving technology to advance sustainable energy.', 2, '[]', 'Full-Time', 'Onsite', NULL, NULL, 1, '2025-05-13 11:08:15', '2025-05-13 11:08:31'),
('8cb52475-5fca-4178-8fb1-286f3618a0bf', 'b4211176-2747-48fb-a5a7-d43905bb1f2b', 'Machine Learning Engineer', 'IT', 'Remote', '[\"Data Science\"]', 'As a Machine Learning Engineer at Google, you will design and deploy advanced machine learning models to enhance Google’s products, leveraging data science to drive innovations in search, AI, and cloud solutions.', 8, '[]', 'Full-Time', 'Onsite', NULL, NULL, 1, '2025-05-13 11:58:29', '2025-05-13 11:58:29'),
('a02c63eb-0892-477d-b27a-a30094ad3ae7', 'e9971d03-e9d2-4434-9f07-8b0743fc9dd3', 'Full Stack Developer', 'IT', 'London, UK', '[\"React.js\",\"Node.js\",\"Express.js\",\"MongoDB\",\"MySQL\",\"TypeScript\",\"Next.js\",\"Redux\",\"React Native\",\"Firebase\",\"GraphQL\",\"Docker\",\"AWS\",\"Kubernetes\",\"Python\",\"Django\",\"Flask\",\"Java\",\"Spring Boot\",\".NET\",\"Angular\",\"Vue.js\",\"C#\"]', 'As a Full Stack Developer Intern at Microsoft, you will develop and enhance web applications using React.js, Node.js, and Express.js, integrating MongoDB and MySQL databases to support innovative cloud-based solutions.', 1, '[]', 'Internship', 'Remote', NULL, NULL, 1, '2025-05-13 11:56:22', '2025-05-13 11:56:22'),
('dc21b907-3ffe-4b64-a320-8617350cddf4', 'e7df9381-2a88-478f-9fb9-b1dfd6ab66c3', 'Software Developer', 'IT', 'New York, USA', '[\"MongoDB\",\"Django\",\"Python\",\"Kubernetes\",\"AWS\",\"Docker\",\"GraphQL\",\"Firebase\",\"React Native\",\"Redux\",\"Next.js\",\"TypeScript\"]', 'As a Software Developer at Meta, you will build and optimize scalable backend systems to enhance Meta’s social platforms and metaverse technologies, leveraging Python, Django, and AWS to drive seamless user experiences.', 2, '[]', 'Contract', 'Hybrid', NULL, NULL, 1, '2025-05-13 11:54:07', '2025-05-13 11:54:07');

-- --------------------------------------------------------

--
-- Table structure for table `professionaldetails`
--

CREATE TABLE `professionaldetails` (
  `id` int(11) NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `jobRole` varchar(255) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `experience` float DEFAULT 0,
  `ctc` float DEFAULT 0,
  `skill` varchar(255) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `professionaldetails`
--

INSERT INTO `professionaldetails` (`id`, `userId`, `jobRole`, `companyName`, `experience`, `ctc`, `skill`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`, `status`, `deletedAt`) VALUES
(4, 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', NULL, NULL, 0, 0, NULL, 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', '2025-05-13 12:00:50', 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', '2025-05-13 12:00:50', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `requestapplications`
--

CREATE TABLE `requestapplications` (
  `id` int(11) NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `compId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `jobId` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `type` enum('job','campus') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requestapplications`
--

INSERT INTO `requestapplications` (`id`, `userId`, `compId`, `jobId`, `description`, `resume`, `createdBy`, `updatedBy`, `status`, `type`, `createdAt`, `updatedAt`) VALUES
(3, 'b9d302c1-00d0-4ea1-a31f-3fe5d6201199', 'e00d3f73-10dd-4f39-92a6-8f06de7f1814', '1fa28152-8056-41af-a935-09b9091dd28b', 'Gh', 'uploads\\1747138891617-924756146-ASSESSMENT GUIDELINES OF B.TECH.pdf', 'user', NULL, 1, 'job', '2025-05-13 12:21:31', '2025-05-13 12:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `savedjob`
--

CREATE TABLE `savedjob` (
  `slNo` int(11) NOT NULL,
  `jobId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdBy` int(11) NOT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sector`
--

CREATE TABLE `sector` (
  `sectorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdBy` int(11) NOT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skill`
--

CREATE TABLE `skill` (
  `skillId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `skillName` varchar(255) NOT NULL,
  `sectorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdBy` int(11) NOT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `designation`
--
ALTER TABLE `designation`
  ADD PRIMARY KEY (`degId`),
  ADD KEY `sectorId` (`sectorId`);

--
-- Indexes for table `educationaldetails`
--
ALTER TABLE `educationaldetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`eventId`),
  ADD KEY `compId` (`compId`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
  ADD PRIMARY KEY (`compId`);

--
-- Indexes for table `personaldetails`
--
ALTER TABLE `personaldetails`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `postedjob`
--
ALTER TABLE `postedjob`
  ADD PRIMARY KEY (`jobId`),
  ADD KEY `compId` (`compId`);

--
-- Indexes for table `professionaldetails`
--
ALTER TABLE `professionaldetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `requestapplications`
--
ALTER TABLE `requestapplications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `savedjob`
--
ALTER TABLE `savedjob`
  ADD PRIMARY KEY (`slNo`),
  ADD KEY `jobId` (`jobId`);

--
-- Indexes for table `sector`
--
ALTER TABLE `sector`
  ADD PRIMARY KEY (`sectorId`);

--
-- Indexes for table `skill`
--
ALTER TABLE `skill`
  ADD PRIMARY KEY (`skillId`),
  ADD KEY `sectorId` (`sectorId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `educationaldetails`
--
ALTER TABLE `educationaldetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `professionaldetails`
--
ALTER TABLE `professionaldetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `requestapplications`
--
ALTER TABLE `requestapplications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `savedjob`
--
ALTER TABLE `savedjob`
  MODIFY `slNo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `designation`
--
ALTER TABLE `designation`
  ADD CONSTRAINT `designation_ibfk_1` FOREIGN KEY (`sectorId`) REFERENCES `sector` (`sectorId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `educationaldetails`
--
ALTER TABLE `educationaldetails`
  ADD CONSTRAINT `educationaldetails_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `educationaldetails_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `educationaldetails_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `educationaldetails_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`compId`) REFERENCES `organization` (`compId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `postedjob`
--
ALTER TABLE `postedjob`
  ADD CONSTRAINT `postedjob_ibfk_1` FOREIGN KEY (`compId`) REFERENCES `organization` (`compId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `professionaldetails`
--
ALTER TABLE `professionaldetails`
  ADD CONSTRAINT `professionaldetails_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `professionaldetails_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `professionaldetails_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `professionaldetails_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `personaldetails` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `savedjob`
--
ALTER TABLE `savedjob`
  ADD CONSTRAINT `savedjob_ibfk_1` FOREIGN KEY (`jobId`) REFERENCES `postedjob` (`jobId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `skill`
--
ALTER TABLE `skill`
  ADD CONSTRAINT `skill_ibfk_1` FOREIGN KEY (`sectorId`) REFERENCES `sector` (`sectorId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

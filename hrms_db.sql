-- HRMS Database Export Dump
-- Generated on: 2026-07-07T10:28:01.386Z

CREATE DATABASE IF NOT EXISTS `hrms_db`;
USE `hrms_db`;

-- ------------------------------------------------------
-- Table structure for table `announcements`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `author_id` varchar(255) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `date` varchar(255) NOT NULL,
  `send_email` tinyint(1) DEFAULT 0,
  `send_push` tinyint(1) DEFAULT 0,
  `type` enum('Announcement','Birthday','Anniversary','Reminder') DEFAULT 'Announcement',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table structure for table `assets`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT '',
  `asset_name` varchar(255) NOT NULL,
  `asset_type` varchar(255) NOT NULL,
  `serial_number` varchar(255) DEFAULT '',
  `status` enum('Requested','Assigned','Rejected','Return Pending','Returned') DEFAULT 'Requested',
  `request_comment` text DEFAULT NULL,
  `action_comment` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table structure for table `attendances`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) DEFAULT NULL,
  `employee_id` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL,
  `check_in` varchar(255) DEFAULT NULL,
  `check_out` varchar(255) DEFAULT NULL,
  `break_duration` varchar(255) DEFAULT '00:00:00',
  `work_hours` varchar(255) DEFAULT '00:00:00',
  `status` varchar(255) DEFAULT 'Present',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `attendances`
INSERT INTO `attendances` (`id`, `company_id`, `employee_id`, `employee_name`, `date`, `check_in`, `check_out`, `break_duration`, `work_hours`, `status`) VALUES
('att_661O3FW', 'comp_CLB8G5L', 'EMP975941', 'priyanshu', '2026-07-06', '12:13:15', '12:14:49', '00:00:00', '00:01:17', 'Half-day'),
('att_APLLQR7', 'comp_CLB8G5L', 'EMP341380', 'hlo', '2026-07-06', '11:53:09', '15:03:56', '00:00:00', '00:00:00', 'Half-day'),
('att_OP5GHJI', 'comp_4ITZKLL', 'EMP119971', 'pankaj', '2026-07-07', '12:45:59', NULL, '00:00:00', '00:00:00', 'Present'),
('att_UOE9U4D', 'comp_4ITZKLL', 'EMP639399', 'priyanshu', '2026-07-07', '13:07:26', '13:08:57', '00:00:00', '00:01:31', 'Half-day');

-- ------------------------------------------------------
-- Table structure for table `companies`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT '',
  `owner_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `subscription_plan_id` varchar(255) DEFAULT 'starter',
  `storage_used` float DEFAULT 0,
  `status` enum('active','suspended','trial','expired') DEFAULT 'trial',
  `created_date` varchar(255) DEFAULT NULL,
  `gst` varchar(255) DEFAULT '',
  `address` text DEFAULT NULL,
  `country` varchar(255) DEFAULT '',
  `state` varchar(255) DEFAULT '',
  `city` varchar(255) DEFAULT '',
  `timezone` varchar(255) DEFAULT 'UTC',
  `currency` varchar(255) DEFAULT 'USD',
  `max_employees` int(11) DEFAULT 100,
  `storage_limit` float DEFAULT 50,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `companies`
INSERT INTO `companies` (`id`, `name`, `logo`, `owner_name`, `email`, `phone`, `subscription_plan_id`, `storage_used`, `status`, `created_date`, `gst`, `address`, `country`, `state`, `city`, `timezone`, `currency`, `max_employees`, `storage_limit`) VALUES
('comp_4ITZKLL', 'ITLC INDIA PVT LTD', '', 'ITLC INDIA PVT LTD Owner', 'hii@itlcindia.com', '1234567890', 'starter', 0, 'trial', '2026-07-07', '', '', 'india', 'UP', 'lko', 'UTC', 'USD', 100, 50),
('comp_CLB8G5L', 'hii', '', 'hii Owner', 'hii@gmail.com', '1234567890', 'starter', 0, 'trial', '2026-07-06', '', '', 'india', 'UP', 'lko', 'UTC', 'USD', 100, 50),
('comp_JM0YYH0', 'admin', '', 'admin Owner', 'admin@gmail.com', '1234567890', 'starter', 0, 'trial', '2026-07-07', '', '', 'india', 'UP', 'lko', 'UTC', 'USD', 100, 50),
('comp_XKK0Z7G', 'itlc', '', 'itlc Owner', 'itlc@gmail.com', '8090311359', 'starter', 0, 'trial', '2026-07-06', '', '', 'india', 'UP', 'lko', 'UTC', 'USD', 100, 50);

-- ------------------------------------------------------
-- Table structure for table `correction_requests`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `correction_requests`;
CREATE TABLE `correction_requests` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `employee_id` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `attendance_id` varchar(255) DEFAULT NULL,
  `date` varchar(255) NOT NULL,
  `type` enum('Missing Punch','Correction','Shift Change','Overtime') NOT NULL,
  `requested_check_in` varchar(255) DEFAULT '',
  `requested_check_out` varchar(255) DEFAULT '',
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `manager_comment` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table structure for table `employees`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT '$2a$10$U7vO9vM2nF1c7x.iP8W1eu3R6s2P6o.G1eK4b4xY0d1y3g4d5v6a.',
  `role` enum('Super Owner','Company Admin','HR','Manager','Employee') DEFAULT 'Employee',
  `department` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `salary` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT '',
  `status` enum('Active','On Leave','Suspended') DEFAULT 'Active',
  `dob` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `joining_date` varchar(255) DEFAULT NULL,
  `reporting_manager` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `employees`
INSERT INTO `employees` (`id`, `company_id`, `name`, `email`, `password_hash`, `role`, `department`, `designation`, `salary`, `phone`, `avatar`, `status`, `dob`, `gender`, `address`, `joining_date`, `reporting_manager`) VALUES
('ADM106428', 'comp_CLB8G5L', 'hii Owner', 'hii@gmail.com', '$.M.lVXLp6K8dEn6VLo4JPeyx1K08psEmSAfJlvJcFKBT3KtlbDogO', 'Company Admin', 'Management', 'Company Director', NULL, '1234567890', '', 'Active', NULL, NULL, NULL, '2026-07-06', NULL),
('ADM401041', 'comp_XKK0Z7G', 'itlc Owner', 'itlc@gmail.com', '$.M.lVXLp6K8dEn6VLo4JPeyx1K08psEmSAfJlvJcFKBT3KtlbDogO', 'Company Admin', 'Management', 'Company Director', NULL, '8090311359', '', 'Active', NULL, NULL, NULL, '2026-07-06', NULL),
('ADM409710', 'comp_4ITZKLL', 'ITLC INDIA PVT LTD Owner', 'hii@itlcindia.com', '$2a$10$.CVKcJ0ANcXIYYfiWpNTfugHs/xtSTpS3pyA.ioMSqDHpK3ggSrj6', 'Company Admin', 'Management', 'Company Director', NULL, '1234567890', '', 'Active', NULL, NULL, NULL, '2026-07-07', NULL),
('ADM985783', 'comp_JM0YYH0', 'admin Owner', 'admin@gmail.com', '$2a$10$jX8ciHvWCANbBuAt19e54.mCbDX6aqJQnq/tUtn/8DVZH/QdhYHq6', 'Company Admin', 'Management', 'Company Director', NULL, '1234567890', '', 'Active', NULL, NULL, NULL, '2026-07-07', NULL),
('EMP109042', 'comp_JM0YYH0', 'manager', 'manager@gmail.com', '$2a$10$Q/E2v6A6kPZWp5.LZKee6uROd21.xYvCXAiqq8fSkfGywmTKRwOv6', 'Manager', 'Engineering', 'manager', '$75,000', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000320135?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, '2026-07-07', 'None'),
('EMP119971', 'comp_4ITZKLL', 'pankaj', 'pankaj@itlcindia.com', '$2a$10$aC5ObeqlGHDUU3UjSbgEWu9KTfj/GQeK0WN2itVPJjAyyia3kHwaK', 'Employee', 'Design', 'Software Engineer', '$50', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000818547?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, '2026-07-07', 'ITLC INDIA PVT LTD Owner'),
('EMP341380', 'comp_CLB8G5L', 'hlo', 'hlo@gmail.com', '$.M.lVXLp6K8dEn6VLo4JPeyx1K08psEmSAfJlvJcFKBT3KtlbDogO', 'Employee', 'Engineering', 'Software Engineer', '$100', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000884252?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, '2026-07-06', 'None'),
('EMP639399', 'comp_4ITZKLL', 'priyanshu', 'priyanshu@itlcindia.com', '$2a$10$mr5dbQtmmXak..U9/Ycu3O0h3IIr9Lql3oKK5..JNB9/ZyimErp3i', 'Employee', 'Engineering', 'Software Engineer', '$100', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000319955?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, '2026-07-07', 'ITLC INDIA PVT LTD Owner'),
('EMP659767', 'comp_XKK0Z7G', 'partner', 'partner@itlc.com', '$.M.lVXLp6K8dEn6VLo4JPeyx1K08psEmSAfJlvJcFKBT3KtlbDogO', 'Employee', 'Engineering', 'Software Engineer', '$100', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000452744?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, '2026-07-06', 'None'),
('EMP699406', 'comp_JM0YYH0', 'emp', 'emp@gmail.com', '$2a$10$EaWkK7sq9ZSaLCKJ15xdZeINSjbzk5DEvxsI9lwfuLGIlmroJTYN6', 'Employee', 'Engineering', 'intern', '$50', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000464347?w=150&auto=format&fit=crop&q=80', 'Active', '1992-08-24', 'Male', '482 Silver Lake Blvd, Los Angeles, CA 90026', '2026-07-07', 'manager'),
('EMP975941', 'comp_CLB8G5L', 'priyanshu', 'priyanshu@gmail.com', '$.M.lVXLp6K8dEn6VLo4JPeyx1K08psEmSAfJlvJcFKBT3KtlbDogO', 'Employee', 'Engineering', 'Software Engineer', '$50', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1500000295514?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, '2026-07-06', 'None'),
('SUP_PAPZ0YC', NULL, 'Priyanshu Pushkar', 'priyanshupushkar263@gmail.com', '$.M.lVXLp6K8dEn6VLo4JPeyx1K08psEmSAfJlvJcFKBT3KtlbDogO', 'Super Owner', 'Executive', 'Platform Administrator', NULL, '8090311359', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Active', NULL, NULL, NULL, NULL, NULL);

-- ------------------------------------------------------
-- Table structure for table `expense_claims`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `expense_claims`;
CREATE TABLE `expense_claims` (
  `id` varchar(255) NOT NULL,
  `employee_id` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `amount` float NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `company_id` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table structure for table `leave_requests`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` varchar(255) NOT NULL,
  `employee_id` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `from_date` varchar(255) NOT NULL,
  `to_date` varchar(255) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  `applied_date` varchar(255) DEFAULT NULL,
  `total_days` int(11) NOT NULL,
  `company_id` varchar(255) DEFAULT '',
  `manager_status` varchar(255) DEFAULT 'Pending',
  `manager_comment` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `leave_requests`
INSERT INTO `leave_requests` (`id`, `employee_id`, `employee_name`, `type`, `from_date`, `to_date`, `reason`, `status`, `applied_date`, `total_days`, `company_id`, `manager_status`, `manager_comment`) VALUES
('leave_DH6IWVV', 'EMP341380', 'hlo', 'Casual Leave', '2026-07-07', '2026-07-08', 'please give me leave one day ', 'Approved', '2026-07-06', 2, 'comp_CLB8G5L', 'Pending', NULL),
('leave_K0SW9LN', 'EMP699406', 'emp', 'Sick Leave', '2026-07-09', '2026-07-10', 'sdjhfg', 'Approved', '2026-07-07', 2, 'comp_JM0YYH0', 'Approved', 'right
'),
('leave_R8KYFFU', 'EMP119971', 'pankaj', 'Sick Leave', '2026-07-10', '2026-07-12', 'dsczjha ihdsicz', 'Approved', '2026-07-07', 3, 'comp_4ITZKLL', 'Pending', NULL);

-- ------------------------------------------------------
-- Table structure for table `meetings`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `meetings`;
CREATE TABLE `meetings` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `host_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `agenda` text NOT NULL,
  `date` varchar(255) NOT NULL,
  `time` varchar(255) NOT NULL,
  `platform` enum('Google Meet','Microsoft Teams','Zoom') DEFAULT 'Google Meet',
  `link` varchar(255) DEFAULT '',
  `invitees` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `attendance` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table structure for table `performance_reviews`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `performance_reviews`;
CREATE TABLE `performance_reviews` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `employee_id` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `manager_id` varchar(255) NOT NULL,
  `kpis` text DEFAULT NULL,
  `kras` text DEFAULT NULL,
  `goals` text DEFAULT NULL,
  `rating` float DEFAULT 5,
  `review_period` varchar(255) NOT NULL,
  `promotion_recommendation` text DEFAULT NULL,
  `appreciation` text DEFAULT NULL,
  `warning` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table structure for table `support_tickets`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE `support_tickets` (
  `id` varchar(255) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `requester_name` varchar(255) NOT NULL,
  `requester_email` varchar(255) NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','pending','resolved') DEFAULT 'open',
  `created_date` varchar(255) DEFAULT NULL,
  `messages_json` text DEFAULT NULL,
  `company_id` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `support_tickets`
INSERT INTO `support_tickets` (`id`, `company_name`, `subject`, `requester_name`, `requester_email`, `priority`, `status`, `created_date`, `messages_json`, `company_id`) VALUES
('tkt_JPREUP7', 'hii', 'dfghjk', 'hlo', 'hlo@gmail.com', 'medium', 'open', '2026-07-06', '[{"id":"msg_IW7200P","senderName":"hlo","senderRole":"Employee","content":"dvgsef ieiuf\n","timestamp":"2026-07-06T07:15:13.400Z","isAgent":false}]', 'comp_CLB8G5L'),
('tkt_S8B1GDB', 'ITLC INDIA PVT LTD', 'give me chatgpt pro', 'pankaj', 'pankaj@itlcindia.com', 'high', 'open', '2026-07-07', '[{"id":"msg_H9JW5NX","senderName":"pankaj","senderRole":"Employee","content":"for coding ","timestamp":"2026-07-07T07:23:01.992Z","isAgent":false}]', 'comp_4ITZKLL');

-- ------------------------------------------------------
-- Table structure for table `tasks`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` varchar(255) NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `assigned_to` varchar(255) NOT NULL,
  `assigned_to_name` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_by_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('Todo','In Progress','Completed','Blocked','Cancelled') DEFAULT 'Todo',
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `deadline` varchar(255) NOT NULL,
  `attachments` text DEFAULT NULL,
  `comments` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tasks`
INSERT INTO `tasks` (`id`, `company_id`, `assigned_to`, `assigned_to_name`, `created_by`, `created_by_name`, `title`, `description`, `status`, `priority`, `deadline`, `attachments`, `comments`) VALUES
('TSK786901', 'comp_JM0YYH0', 'EMP699406', 'emp', 'EMP109042', 'manager', 'HRMS today complete ', 'end of day complete 
', 'Completed', 'High', '2026-07-07', '', '[]');


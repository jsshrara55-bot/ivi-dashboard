CREATE TABLE `risk_change_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contNo` varchar(50) NOT NULL,
	`companyName` varchar(255),
	`previousRisk` enum('Low','Medium','High') NOT NULL,
	`newRisk` enum('Low','Medium','High') NOT NULL,
	`previousScore` decimal(5,2),
	`newScore` decimal(5,2),
	`notificationSent` boolean NOT NULL DEFAULT false,
	`notificationSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `risk_change_alerts_id` PRIMARY KEY(`id`)
);

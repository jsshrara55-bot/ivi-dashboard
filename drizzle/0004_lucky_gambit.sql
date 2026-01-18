CREATE TABLE `notification_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationType` enum('risk_escalation','risk_improvement','scheduled_daily','manual') NOT NULL,
	`alertId` int,
	`contNo` varchar(50),
	`companyName` varchar(255),
	`title` varchar(500) NOT NULL,
	`success` boolean NOT NULL DEFAULT false,
	`errorMessage` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_scheduler` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`scheduledTime` varchar(5) NOT NULL DEFAULT '09:00',
	`daysOfWeek` varchar(20) NOT NULL DEFAULT '1,2,3,4,5',
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`lastRunCount` int DEFAULT 0,
	`lastRunStatus` enum('success','failed','partial'),
	`lastRunError` text,
	`modifiedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_scheduler_id` PRIMARY KEY(`id`)
);

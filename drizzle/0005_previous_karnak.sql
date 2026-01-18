CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` enum('ar','en') NOT NULL DEFAULT 'en',
	`theme` enum('light','dark','system') NOT NULL DEFAULT 'system',
	`displayDensity` enum('compact','comfortable','spacious') NOT NULL DEFAULT 'comfortable',
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`riskAlertNotifications` boolean NOT NULL DEFAULT true,
	`dailySummaryNotifications` boolean NOT NULL DEFAULT false,
	`notificationSound` boolean NOT NULL DEFAULT true,
	`defaultDashboardView` enum('overview','analytics','predictions') NOT NULL DEFAULT 'overview',
	`itemsPerPage` int NOT NULL DEFAULT 10,
	`showTooltips` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);

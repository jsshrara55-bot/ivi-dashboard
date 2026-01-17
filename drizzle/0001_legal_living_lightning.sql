CREATE TABLE `medication_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medication_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `medication_categories_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `pre_auth_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`status` enum('pending','approved','rejected','appealed') NOT NULL DEFAULT 'pending',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`rejectionReason` text,
	`appealReason` text,
	`appealedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pre_auth_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `request_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`requirementId` int NOT NULL,
	`isChecked` boolean NOT NULL DEFAULT false,
	`checkedAt` timestamp,
	`notes` text,
	CONSTRAINT `request_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `request_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`requirementId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `request_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`labelEn` varchar(255) NOT NULL,
	`labelAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`isRequired` boolean NOT NULL DEFAULT true,
	`requiresDocument` boolean NOT NULL DEFAULT false,
	`documentTypes` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requirements_id` PRIMARY KEY(`id`)
);

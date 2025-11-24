CREATE TABLE `equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`helmet` varchar(64),
	`amulet` varchar(64),
	`backpack` varchar(64),
	`weapon` varchar(64),
	`armor` varchar(64),
	`shield` varchar(64),
	`ring` varchar(64),
	`legs` varchar(64),
	`arrows` varchar(64),
	`boots` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`itemId` varchar(64) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`skillId` varchar(64) NOT NULL,
	`unlocked` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`experience` int NOT NULL DEFAULT 0,
	`hp` int NOT NULL DEFAULT 100,
	`maxHp` int NOT NULL DEFAULT 100,
	`mana` int NOT NULL DEFAULT 50,
	`maxMana` int NOT NULL DEFAULT 50,
	`gold` int NOT NULL DEFAULT 100,
	`positionX` int NOT NULL DEFAULT 10,
	`positionY` int NOT NULL DEFAULT 10,
	`skillPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSavedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `equipment` ADD CONSTRAINT `equipment_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playerSkills` ADD CONSTRAINT `playerSkills_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
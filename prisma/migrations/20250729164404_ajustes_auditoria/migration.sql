-- CreateTable
CREATE TABLE `WhatsAppQRCodeHistory` (
    `id` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `qrCodeId` VARCHAR(191) NULL,
    `action` ENUM('GENERATED', 'VIEWED', 'DOWNLOADED', 'EXPIRED', 'USED', 'REGENERATED', 'DELETED', 'ACCESSED', 'FAILED') NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'USED') NULL,
    `details` JSON NULL,
    `userAgent` VARCHAR(500) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `sessionId` VARCHAR(100) NULL,
    `userId` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_history_config`(`configId`),
    INDEX `idx_history_instance`(`instanceName`),
    INDEX `idx_history_action`(`action`),
    INDEX `idx_history_timestamp`(`timestamp` DESC),
    INDEX `idx_instance_timestamp`(`instanceName`, `timestamp` DESC),
    INDEX `idx_action_timestamp`(`action`, `timestamp` DESC),
    INDEX `idx_user_timestamp`(`userId`, `timestamp` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppQRCodeAccess` (
    `id` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `qrCodeId` VARCHAR(191) NULL,
    `accessType` VARCHAR(50) NOT NULL,
    `userAgent` VARCHAR(500) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `sessionId` VARCHAR(100) NULL,
    `userId` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `errorMessage` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_access_instance`(`instanceName`),
    INDEX `idx_access_type`(`accessType`),
    INDEX `idx_access_timestamp`(`timestamp` DESC),
    INDEX `idx_instance_access_timestamp`(`instanceName`, `timestamp` DESC),
    INDEX `idx_user_access_timestamp`(`userId`, `timestamp` DESC),
    INDEX `idx_access_success`(`success`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppConnectionAnalytics` (
    `id` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `date` DATE NOT NULL,
    `qrCodesGenerated` INTEGER NOT NULL DEFAULT 0,
    `qrCodesExpired` INTEGER NOT NULL DEFAULT 0,
    `qrCodesUsed` INTEGER NOT NULL DEFAULT 0,
    `connectionsSuccessful` INTEGER NOT NULL DEFAULT 0,
    `connectionsFailed` INTEGER NOT NULL DEFAULT 0,
    `averageConnectionTime` INTEGER NULL,
    `totalAccessCount` INTEGER NOT NULL DEFAULT 0,
    `uniqueAccessCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_analytics_instance`(`instanceName`),
    INDEX `idx_analytics_date`(`date` DESC),
    INDEX `idx_instance_analytics_date`(`instanceName`, `date` DESC),
    UNIQUE INDEX `WhatsAppConnectionAnalytics_instanceName_date_key`(`instanceName`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppQRCodeRetention` (
    `id` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `retentionDays` INTEGER NOT NULL DEFAULT 30,
    `lastCleanupAt` DATETIME(3) NULL,
    `historyRecords` INTEGER NOT NULL DEFAULT 0,
    `accessRecords` INTEGER NOT NULL DEFAULT 0,
    `analyticsRecords` INTEGER NOT NULL DEFAULT 0,
    `autoCleanupActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_retention_cleanup`(`lastCleanupAt`),
    INDEX `idx_retention_active`(`autoCleanupActive`),
    UNIQUE INDEX `WhatsAppQRCodeRetention_instanceName_key`(`instanceName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WhatsAppQRCodeHistory` ADD CONSTRAINT `WhatsAppQRCodeHistory_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `WhatsAppConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

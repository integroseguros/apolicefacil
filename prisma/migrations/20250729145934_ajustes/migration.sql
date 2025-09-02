-- CreateTable
CREATE TABLE `WhatsAppQRCodeWarning` (
    `id` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `warningType` VARCHAR(50) NOT NULL,
    `timeRemaining` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_warning_instance`(`instanceName`),
    INDEX `idx_warning_timestamp`(`timestamp`),
    INDEX `idx_warning_type`(`warningType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppQRCodeExpiration` (
    `id` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `expiredAt` DATETIME(3) NOT NULL,
    `autoRegenerated` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_expiration_instance`(`instanceName`),
    INDEX `idx_expiration_date`(`expiredAt`),
    INDEX `idx_auto_regenerated`(`autoRegenerated`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppQRCodeCleanupLog` (
    `id` VARCHAR(191) NOT NULL,
    `expiredCount` INTEGER NOT NULL DEFAULT 0,
    `cleanedCount` INTEGER NOT NULL DEFAULT 0,
    `cleanedWarnings` INTEGER NOT NULL DEFAULT 0,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_cleanup_timestamp`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

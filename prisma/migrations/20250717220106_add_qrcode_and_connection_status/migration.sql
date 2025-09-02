-- CreateTable
CREATE TABLE `WhatsAppQRCode` (
    `id` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `qrCode` TEXT NOT NULL,
    `qrCodeBase64` LONGTEXT NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'USED') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `connectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WhatsAppQRCode_configId_idx`(`configId`),
    INDEX `idx_instance_status`(`instanceName`, `status`),
    INDEX `idx_expires_at`(`expiresAt`),
    INDEX `idx_status_created`(`status`, `createdAt`),
    UNIQUE INDEX `WhatsAppQRCode_instanceName_key`(`instanceName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppConnectionStatus` (
    `id` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `status` ENUM('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR') NOT NULL DEFAULT 'DISCONNECTED',
    `lastStatusCheck` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `connectionDetails` JSON NULL,
    `errorMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WhatsAppConnectionStatus_configId_idx`(`configId`),
    INDEX `idx_instance_name`(`instanceName`),
    INDEX `idx_status`(`status`),
    INDEX `idx_last_check`(`lastStatusCheck`),
    UNIQUE INDEX `WhatsAppConnectionStatus_instanceName_key`(`instanceName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WhatsAppQRCode` ADD CONSTRAINT `WhatsAppQRCode_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `WhatsAppConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsAppConnectionStatus` ADD CONSTRAINT `WhatsAppConnectionStatus_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `WhatsAppConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

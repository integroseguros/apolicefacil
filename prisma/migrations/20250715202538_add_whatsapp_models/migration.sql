-- CreateTable
CREATE TABLE `WhatsAppConfig` (
    `id` VARCHAR(191) NOT NULL,
    `baseUrl` VARCHAR(255) NOT NULL,
    `apiKey` TEXT NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `lastTested` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppConversation` (
    `id` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(20) NOT NULL,
    `customerName` VARCHAR(100) NULL,
    `customerId` VARCHAR(191) NULL,
    `lastMessage` DATETIME(3) NULL,
    `unreadCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WhatsAppConversation_phoneNumber_key`(`phoneNumber`),
    INDEX `WhatsAppConversation_phoneNumber_idx`(`phoneNumber`),
    INDEX `WhatsAppConversation_customerId_idx`(`customerId`),
    INDEX `WhatsAppConversation_lastMessage_idx`(`lastMessage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppMessage` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(100) NOT NULL,
    `fromNumber` VARCHAR(20) NOT NULL,
    `toNumber` VARCHAR(20) NOT NULL,
    `content` TEXT NOT NULL,
    `messageType` ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO', 'LOCATION') NOT NULL DEFAULT 'TEXT',
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `status` ENUM('SENT', 'DELIVERED', 'READ', 'FAILED') NOT NULL DEFAULT 'SENT',
    `timestamp` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WhatsAppMessage_messageId_key`(`messageId`),
    INDEX `WhatsAppMessage_conversationId_idx`(`conversationId`),
    INDEX `WhatsAppMessage_fromNumber_idx`(`fromNumber`),
    INDEX `WhatsAppMessage_timestamp_idx`(`timestamp`),
    INDEX `WhatsAppMessage_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WhatsAppConversation` ADD CONSTRAINT `WhatsAppConversation_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsAppMessage` ADD CONSTRAINT `WhatsAppMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `WhatsAppConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsAppMessage` ADD CONSTRAINT `WhatsAppMessage_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

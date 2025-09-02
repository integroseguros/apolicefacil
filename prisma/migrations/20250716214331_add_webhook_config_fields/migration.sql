-- DropIndex
DROP INDEX `WhatsAppConversation_lastMessage_idx` ON `whatsappconversation`;

-- DropIndex
DROP INDEX `WhatsAppMessage_fromNumber_idx` ON `whatsappmessage`;

-- DropIndex
DROP INDEX `WhatsAppMessage_timestamp_idx` ON `whatsappmessage`;

-- AlterTable
ALTER TABLE `whatsappconfig` ADD COLUMN `lastWebhookTest` DATETIME(3) NULL,
    ADD COLUMN `webhookActive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `webhookToken` TEXT NULL,
    ADD COLUMN `webhookUrl` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `WhatsAppWebhookLog` (
    `id` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,
    `event` VARCHAR(50) NOT NULL,
    `instanceName` VARCHAR(100) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `error` TEXT NULL,
    `requestData` JSON NULL,
    `responseData` JSON NULL,
    `clientIp` VARCHAR(45) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WhatsAppWebhookLog_configId_idx`(`configId`),
    INDEX `WhatsAppWebhookLog_instanceName_idx`(`instanceName`),
    INDEX `WhatsAppWebhookLog_success_idx`(`success`),
    INDEX `WhatsAppWebhookLog_timestamp_idx`(`timestamp`),
    INDEX `WhatsAppWebhookLog_event_idx`(`event`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppSystemMetrics` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `connectionStatus` VARCHAR(20) NOT NULL,
    `messagesProcessed` INTEGER NOT NULL DEFAULT 0,
    `messagesSent` INTEGER NOT NULL DEFAULT 0,
    `messagesReceived` INTEGER NOT NULL DEFAULT 0,
    `messagesFailed` INTEGER NOT NULL DEFAULT 0,
    `averageResponseTime` DOUBLE NULL,
    `apiResponseTime` DOUBLE NULL,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `activeConversations` INTEGER NOT NULL DEFAULT 0,

    INDEX `WhatsAppSystemMetrics_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppSystemError` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `errorType` VARCHAR(50) NOT NULL,
    `errorCode` VARCHAR(20) NULL,
    `message` TEXT NOT NULL,
    `stackTrace` TEXT NULL,
    `endpoint` VARCHAR(255) NULL,
    `instanceName` VARCHAR(100) NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolvedAt` DATETIME(3) NULL,

    INDEX `WhatsAppSystemError_timestamp_idx`(`timestamp`),
    INDEX `WhatsAppSystemError_errorType_idx`(`errorType`),
    INDEX `WhatsAppSystemError_resolved_idx`(`resolved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `WhatsAppConfig_instanceName_idx` ON `WhatsAppConfig`(`instanceName`);

-- CreateIndex
CREATE INDEX `WhatsAppConfig_webhookActive_idx` ON `WhatsAppConfig`(`webhookActive`);

-- CreateIndex
CREATE INDEX `idx_customer_active` ON `WhatsAppConversation`(`customerId`, `isActive`);

-- CreateIndex
CREATE INDEX `idx_active_lastmessage` ON `WhatsAppConversation`(`isActive`, `lastMessage` DESC);

-- CreateIndex
CREATE INDEX `idx_active_unread_lastmessage` ON `WhatsAppConversation`(`isActive`, `unreadCount` DESC, `lastMessage` DESC);

-- CreateIndex
CREATE INDEX `idx_lastmessage_created` ON `WhatsAppConversation`(`lastMessage` DESC, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `idx_customer_name` ON `WhatsAppConversation`(`customerName`);

-- CreateIndex
CREATE INDEX `idx_conversation_timestamp` ON `WhatsAppMessage`(`conversationId`, `timestamp` DESC);

-- CreateIndex
CREATE INDEX `idx_conversation_direction_timestamp` ON `WhatsAppMessage`(`conversationId`, `direction`, `timestamp` DESC);

-- CreateIndex
CREATE INDEX `idx_customer_timestamp` ON `WhatsAppMessage`(`customerId`, `timestamp` DESC);

-- CreateIndex
CREATE INDEX `idx_from_timestamp` ON `WhatsAppMessage`(`fromNumber`, `timestamp` DESC);

-- CreateIndex
CREATE INDEX `idx_status_created` ON `WhatsAppMessage`(`status`, `createdAt`);

-- CreateIndex
CREATE INDEX `idx_type_timestamp` ON `WhatsAppMessage`(`messageType`, `timestamp` DESC);

-- CreateIndex
CREATE INDEX `idx_timestamp_id_cursor` ON `WhatsAppMessage`(`timestamp` DESC, `id`);

-- CreateIndex
CREATE INDEX `idx_created_desc` ON `WhatsAppMessage`(`createdAt` DESC);

-- AddForeignKey
ALTER TABLE `WhatsAppWebhookLog` ADD CONSTRAINT `WhatsAppWebhookLog_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `WhatsAppConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

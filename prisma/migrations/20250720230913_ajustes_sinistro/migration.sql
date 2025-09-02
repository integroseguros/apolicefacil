-- CreateTable
CREATE TABLE `Claim` (
    `id` VARCHAR(191) NOT NULL,
    `claimNumber` VARCHAR(50) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `policyId` VARCHAR(191) NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `incidentDate` DATETIME(3) NOT NULL,
    `reportedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('REPORTED', 'UNDER_REVIEW', 'INVESTIGATING', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED') NOT NULL DEFAULT 'REPORTED',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `claimType` VARCHAR(50) NOT NULL,
    `estimatedValue` DECIMAL(15, 2) NULL,
    `approvedValue` DECIMAL(15, 2) NULL,
    `deductible` DECIMAL(15, 2) NULL,
    `location` VARCHAR(255) NULL,
    `witnesses` TEXT NULL,
    `policeReport` VARCHAR(100) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `closedReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Claim_claimNumber_key`(`claimNumber`),
    INDEX `idx_customer_status`(`customerId`, `status`),
    INDEX `idx_policy`(`policyId`),
    INDEX `idx_status_priority`(`status`, `priority`),
    INDEX `idx_incident_date`(`incidentDate` DESC),
    INDEX `idx_reported_date`(`reportedDate` DESC),
    INDEX `idx_assigned_to`(`assignedTo`),
    INDEX `idx_claim_number`(`claimNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClaimDocument` (
    `id` VARCHAR(191) NOT NULL,
    `claimId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `uploadedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_claim`(`claimId`),
    INDEX `idx_created_desc`(`createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClaimTimeline` (
    `id` VARCHAR(191) NOT NULL,
    `claimId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `userId` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_claim_timestamp`(`claimId`, `timestamp` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClaimCommunication` (
    `id` VARCHAR(191) NOT NULL,
    `claimId` VARCHAR(191) NOT NULL,
    `type` ENUM('EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'INTERNAL_NOTE') NOT NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `subject` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `fromEmail` VARCHAR(255) NULL,
    `toEmail` VARCHAR(255) NULL,
    `fromPhone` VARCHAR(20) NULL,
    `toPhone` VARCHAR(20) NULL,
    `userId` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_claim_timestamp`(`claimId`, `timestamp` DESC),
    INDEX `idx_type_timestamp`(`type`, `timestamp` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `Policy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimDocument` ADD CONSTRAINT `ClaimDocument_claimId_fkey` FOREIGN KEY (`claimId`) REFERENCES `Claim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimDocument` ADD CONSTRAINT `ClaimDocument_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimTimeline` ADD CONSTRAINT `ClaimTimeline_claimId_fkey` FOREIGN KEY (`claimId`) REFERENCES `Claim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimTimeline` ADD CONSTRAINT `ClaimTimeline_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimCommunication` ADD CONSTRAINT `ClaimCommunication_claimId_fkey` FOREIGN KEY (`claimId`) REFERENCES `Claim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimCommunication` ADD CONSTRAINT `ClaimCommunication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

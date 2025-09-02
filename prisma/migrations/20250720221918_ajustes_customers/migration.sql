-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `category` ENUM('IDENTIFICATION', 'CONTRACT', 'POLICY', 'PROPOSAL', 'PHOTO', 'FINANCIAL', 'LEGAL', 'OTHER') NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `parentId` VARCHAR(191) NULL,
    `uploadedBy` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_customer_category`(`customerId`, `category`),
    INDEX `idx_customer_active`(`customerId`, `isActive`),
    INDEX `idx_parent`(`parentId`),
    INDEX `idx_created_desc`(`createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

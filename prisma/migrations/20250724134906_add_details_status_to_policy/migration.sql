-- AlterTable
ALTER TABLE `policy` ADD COLUMN `detailsStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    MODIFY `situationDocument` VARCHAR(191) NOT NULL DEFAULT '0';

-- CreateIndex
CREATE INDEX `idx_situation_details_status` ON `Policy`(`situationDocument`, `detailsStatus`);

-- CreateIndex
CREATE INDEX `idx_details_status_created` ON `Policy`(`detailsStatus`, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `idx_customer_details_status` ON `Policy`(`customerId`, `detailsStatus`);

-- CreateIndex
CREATE INDEX `idx_situation_created` ON `Policy`(`situationDocument`, `createdAt` DESC);

-- DropForeignKey
ALTER TABLE `itemautomovel` DROP FOREIGN KEY `ItemAutomovel_policyId_fkey`;

-- AlterTable
ALTER TABLE `itemautomovel` MODIFY `policyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ItemAutomovel` ADD CONSTRAINT `ItemAutomovel_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `Policy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

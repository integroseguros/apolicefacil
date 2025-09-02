-- AlterTable
ALTER TABLE `customer` ADD COLUMN `cnhExpiration` VARCHAR(20) NULL,
    ADD COLUMN `cnhNumber` VARCHAR(20) NULL,
    ADD COLUMN `document` VARCHAR(20) NULL,
    ADD COLUMN `documentDateExpedition` VARCHAR(10) NULL,
    ADD COLUMN `documentIssuingAgency` VARCHAR(10) NULL,
    ADD COLUMN `income` VARCHAR(10) NULL,
    ADD COLUMN `maritalStatus` VARCHAR(10) NULL,
    ADD COLUMN `source` VARCHAR(100) NULL;

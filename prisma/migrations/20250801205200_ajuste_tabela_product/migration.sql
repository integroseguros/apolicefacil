-- AlterTable
ALTER TABLE `product` ADD COLUMN `additionalCommission` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `iof` DECIMAL(15, 2) NULL,
    ADD COLUMN `showBudget` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `subscriptionInsurance` BOOLEAN NULL DEFAULT false;

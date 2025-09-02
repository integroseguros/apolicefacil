/*
  Warnings:

  - You are about to drop the column `numeroParcelas` on the `policy` table. All the data in the column will be lost.
  - You are about to drop the column `valorParcela` on the `policy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `policy` DROP COLUMN `numeroParcelas`,
    DROP COLUMN `valorParcela`,
    ADD COLUMN `additional` VARCHAR(30) NULL,
    ADD COLUMN `cost` VARCHAR(30) NULL,
    ADD COLUMN `discountFee` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `firstDueDate` DATETIME(3) NULL,
    ADD COLUMN `installmentValue` VARCHAR(30) NULL,
    ADD COLUMN `numberInstallments` INTEGER NULL,
    ADD COLUMN `upcomingDueDate` DATETIME(3) NULL;

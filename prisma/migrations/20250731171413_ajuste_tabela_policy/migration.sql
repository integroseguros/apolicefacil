/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `policy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `policy` DROP COLUMN `paymentMethod`,
    ADD COLUMN `agencia` VARCHAR(191) NULL,
    ADD COLUMN `alteradoPor` VARCHAR(191) NULL,
    ADD COLUMN `apoliceColetiva` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `banco` VARCHAR(191) NULL,
    ADD COLUMN `contaCorrente` VARCHAR(191) NULL,
    ADD COLUMN `criadoPor` VARCHAR(191) NULL,
    ADD COLUMN `nrVidas` VARCHAR(30) NULL;

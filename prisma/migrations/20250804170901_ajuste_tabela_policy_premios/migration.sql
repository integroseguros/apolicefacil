/*
  Warnings:

  - You are about to alter the column `additional` on the `policy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Decimal(15,2)`.
  - You are about to alter the column `cost` on the `policy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Decimal(15,2)`.
  - You are about to alter the column `installmentValue` on the `policy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE `policy` MODIFY `additional` DECIMAL(15, 2) NULL,
    MODIFY `cost` DECIMAL(15, 2) NULL,
    MODIFY `installmentValue` DECIMAL(15, 2) NULL;

/*
  Warnings:

  - You are about to alter the column `endDate` on the `policy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `DateTime(3)`.
  - You are about to alter the column `startDate` on the `policy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `policy` MODIFY `endDate` DATETIME(3) NOT NULL,
    MODIFY `startDate` DATETIME(3) NOT NULL;

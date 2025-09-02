/*
  Warnings:

  - You are about to alter the column `manufacturerYear` on the `itemautomovel` table. The data in that column could be lost. The data in that column will be cast from `VarChar(4)` to `Int`.
  - You are about to alter the column `manufacturerYearModel` on the `itemautomovel` table. The data in that column could be lost. The data in that column will be cast from `VarChar(4)` to `Int`.

*/
-- AlterTable
ALTER TABLE `itemautomovel` MODIFY `manufacturerYear` INTEGER NULL,
    MODIFY `manufacturerYearModel` INTEGER NULL;

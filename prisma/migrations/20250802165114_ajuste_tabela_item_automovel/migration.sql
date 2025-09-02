/*
  Warnings:

  - Added the required column `manufacturer` to the `ItemAutomovel` table without a default value. This is not possible if the table is not empty.
  - Made the column `model` on table `itemautomovel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `itemautomovel` ADD COLUMN `item` INTEGER NULL,
    ADD COLUMN `itemCia` VARCHAR(5) NULL,
    ADD COLUMN `itemStatus` VARCHAR(20) NULL,
    ADD COLUMN `manufacturer` VARCHAR(100) NOT NULL,
    ADD COLUMN `observation` VARCHAR(255) NULL,
    ADD COLUMN `owner` VARCHAR(100) NULL,
    MODIFY `model` VARCHAR(100) NOT NULL;

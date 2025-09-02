/*
  Warnings:

  - You are about to drop the column `proposalDate` on the `policy` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `policy` DROP COLUMN `proposalDate`,
    ADD COLUMN `bonus` VARCHAR(2) NULL,
    ADD COLUMN `endDate` VARCHAR(10) NOT NULL,
    ADD COLUMN `identificationCode` VARCHAR(30) NULL,
    ADD COLUMN `startDate` VARCHAR(10) NOT NULL;

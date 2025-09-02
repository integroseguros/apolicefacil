/*
  Warnings:

  - Made the column `issueDate` on table `policy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `policy` MODIFY `issueDate` DATETIME(3) NOT NULL;

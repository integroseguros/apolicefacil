-- AlterTable
ALTER TABLE `endosso` ADD COLUMN `dataEmissao` DATETIME(3) NULL,
    ADD COLUMN `numeroApolice` VARCHAR(50) NULL;

-- CreateIndex
CREATE INDEX `idx_numero_apolice` ON `Endosso`(`numeroApolice`);

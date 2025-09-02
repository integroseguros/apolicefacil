-- AlterTable
ALTER TABLE `policy` ADD COLUMN `emissaoData` JSON NULL,
    ADD COLUMN `formaPagamento` VARCHAR(191) NULL,
    ADD COLUMN `numeroParcelas` INTEGER NULL,
    ADD COLUMN `percentualComissao` DECIMAL(5, 2) NULL,
    ADD COLUMN `valorParcela` DECIMAL(15, 2) NULL,
    ADD COLUMN `valoresData` JSON NULL,
    ADD COLUMN `valoresStatus` VARCHAR(191) NOT NULL DEFAULT 'pending';

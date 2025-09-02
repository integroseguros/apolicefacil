-- CreateTable
CREATE TABLE `Condutor` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `dataNascimento` DATETIME(3) NULL,
    `parentesco` VARCHAR(50) NULL,
    `genero` VARCHAR(20) NULL,
    `estadoCivil` VARCHAR(30) NULL,
    `profissao` VARCHAR(100) NULL,
    `itemAutomovelId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Condutor_itemAutomovelId_idx`(`itemAutomovelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Condutor` ADD CONSTRAINT `Condutor_itemAutomovelId_fkey` FOREIGN KEY (`itemAutomovelId`) REFERENCES `ItemAutomovel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

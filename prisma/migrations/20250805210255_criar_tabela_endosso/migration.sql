-- CreateTable
CREATE TABLE `Endosso` (
    `id` VARCHAR(191) NOT NULL,
    `apoliceId` VARCHAR(191) NOT NULL,
    `sequencia` INTEGER NOT NULL,
    `endossoNr` VARCHAR(50) NOT NULL,
    `vigencia` VARCHAR(100) NOT NULL,
    `tipoMovimento` VARCHAR(100) NOT NULL,
    `nrVidas` VARCHAR(30) NOT NULL,
    `premio` DECIMAL(15, 2) NOT NULL,
    `sitMov` VARCHAR(50) NOT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_endosso_apolice`(`apoliceId`),
    INDEX `idx_endosso_sequencia`(`sequencia`),
    INDEX `idx_apolice_sequencia`(`apoliceId`, `sequencia`),
    UNIQUE INDEX `Endosso_apoliceId_sequencia_key`(`apoliceId`, `sequencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Endosso` ADD CONSTRAINT `Endosso_apoliceId_fkey` FOREIGN KEY (`apoliceId`) REFERENCES `Policy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

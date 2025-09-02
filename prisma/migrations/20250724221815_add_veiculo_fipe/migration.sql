-- CreateTable
CREATE TABLE `veiculofipe` (
    `id` VARCHAR(191) NOT NULL,
    `cod_fipe` VARCHAR(191) NOT NULL,
    `num_passageiros` INTEGER NULL,
    `cod_marca` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `cod_modelo` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `cod_categoria_suhai` VARCHAR(191) NOT NULL,
    `categoria_suhai` VARCHAR(191) NOT NULL,
    `cod_categoria_tarifaria` VARCHAR(191) NULL,
    `valorFipe` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VeiculoFipe_cod_fipe_key`(`cod_fipe`),
    INDEX `VeiculoFipe_cod_marca_idx`(`cod_marca`),
    INDEX `VeiculoFipe_cod_modelo_idx`(`cod_modelo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_details_situation_updated` ON `Policy`(`detailsStatus`, `situationDocument`, `updatedAt` DESC);

-- CreateIndex
CREATE INDEX `idx_customer_situation_details` ON `Policy`(`customerId`, `situationDocument`, `detailsStatus`);

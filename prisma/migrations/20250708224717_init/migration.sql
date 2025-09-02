-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT '1',
    `password` VARCHAR(20) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'Atendente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT '1',
    `socialName` VARCHAR(100) NOT NULL,
    `birthDate` VARCHAR(10) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `personType` VARCHAR(8) NOT NULL,
    `cnpjCpf` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `website` VARCHAR(100) NOT NULL,
    `clientSince` VARCHAR(7) NOT NULL,
    `revenue` VARCHAR(10) NOT NULL,
    `business` VARCHAR(100) NOT NULL,
    `avatarUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_cnpjCpf_key`(`cnpjCpf`),
    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Phone` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `birthDate` VARCHAR(10) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `cellPhone` VARCHAR(15) NOT NULL,
    `position` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Contact_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `street` VARCHAR(100) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `complement` VARCHAR(191) NULL,
    `district` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(2) NOT NULL,
    `zipCode` VARCHAR(8) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InsuranceCompany` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'A',
    `phone` VARCHAR(15) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'A',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'A',
    `branchId` VARCHAR(191) NOT NULL,
    `insuranceCompanyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Policy` (
    `id` VARCHAR(191) NOT NULL,
    `document` VARCHAR(10) NOT NULL,
    `proposalNumber` VARCHAR(30) NOT NULL,
    `proposalDate` VARCHAR(10) NOT NULL,
    `situationDocument` VARCHAR(191) NOT NULL DEFAULT '1',
    `policyNumber` VARCHAR(191) NOT NULL,
    `issueDate` VARCHAR(10) NOT NULL,
    `renewal` VARCHAR(191) NOT NULL DEFAULT '1',
    `tipoRenewal` VARCHAR(2) NOT NULL,
    `previousPolicy` VARCHAR(30) NULL,
    `previousInsuranceCompany` VARCHAR(30) NULL,
    `source` VARCHAR(20) NULL,
    `paymentMethod` VARCHAR(20) NOT NULL,
    `liquidPrize` DECIMAL(15, 2) NULL,
    `totalPrize` DECIMAL(15, 2) NULL,
    `iof` DECIMAL(15, 2) NULL,
    `commissionValue` DECIMAL(15, 2) NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `insuranceCompanyId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `producerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Policy_policyNumber_key`(`policyNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Opportunity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `stage` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `policyId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT '1',
    `role` VARCHAR(191) NOT NULL DEFAULT 'Produtor',
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `bank` VARCHAR(100) NOT NULL,
    `bankAgency` VARCHAR(10) NOT NULL,
    `bankAccount` VARCHAR(10) NOT NULL,
    `avatarUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NULL,

    UNIQUE INDEX `Producer_email_key`(`email`),
    UNIQUE INDEX `Producer_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commission` (
    `id` VARCHAR(191) NOT NULL,
    `policyId` VARCHAR(191) NOT NULL,
    `producerId` VARCHAR(191) NOT NULL,
    `value` DECIMAL(15, 2) NOT NULL,
    `paymentDate` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `percentual` DECIMAL(5, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemAutomovel` (
    `id` VARCHAR(191) NOT NULL,
    `plate` VARCHAR(10) NOT NULL,
    `chassi` VARCHAR(17) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `manufacturerYear` VARCHAR(4) NOT NULL,
    `manufacturerYearModel` VARCHAR(4) NOT NULL,
    `zeroKm` VARCHAR(1) NOT NULL,
    `bonus` DECIMAL(65, 30) NULL,
    `identificationCode` VARCHAR(10) NOT NULL,
    `fipe` VARCHAR(10) NOT NULL,
    `fuel` VARCHAR(10) NOT NULL,
    `policyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ItemAutomovel_policyId_key`(`policyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Phone` ADD CONSTRAINT `Phone_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_insuranceCompanyId_fkey` FOREIGN KEY (`insuranceCompanyId`) REFERENCES `InsuranceCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Policy` ADD CONSTRAINT `Policy_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Policy` ADD CONSTRAINT `Policy_insuranceCompanyId_fkey` FOREIGN KEY (`insuranceCompanyId`) REFERENCES `InsuranceCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Policy` ADD CONSTRAINT `Policy_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Policy` ADD CONSTRAINT `Policy_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Policy` ADD CONSTRAINT `Policy_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Policy` ADD CONSTRAINT `Policy_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `Policy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producer` ADD CONSTRAINT `Producer_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `Policy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAutomovel` ADD CONSTRAINT `ItemAutomovel_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `Policy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

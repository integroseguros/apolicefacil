-- AlterTable
ALTER TABLE `address` MODIFY `type` VARCHAR(10) NULL,
    MODIFY `street` VARCHAR(100) NULL,
    MODIFY `number` VARCHAR(191) NULL,
    MODIFY `district` VARCHAR(100) NULL,
    MODIFY `city` VARCHAR(100) NULL,
    MODIFY `state` VARCHAR(2) NULL,
    MODIFY `zipCode` VARCHAR(8) NULL;

-- AlterTable
ALTER TABLE `contact` MODIFY `type` VARCHAR(10) NULL,
    MODIFY `birthDate` VARCHAR(10) NULL,
    MODIFY `gender` VARCHAR(10) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(15) NULL,
    MODIFY `cellPhone` VARCHAR(15) NULL,
    MODIFY `position` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `customer` MODIFY `status` VARCHAR(191) NULL DEFAULT '1',
    MODIFY `socialName` VARCHAR(100) NULL,
    MODIFY `birthDate` VARCHAR(10) NULL,
    MODIFY `gender` VARCHAR(10) NULL,
    MODIFY `personType` VARCHAR(8) NULL,
    MODIFY `cnpjCpf` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `website` VARCHAR(100) NULL,
    MODIFY `clientSince` VARCHAR(7) NULL,
    MODIFY `revenue` VARCHAR(10) NULL,
    MODIFY `business` VARCHAR(100) NULL,
    MODIFY `avatarUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `itemautomovel` MODIFY `plate` VARCHAR(10) NULL,
    MODIFY `chassi` VARCHAR(17) NULL,
    MODIFY `model` VARCHAR(100) NULL,
    MODIFY `manufacturerYear` VARCHAR(4) NULL,
    MODIFY `manufacturerYearModel` VARCHAR(4) NULL,
    MODIFY `zeroKm` VARCHAR(1) NULL,
    MODIFY `identificationCode` VARCHAR(10) NULL,
    MODIFY `fipe` VARCHAR(10) NULL,
    MODIFY `fuel` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `policy` MODIFY `policyNumber` VARCHAR(191) NULL,
    MODIFY `issueDate` VARCHAR(10) NULL,
    MODIFY `paymentMethod` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `reason` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NULL DEFAULT '',
    `remark` VARCHAR(500) NULL,
    `createBy` VARCHAR(64) NULL DEFAULT '',
    `createTime` DATETIME(3) NULL,
    `delFlag` CHAR(1) NULL DEFAULT '0',
    `updateBy` VARCHAR(64) NULL DEFAULT '',
    `updateTime` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CustomerToReason` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CustomerToReason_AB_unique`(`A`, `B`),
    INDEX `_CustomerToReason_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CustomerToReason` ADD CONSTRAINT `_CustomerToReason_A_fkey` FOREIGN KEY (`A`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToReason` ADD CONSTRAINT `_CustomerToReason_B_fkey` FOREIGN KEY (`B`) REFERENCES `reason`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

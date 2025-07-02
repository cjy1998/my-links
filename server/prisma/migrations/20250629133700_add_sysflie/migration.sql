-- CreateTable
CREATE TABLE `SysFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createBy` VARCHAR(64) NULL DEFAULT '',
    `createTime` DATETIME(3) NULL,
    `delFlag` CHAR(1) NULL DEFAULT '0',
    `updateBy` VARCHAR(64) NULL DEFAULT '',
    `updateTime` DATETIME(3) NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `fileType` VARCHAR(255) NOT NULL,
    `fileSize` INTEGER NULL,
    `fileUrl` VARCHAR(255) NOT NULL,
    `remark` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

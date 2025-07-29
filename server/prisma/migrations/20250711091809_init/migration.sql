-- CreateTable
CREATE TABLE `sys_social_user` (
    `socialId` INTEGER NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(20) NOT NULL,
    `providerId` VARCHAR(100) NOT NULL,
    `userId` INTEGER NOT NULL,
    `userName` VARCHAR(30) NULL,
    `nickName` VARCHAR(30) NULL,
    `avatar` VARCHAR(255) NULL,
    `accessToken` VARCHAR(500) NULL,
    `expireTime` DATETIME(3) NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    `createBy` VARCHAR(64) NULL,
    `updateBy` VARCHAR(64) NULL,
    `remark` VARCHAR(500) NULL,

    INDEX `social_userId_index`(`userId`),
    UNIQUE INDEX `sys_social_user_provider_providerId_key`(`provider`, `providerId`),
    PRIMARY KEY (`socialId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_social_user` ADD CONSTRAINT `sys_social_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

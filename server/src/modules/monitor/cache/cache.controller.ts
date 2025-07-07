/*
 * @Author: JiangSheng 87789771@qq.com
 * @Date: 2024-05-17 11:07:10
 * @LastEditors: JiangSheng 87789771@qq.com
 * @LastEditTime: 2024-05-17 13:14:16
 * @FilePath: \meimei-new\src\modules\monitor\cache\cache.controller.ts
 * @Description:
 *
 */
import { Controller, Delete, Get, Param } from '@nestjs/common';
import { CacheService } from './cache.service';
import { DataObj } from 'src/common/class/data-obj.class';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Redis缓存相关')
@Controller('monitor/cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * 获取Redis信息
   */
  @Get()
  async getRedisInfo() {
    const redisInfo = await this.cacheService.getRedisInfo();
    return DataObj.create(redisInfo);
  }
  /**
   * 获取Redis缓存名称
   */
  @Get('getNames')
  async getNames() {
    return this.cacheService.getNames();
  }
  /**
   * 获取Redis缓存键
   */
  @Get('getKeys/:cacheName')
  async getKeys(@Param('cacheName') cacheName: string) {
    return this.cacheService.getKeys(cacheName);
  }
  /**
   * 获取Redis缓存值
   */
  @Get('getValue/:name/:key')
  async getValue(@Param('name') name: string, @Param('key') key: string) {
    const data = await this.cacheService.getValue(name, key);
    return DataObj.create(data);
  }
  /**
   * 根据缓存名称删除缓存
   */
  @Delete('clearCacheName/:cacheName')
  async clearCacheName(@Param('cacheName') cacheName: string) {
    return this.cacheService.clearCacheName(cacheName);
  }
  /**
   * 根据缓存键删除缓存
   */
  @Delete('clearCacheKey/:key')
  async clearCacheKey(@Param('key') key: string) {
    return this.cacheService.clearCacheKey(key);
  }
  /**
   * 清空Redis缓存
   */
  @Delete('clearCacheAll')
  async clearCacheAll() {
    return this.cacheService.clearCacheAll();
  }
}

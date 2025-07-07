import { Controller, Get } from '@nestjs/common';
import { DataObj } from 'src/common/class/data-obj.class';
import { ServerService } from './server.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('服务器监控')
@Controller('monitor')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  /**
   * 获取监控数据
   */
  @Get('server')
  async data() {
    const cpu = this.serverService.getCpu();
    const mem = this.serverService.getMem();
    const sys = this.serverService.getSys();
    const sysFiles = this.serverService.getSysFiles();
    const node = this.serverService.getNode();
    const promiseArr = await Promise.all([cpu, mem, sys, sysFiles, node]);
    const data = {
      cpu: promiseArr[0],
      mem: promiseArr[1],
      sys: promiseArr[2],
      sysFiles: promiseArr[3],
      node: promiseArr[4],
    };
    return DataObj.create(data);
  }
}

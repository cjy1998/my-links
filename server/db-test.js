const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'mysql://root:Cjy19980128.@39.105.220.230:3306/meimei-prisma' },
  },
});

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功!');
    const jobs = await prisma.sysJob.findMany({ take: 1 });
    console.log('✅ 数据查询成功:', jobs);
  } catch (e) {
    console.error('❌ 连接失败:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

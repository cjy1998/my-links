# 构建阶段
FROM node:20-alpine3.20 AS build
LABEL Author="mobiusy"

WORKDIR /build

RUN yarn config set registry https://registry.npmmirror.com

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn

COPY ./ ./

RUN yarn prisma generate && yarn build

# 生产镜像
FROM node:20-alpine3.20
LABEL Author="mobiusy"

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime  && echo 'Asia/Shanghai' >/etc/timezone
# 新增端口暴露指令
EXPOSE 3000

WORKDIR /opt/application

# 将生成的可执行文件copy到当前工作目录下
COPY --from=build /build/dist ./dist
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/package.json ./package.json


# 容器启动时执行的命令
CMD ["yarn", "start:prod"]

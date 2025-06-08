# 仅构建阶段 - 不包含运行环境
FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn
COPY . .
RUN yarn build

# 最终阶段 - 只包含构建产物
# FROM scratch AS export
# COPY --from=build /app/dist /dist
# 添加调试命令：验证构建输出
RUN echo "构建目录内容:" && ls -l && \
    echo "dist目录内容:" && ls -l dist && \
    echo "当前路径:" && pwd
# 生产阶段 - 使用Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html  # 重要：Nginx默认静态文件路径
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]  # 保持前台运行
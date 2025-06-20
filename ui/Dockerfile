# 构建阶段
FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# 调试：确认构建输出
RUN echo "构建输出验证:" && \
    ls -l && \
    [ -d "dist" ] && echo "dist 目录存在" || echo "错误: dist 目录不存在!" && \
    ls -l dist

# 最终阶段 - 使用Nginx
FROM nginx:alpine
# 移除默认配置（重要！避免冲突）
RUN rm -rf /etc/nginx/conf.d/default.conf

# 复制自定义配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 确保目标目录存在
RUN mkdir -p /usr/share/nginx/html

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 验证文件复制
RUN echo "Nginx 文件验证:" && \
    ls -l /usr/share/nginx/html && \
    ls -l /etc/nginx/conf.d
    
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
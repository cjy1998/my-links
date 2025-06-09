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

# 确保目标目录存在
RUN mkdir -p /usr/share/nginx/html

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 调试：确认复制构建产物
RUN echo "复制构建产物验证:" && \
    ls -l && \
    # [ -d "dist" ] && echo "dist 目录存在" || echo "错误: dist 目录不存在!" && \
    ls -l /usr/share/nginx/html
# 可选：自定义 Nginx 配置
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# 构建阶段
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --force && npm cache clean --force
COPY . .
RUN npm run build

# 生产镜像
FROM nginx:1.25-bookworm
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

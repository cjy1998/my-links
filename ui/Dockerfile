# 仅构建阶段 - 不包含运行环境
FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn
COPY . .
RUN yarn build

# 最终阶段 - 只包含构建产物
FROM scratch AS export
COPY --from=build /app/dist /dist
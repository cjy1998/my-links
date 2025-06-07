#!/bin/bash
set -e

TAG=$1

# 导出环境变量供docker-compose使用
export TAG=$TAG
export ACR_REGISTRY=${{ secrets.ACR_REGISTRY }}
export ACR_NAMESPACE=${{ secrets.ACR_NAMESPACE }}
export FRONTEND_PORT=80
export BACKEND_PORT=3000
# 拉取新镜像
docker pull ${{ secrets.ACR_REGISTRY }}/${{ secrets.ACR_NAMESPACE }}/ui:$TAG
docker pull ${{ secrets.ACR_REGISTRY }}/${{ secrets.ACR_NAMESPACE }}/server:$TAG

# 使用docker-compose部署
docker-compose -f /deploy/docker-compose.prod.yml up -d --force-recreate
# 清理旧镜像
echo "=== 清理旧镜像 ==="
docker images | grep ui | awk '{print $3}' | tail -n +4 | xargs -r docker rmi -f
docker images | grep server | awk '{print $3}' | tail -n +4 | xargs -r docker rmi -f

echo "✅ 部署完成！"
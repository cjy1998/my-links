#!/bin/bash
set -e

TAG=$1
ACR_REGISTRY=$2
ACR_NAMESPACE=$3

# 检查必要参数
if [ -z "$TAG" ] || [ -z "$ACR_REGISTRY" ] || [ -z "$ACR_NAMESPACE" ]; then
  echo "错误：缺少必要参数！"
  echo "用法: $0 <TAG> <ACR_REGISTRY> <ACR_NAMESPACE>"
  exit 1
fi

# 拉取新镜像
docker pull ${ACR_REGISTRY}/${ACR_NAMESPACE}/ui:${TAG}
docker pull ${ACR_REGISTRY}/${ACR_NAMESPACE}/server:${TAG}

# 使用环境变量部署
export TAG=${TAG}
export ACR_REGISTRY=${ACR_REGISTRY}
export ACR_NAMESPACE=${ACR_NAMESPACE}

docker-compose -f /app/deploy/deploy/docker-compose.prod.yml up -d --force-recreate

# 清理旧镜像（保留最近的3个版本）
echo "=== 清理旧镜像 ==="
docker images --filter=reference="${ACR_REGISTRY}/${ACR_NAMESPACE}/ui:*" --format "{{.ID}}" | tail -n +4 | xargs -r docker rmi -f || true
docker images --filter=reference="${ACR_REGISTRY}/${ACR_NAMESPACE}/server:*" --format "{{.ID}}" | tail -n +4 | xargs -r docker rmi -f || true

echo "✅ 部署完成！"
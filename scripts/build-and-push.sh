#!/bin/bash

# Docker 이미지 빌드 및 푸시 스크립트
# 사용법: ./scripts/build-and-push.sh [registry] [tag]

set -e

REGISTRY=${1:-localhost:5000}
IMAGE_NAME="board-frontend"
TAG=${2:-latest}
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "🔨 Docker 이미지 빌드 중..."
docker build -t ${FULL_IMAGE} .

echo "📤 이미지 푸시 중..."
docker push ${FULL_IMAGE}

echo "✅ 이미지 빌드 및 푸시 완료: ${FULL_IMAGE}"
echo ""
echo "📝 Kubernetes에서 사용하려면:"
echo "   kubectl set image deployment/board-frontend frontend=${FULL_IMAGE} -n <namespace>"


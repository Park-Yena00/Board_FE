#!/bin/bash

# 로컬 Docker 레지스트리 설정 스크립트

set -e

REGISTRY_PORT=${1:-5000}
REGISTRY_NAME="local-registry"

echo "🐳 로컬 Docker 레지스트리 설정 중..."

# 레지스트리 실행 확인
if docker ps | grep -q $REGISTRY_NAME; then
    echo "✅ 레지스트리가 이미 실행 중입니다."
    docker ps | grep $REGISTRY_NAME
    exit 0
fi

# 레지스트리 실행
echo "📦 레지스트리 컨테이너 시작 중..."
docker run -d \
  -p ${REGISTRY_PORT}:5000 \
  --name ${REGISTRY_NAME} \
  --restart=always \
  registry:2

echo "✅ 레지스트리 실행 완료!"
echo ""
echo "📝 사용 방법:"
echo "   # 이미지 태그 지정"
echo "   docker tag board-frontend:latest localhost:${REGISTRY_PORT}/board-frontend:latest"
echo ""
echo "   # 이미지 푸시"
echo "   docker push localhost:${REGISTRY_PORT}/board-frontend:latest"
echo ""
echo "   # Kubernetes에서 사용"
echo "   # deployment.yaml에서 image: localhost:${REGISTRY_PORT}/board-frontend:latest"
echo "   # imagePullPolicy: Always 또는 IfNotPresent"
echo ""

# 미니쿠베 환경 확인
if command -v minikube &> /dev/null; then
    echo "💡 미니쿠베를 사용하는 경우:"
    echo "   eval \$(minikube docker-env)"
    echo "   docker build -t board-frontend:latest ."
    echo "   # imagePullPolicy: Never 사용"
fi


#!/bin/bash

# 빠른 배포 스크립트 (VM 환경용)
# 모든 단계를 자동으로 실행

set -e

echo "🚀 빠른 배포 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 환경 확인
echo -e "${YELLOW}1. 환경 확인 중...${NC}"
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl이 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ Docker: $(docker --version)"
echo "✅ Kubernetes: $(kubectl version --client --short 2>/dev/null || echo '연결 확인 필요')"
echo ""

# 2. 이미지 빌드
echo -e "${YELLOW}2. Docker 이미지 빌드 중...${NC}"
docker build -t board-frontend:latest . || {
    echo "❌ 이미지 빌드 실패"
    exit 1
}
echo -e "${GREEN}✅ 이미지 빌드 완료${NC}"
echo ""

# 3. 로컬 레지스트리 확인 및 푸시 (선택사항)
read -p "로컬 레지스트리에 푸시하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    REGISTRY=${REGISTRY:-localhost:5000}
    echo -e "${YELLOW}3. 로컬 레지스트리에 푸시 중...${NC}"
    docker tag board-frontend:latest ${REGISTRY}/board-frontend:latest
    docker push ${REGISTRY}/board-frontend:latest || {
        echo "⚠️  레지스트리 푸시 실패 (레지스트리가 실행 중이 아닐 수 있습니다)"
    }
    echo -e "${GREEN}✅ 레지스트리 푸시 완료${NC}"
    echo ""
fi

# 4. Kubernetes 배포
echo -e "${YELLOW}4. Kubernetes 배포 중...${NC}"
kubectl apply -f k8s/configmap.yaml 2>/dev/null || echo "⚠️  ConfigMap 이미 존재하거나 생성 실패"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

echo -e "${GREEN}✅ Kubernetes 리소스 배포 완료${NC}"
echo ""

# 5. 배포 상태 확인
echo -e "${YELLOW}5. 배포 상태 확인 중...${NC}"
sleep 5

kubectl get pods -l app=board-frontend
echo ""

# 6. 롤아웃 상태 확인
echo -e "${YELLOW}6. 롤아웃 상태 확인 중...${NC}"
kubectl rollout status deployment/board-frontend --timeout=120s || {
    echo "⚠️  롤아웃이 완료되지 않았습니다. 수동으로 확인해주세요."
}

echo ""
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo ""
echo "📝 다음 명령어로 확인하세요:"
echo "   kubectl get pods,svc -l app=board-frontend"
echo "   kubectl port-forward svc/board-frontend-service 8080:80"
echo "   브라우저에서 http://localhost:8080 접속"


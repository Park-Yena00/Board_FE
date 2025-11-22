#!/bin/bash

# Kubernetes 배포 스크립트
# 사용법: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-development}
NAMESPACE="board-frontend-${ENVIRONMENT}"

echo "🚀 배포 시작: ${ENVIRONMENT} 환경"

# 네임스페이스 생성
echo "📦 네임스페이스 생성 중..."
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# ConfigMap 생성 (환경 변수)
echo "⚙️  ConfigMap 생성 중..."
kubectl create configmap board-frontend-config \
  --from-literal=VITE_API_BASE_URL=http://board-backend-service:8080/api \
  -n ${NAMESPACE} \
  --dry-run=client -o yaml | kubectl apply -f -

# Deployment 및 Service 배포
echo "📋 Deployment 및 Service 배포 중..."
kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/service.yaml -n ${NAMESPACE}

# Ingress 배포 (선택사항)
if [ -f "k8s/ingress.yaml" ]; then
  echo "🌐 Ingress 배포 중..."
  kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}
fi

# ServiceMonitor 배포 (Prometheus 연동)
if [ -f "k8s/service-monitor.yaml" ]; then
  echo "📊 ServiceMonitor 배포 중..."
  kubectl apply -f k8s/service-monitor.yaml -n ${NAMESPACE}
fi

# 배포 상태 확인
echo "⏳ 배포 상태 확인 중..."
kubectl rollout status deployment/board-frontend -n ${NAMESPACE} --timeout=300s

echo "✅ 배포 완료!"
echo ""
echo "📝 배포 정보:"
kubectl get pods,svc,ingress -n ${NAMESPACE}
echo ""
echo "🔍 Pod 로그 확인: kubectl logs -f deployment/board-frontend -n ${NAMESPACE}"


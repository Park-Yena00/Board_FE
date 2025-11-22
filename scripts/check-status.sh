#!/bin/bash

# 배포 상태 확인 스크립트

set -e

echo "📊 배포 상태 확인"
echo "=================="
echo ""

# Pod 상태
echo "🔹 Pod 상태:"
kubectl get pods -l app=board-frontend -o wide
echo ""

# Service 상태
echo "🔹 Service 상태:"
kubectl get svc -l app=board-frontend
echo ""

# Deployment 상태
echo "🔹 Deployment 상태:"
kubectl get deployment board-frontend
echo ""

# 최근 이벤트
echo "🔹 최근 이벤트:"
kubectl get events --sort-by='.lastTimestamp' | grep board-frontend | tail -5
echo ""

# 리소스 사용량
echo "🔹 리소스 사용량:"
kubectl top pods -l app=board-frontend 2>/dev/null || echo "   (metrics-server가 설치되지 않았습니다)"
echo ""

# 헬스 체크
POD_NAME=$(kubectl get pods -l app=board-frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    echo "🔹 헬스 체크:"
    kubectl exec $POD_NAME -- wget -q -O- http://localhost/health || echo "   헬스 체크 실패"
    echo ""
fi

# 메트릭 엔드포인트 (포트 포워딩 필요)
echo "💡 메트릭 확인:"
echo "   kubectl port-forward pod/$POD_NAME 8080:80"
echo "   curl http://localhost:8080/metrics"
echo ""


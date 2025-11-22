#!/bin/bash

# 모니터링 설정 스크립트
# Prometheus 및 Grafana 연동

set -e

NAMESPACE=${1:-default}

echo "📊 모니터링 설정 중..."

# ServiceMonitor 배포
if kubectl api-resources | grep -q servicemonitor; then
  echo "✅ ServiceMonitor CRD 확인됨"
  kubectl apply -f k8s/service-monitor.yaml -n ${NAMESPACE}
  echo "✅ ServiceMonitor 배포 완료"
else
  echo "⚠️  ServiceMonitor CRD가 없습니다. Prometheus Operator를 설치해주세요."
fi

# Prometheus 설정 확인
echo ""
echo "📝 Prometheus 설정 확인:"
kubectl get servicemonitor -n ${NAMESPACE}

echo ""
echo "📊 메트릭 엔드포인트 확인:"
POD_NAME=$(kubectl get pods -n ${NAMESPACE} -l app=board-frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$POD_NAME" ]; then
  echo "   kubectl port-forward pod/${POD_NAME} -n ${NAMESPACE} 8080:80"
  echo "   curl http://localhost:8080/metrics"
else
  echo "   Pod가 아직 실행되지 않았습니다."
fi

echo ""
echo "✅ 모니터링 설정 완료!"


#!/bin/bash

# 포트 포워딩 스크립트

set -e

SERVICE_NAME=${1:-board-frontend-service}
LOCAL_PORT=${2:-8080}
NAMESPACE=${3:-default}

echo "🔌 포트 포워딩 시작..."
echo "   Service: ${SERVICE_NAME}"
echo "   Local Port: ${LOCAL_PORT}"
echo "   Namespace: ${NAMESPACE}"
echo ""
echo "브라우저에서 http://localhost:${LOCAL_PORT} 접속"
echo "종료하려면 Ctrl+C"
echo ""

kubectl port-forward -n ${NAMESPACE} svc/${SERVICE_NAME} ${LOCAL_PORT}:80


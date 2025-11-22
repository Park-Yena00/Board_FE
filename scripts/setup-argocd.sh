#!/bin/bash

# ArgoCD Application 설정 스크립트
# 사용법: ./scripts/setup-argocd.sh [repo-url] [path]

set -e

REPO_URL=${1:-"https://github.com/YOUR_USERNAME/YOUR_REPO.git"}
REPO_PATH=${2:-"k8s"}
APP_NAME="board-frontend"

echo "🔧 ArgoCD Application 설정 중..."

# ArgoCD 네임스페이스 확인
if ! kubectl get namespace argocd &> /dev/null; then
  echo "❌ ArgoCD 네임스페이스가 없습니다. ArgoCD를 먼저 설치해주세요."
  exit 1
fi

# ArgoCD Application 매니페스트 업데이트
cat > /tmp/argocd-app.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${APP_NAME}
  namespace: argocd
spec:
  project: default
  source:
    repoURL: ${REPO_URL}
    targetRevision: main
    path: ${REPO_PATH}
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
  revisionHistoryLimit: 10
EOF

# Application 생성
kubectl apply -f /tmp/argocd-app.yaml

echo "✅ ArgoCD Application 생성 완료!"
echo ""
echo "📝 ArgoCD UI에서 확인:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   사용자: admin"
echo "   비밀번호: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d"


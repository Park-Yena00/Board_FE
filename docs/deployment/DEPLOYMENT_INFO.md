# 프론트엔드 배포 필수 정보
해당 문서는 프론트엔드 배포에 필요한 **참고 정보**입니다.

> 💡 **실제 배포 방법은 [상세 배포 가이드](./FRONTEND_DEPLOYMENT_GUIDE.md)를 참고하세요.**

## 📦 저장소 정보

- **Git 저장소:** `https://github.com/Park-Yena00/Board_FE.git`
- **브랜치:** `main`
- **배포 경로:** `k8s/` 디렉토리

## 🌐 도메인 정보

### 프론트엔드 도메인
- **프로덕션 URL:** `http://moodie.shop` (또는 `https://moodie.shop`)
- **로컬 테스트:** `http://localhost` (포트 포워딩 사용 시)

### 백엔드 API 도메인
- **프로덕션 URL:** `https://api.moodie.shop` (또는 `http://api.moodie.shop`)
- **ConfigMap 설정:** `k8s/configmap.yaml`에서 확인/수정

## 🖥️ VM 및 네트워크 정보

### VM 접근 정보
- **VM IP 주소:** `10.0.2.8` (실제 IP로 변경 필요)
- **SSH 접근:** 기존 백엔드 배포 시 사용한 VM과 동일

### Ingress Controller 정보
- **네임스페이스:** `mynginx`
- **HTTP NodePort:** `31655` (실제 포트로 확인 필요)
- **HTTPS NodePort:** 확인 필요

**NodePort 확인 명령어:**
```bash
kubectl get svc -n mynginx nginx-ingress-nginx-controller
```

## 🏗️ Kubernetes 정보

### 네임스페이스
- **프론트엔드:** `board-frontend`
- **백엔드:** `board-app` (기존)

### 리소스 이름
- **Deployment:** `board-frontend`
- **Service:** `board-frontend-service`
- **ConfigMap:** `board-frontend-config`
- **Ingress:** `board-frontend-ingress`

### 노드 스케줄링
- **노드 선택:** `myserver01` (control-plane 노드)
- **Taint 허용:** `node-role.kubernetes.io/control-plane:NoSchedule`

## ⚙️ 필수 설정 사항

### 1. ConfigMap 설정

`k8s/configmap.yaml` 파일에서 백엔드 API URL을 확인/수정:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: board-frontend-config
  namespace: board-frontend
data:
  VITE_API_BASE_URL: "https://api.moodie.shop"  # 백엔드 Ingress 도메인
```

**중요:**
- 백엔드 Ingress가 HTTPS를 사용하면 `https://api.moodie.shop`
- HTTP를 사용하면 `http://api.moodie.shop`
- 백엔드 Ingress 도메인과 일치해야 함

### 2. 백엔드 CORS 설정 (백엔드 팀 확인 필요)

백엔드 `WebConfig.java`에서 다음 도메인들이 허용되어 있어야 합니다:

```java
.allowedOrigins(
    "https://moodie.shop",     // 필수 (HTTPS 사용 시)
    "http://moodie.shop",      // 필수 (HTTP 사용 시)
    "http://localhost",        // 로컬 테스트 시
    "http://localhost:8080"    // kubectl port-forward 사용 시
)
```

## 🔧 배포 전 확인 사항

### 1. 사전 요구사항

- Kubernetes 클러스터 (v1.29 이상 권장)
- Docker 설치
- kubectl 설치 및 클러스터 접근 권한
- NGINX Ingress Controller 설치 (네임스페이스: `mynginx`)
- 백엔드가 이미 배포되어 있어야 함

### 2. 확인 명령어

```bash
# Kubernetes 클러스터 확인
kubectl cluster-info
kubectl get nodes

# Docker 확인
docker --version

# NGINX Ingress Controller 확인
kubectl get pods -n mynginx -l app.kubernetes.io/name=ingress-nginx

# 백엔드 서비스 확인
kubectl get svc -n board-app board-backend-service

# 백엔드 Ingress 확인
kubectl get ingress -n board-app

# 백엔드 Ingress 호스트 확인
kubectl get ingress -n board-app -o jsonpath='{.items[*].spec.rules[*].host}'
```

## 📚 배포 가이드

실제 배포 방법은 다음 문서를 참고하세요:

- **[상세 배포 가이드](./FRONTEND_DEPLOYMENT_GUIDE.md)** ⭐ **이 문서를 먼저 읽어주세요!**
  - 저장소 클론부터 배포까지 전체 과정
  - 백엔드 연동 설정
  - 접근 방법
  - 트러블슈팅

- **[빠른 배포 가이드](./QUICK_DEPLOYMENT_GUIDE.md)** - 5분 빠른 배포 요약

## 💡 추가 정보

### 네임스페이스 구조

```
board-frontend (프론트엔드)
├── Deployment: board-frontend
├── Service: board-frontend-service
├── ConfigMap: board-frontend-config
└── Ingress: board-frontend-ingress

board-app (백엔드)
├── Deployment: board-backend
├── Service: board-backend-service
└── Ingress: board-ingress
```

### 도메인 구조

- **프론트엔드:** `moodie.shop`
- **백엔드 API:** `api.moodie.shop`

### 포트 정보

- **프론트엔드:** 80 (컨테이너), 31655 (Ingress Controller NodePort)
- **백엔드:** 8080 (컨테이너), 32373 (Ingress Controller HTTPS NodePort)


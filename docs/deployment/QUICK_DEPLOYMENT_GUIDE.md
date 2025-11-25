# 빠른 배포 가이드 (요약)

백엔드 팀원을 위한 프론트엔드 빠른 배포 요약 가이드입니다.

## ⚡ 빠른 시작 (5분)

### 1. 저장소 클론 및 이미지 빌드

```bash
# 저장소 클론
cd ~/work/board
git clone https://github.com/Park-Yena00/Board_FE.git
cd Board_FE

# Docker 이미지 빌드
docker build -t board-frontend:latest .

# containerd로 이미지 import
docker save board-frontend:latest -o /tmp/board-frontend.tar
sudo ctr -n k8s.io images import /tmp/board-frontend.tar
rm -f /tmp/board-frontend.tar
```

### 2. Kubernetes 배포

```bash
# 네임스페이스 생성
kubectl create namespace board-frontend

# 모든 리소스 배포
kubectl apply -f k8s/configmap.yaml -n board-frontend
kubectl apply -f k8s/deployment.yaml -n board-frontend
kubectl apply -f k8s/ingress.yaml -n board-frontend

# 배포 상태 확인
kubectl get pods,svc,ingress -n board-frontend
```

### 3. 접근 방법

**옵션 1: 포트 포워딩 사용 (가장 간단)**

1. VirtualBox 포트 포워딩 설정:
   - 호스트 포트: `80`
   - 게스트 IP: `<VM_IP>`
   - 게스트 포트: `31655` (Ingress Controller NodePort)

2. 브라우저에서 `http://localhost` 접근

**옵션 2: 도메인 사용**

1. Windows hosts 파일에 추가:
   ```
   10.0.2.8 moodie.shop
   10.0.2.8 api.moodie.shop
   ```

2. 브라우저에서 `http://moodie.shop:31655` 접근

## ⚙️ 중요 설정

### ConfigMap 설정

`k8s/configmap.yaml`에서 백엔드 API URL 확인:

```yaml
data:
  VITE_API_BASE_URL: "https://api.moodie.shop"  # 백엔드 Ingress 도메인
```

### 백엔드 CORS 확인

백엔드 `WebConfig.java`에서 다음 도메인이 허용되어 있어야 합니다:

```java
.allowedOrigins(
    "https://moodie.shop",     // 필수
    "http://moodie.shop",      // HTTP 사용 시
    "http://localhost"         // 로컬 테스트 시
)
```

## 🔍 상태 확인

```bash
# Pod 상태
kubectl get pods -n board-frontend

# Service 상태
kubectl get svc -n board-frontend

# Ingress 상태
kubectl get ingress -n board-frontend

# Pod 로그
kubectl logs -n board-frontend -l app=board-frontend --tail=50
```

## 🐛 자주 발생하는 문제

### Pod가 시작되지 않음

```bash
# 이미지 확인 및 import
docker images | grep board-frontend
docker save board-frontend:latest -o /tmp/board-frontend.tar
sudo ctr -n k8s.io images import /tmp/board-frontend.tar
```

### CORS 오류

- 백엔드 CORS 설정에 `https://moodie.shop` 추가 확인
- ConfigMap의 `VITE_API_BASE_URL` 확인

### 접근 불가

- Ingress Controller 상태 확인: `kubectl get pods -n mynginx`
- 포트 포워딩 설정 확인
- hosts 파일 설정 확인

## 📚 상세 가이드

자세한 내용은 [프론트엔드 배포 및 백엔드 연동 가이드](./FRONTEND_DEPLOYMENT_GUIDE.md)를 참고하세요.


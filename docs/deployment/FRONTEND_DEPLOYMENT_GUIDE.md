# 프론트엔드 배포 및 백엔드 연동 가이드

이 문서는 프론트엔드를 Kubernetes에 배포하고 백엔드와 연동하는 방법을 설명합니다.

## 📋 사전 준비

### 필수 요구사항

- Kubernetes 클러스터 (v1.29 이상 권장)
- Docker 설치
- kubectl 설치 및 클러스터 접근 권한
- NGINX Ingress Controller 설치 (네임스페이스: `mynginx`)
- 백엔드가 이미 배포되어 있어야 함

### 확인 사항

```bash
# 1. Kubernetes 클러스터 확인
kubectl cluster-info
kubectl get nodes

# 2. Docker 확인
docker --version

# 3. NGINX Ingress Controller 확인
kubectl get pods -n mynginx -l app.kubernetes.io/name=ingress-nginx

# 4. 백엔드 서비스 확인
kubectl get svc -n board-app board-backend-service
```

## 🚀 배포 단계

### 1단계: 프론트엔드 저장소 클론

```bash
# 작업 디렉토리 생성
mkdir -p ~/work/board
cd ~/work/board

# 프론트엔드 저장소 클론
git clone https://github.com/Park-Yena00/Board_FE.git
cd Board_FE
```

### 2단계: Docker 이미지 빌드

```bash
# Docker 이미지 빌드
docker build -t board-frontend:latest .

# 이미지 확인
docker images | grep board-frontend

# containerd로 이미지 import (Kubernetes가 containerd를 사용하는 경우)
docker save board-frontend:latest -o /tmp/board-frontend.tar
sudo ctr -n k8s.io images import /tmp/board-frontend.tar
rm -f /tmp/board-frontend.tar

# containerd 이미지 확인
sudo ctr -n k8s.io images ls | grep board-frontend
```

### 3단계: Kubernetes 리소스 배포

#### 3-1. 네임스페이스 생성

```bash
kubectl create namespace board-frontend
```

#### 3-2. ConfigMap 배포

`k8s/configmap.yaml` 파일을 확인하고 백엔드 API URL을 설정합니다:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: board-frontend-config
  namespace: board-frontend
  labels:
    app: board-frontend
data:
  VITE_API_BASE_URL: "https://api.moodie.shop"
```

**중요:** 백엔드 Ingress가 HTTPS를 사용하는 경우 `https://api.moodie.shop`을 사용하고, HTTP를 사용하는 경우 `http://api.moodie.shop`을 사용하세요.

```bash
# ConfigMap 배포
kubectl apply -f k8s/configmap.yaml -n board-frontend

# ConfigMap 확인
kubectl get configmap board-frontend-config -n board-frontend -o yaml
```

#### 3-3. Deployment 및 Service 배포

```bash
# Deployment 및 Service 배포
kubectl apply -f k8s/deployment.yaml -n board-frontend

# 배포 상태 확인
kubectl get pods -n board-frontend
kubectl get svc -n board-frontend
```

**주의사항:**
- `k8s/deployment.yaml`의 `nodeSelector`와 `tolerations`는 클러스터 환경에 맞게 수정해야 할 수 있습니다.
- Docker 이미지가 특정 노드에만 있는 경우 `nodeSelector`를 설정해야 합니다.

#### 3-4. Ingress 배포

```bash
# Ingress 배포
kubectl apply -f k8s/ingress.yaml -n board-frontend

# Ingress 확인
kubectl get ingress -n board-frontend
kubectl describe ingress board-frontend-ingress -n board-frontend
```

### 4단계: 배포 상태 확인

```bash
#!/bin/bash
echo "=== 배포 상태 확인 ==="
echo ""

# 1. Pod 상태
echo "1. Pod 상태:"
kubectl get pods -n board-frontend

# 2. Service 상태
echo ""
echo "2. Service 상태:"
kubectl get svc -n board-frontend

# 3. Ingress 상태
echo ""
echo "3. Ingress 상태:"
kubectl get ingress -n board-frontend

# 4. Pod 로그 확인
echo ""
echo "4. Pod 로그 확인:"
FRONTEND_POD=$(kubectl get pods -n board-frontend -l app=board-frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_POD" ]; then
    kubectl logs $FRONTEND_POD -n board-frontend --tail=20
fi

echo ""
echo "✅ 확인 완료!"
```

## 🔗 백엔드 연동 설정

### 1. 백엔드 Ingress 확인

백엔드가 이미 배포되어 있다면 Ingress를 확인하세요:

```bash
# 백엔드 Ingress 확인
kubectl get ingress -n board-app

# 백엔드 Ingress 상세 정보
kubectl describe ingress board-ingress -n board-app
```

### 2. ConfigMap 설정

백엔드 API URL에 맞게 ConfigMap을 설정합니다:

**옵션 1: 백엔드 Ingress를 통한 접근 (권장)**

```yaml
# k8s/configmap.yaml
data:
  VITE_API_BASE_URL: "https://api.moodie.shop"  # 백엔드 Ingress 도메인
```

**옵션 2: Kubernetes 내부 Service를 통한 접근**

```yaml
# k8s/configmap.yaml
data:
  VITE_API_BASE_URL: "http://board-backend-service.board-app.svc.cluster.local:8080"
```

**주의:** Kubernetes 내부 Service를 사용하는 경우 프론트엔드 Pod에서만 접근 가능합니다. 브라우저에서는 접근할 수 없으므로 Ingress를 통한 접근을 권장합니다.

### 3. ConfigMap 재적용

```bash
# ConfigMap 수정 후 재적용
kubectl apply -f k8s/configmap.yaml -n board-frontend

# 프론트엔드 Pod 재시작 (새로운 환경 변수 적용)
kubectl delete pods -n board-frontend -l app=board-frontend

# 상태 확인 (30초 대기)
sleep 30
kubectl get pods -n board-frontend
```

## 🌐 접근 방법

### 방법 1: Ingress를 통한 접근 (프로덕션)

#### 1-1. Ingress Controller 정보 확인

```bash
# Ingress Controller Service 확인
kubectl get svc -n mynginx nginx-ingress-nginx-controller

# NodePort 확인
NODE_PORT=$(kubectl get svc -n mynginx nginx-ingress-nginx-controller -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}')
echo "HTTP NodePort: $NODE_PORT"
```

#### 1-2. 도메인 설정

**Windows 호스트에서:**

1. `C:\Windows\System32\drivers\etc\hosts` 파일을 관리자 권한으로 열기
2. 다음 추가:
   ```
   10.0.2.8 moodie.shop
   10.0.2.8 api.moodie.shop
   ```
   (VM IP 주소는 실제 IP로 변경)
3. DNS 캐시 초기화:
   ```cmd
   ipconfig /flushdns
   ```

#### 1-3. 브라우저에서 접근

- `http://moodie.shop:31655` (NodePort 직접 사용)
- 또는 포트 포워딩 설정 후 `http://moodie.shop`

### 방법 2: 포트 포워딩을 통한 접근 (개발/테스트)

#### 2-1. VirtualBox 포트 포워딩 설정

1. VirtualBox → VM 선택 → 설정 → 네트워크 → 어댑터 1 → 고급 → 포트 포워딩
2. 규칙 추가:
   - 규칙 이름: `frontend`
   - 프로토콜: `TCP`
   - 호스트 포트: `80`
   - 게스트 IP: `<VM_IP>` (예: `10.0.2.8`)
   - 게스트 포트: `<Ingress_Controller_NodePort>` (예: `31655`)

#### 2-2. 브라우저에서 접근

- `http://localhost` (포트 포워딩 사용 시)

### 방법 3: kubectl port-forward (임시 테스트)

```bash
# 프론트엔드 Service에 포트 포워딩
kubectl port-forward -n board-frontend svc/board-frontend-service 8080:80
```

브라우저에서 `http://localhost:8080` 접근

## ✅ 연동 확인

### 1. 프론트엔드 접근 확인

브라우저에서 프론트엔드 페이지가 정상적으로 로드되는지 확인합니다.

### 2. API 호출 확인

브라우저 개발자 도구(F12) → Network 탭에서:

1. API 호출이 `https://api.moodie.shop` (또는 설정한 URL)으로 가는지 확인
2. CORS 오류가 없는지 확인
3. 응답이 정상적으로 오는지 확인

### 3. 백엔드 연결 테스트

VM에서:

```bash
# 프론트엔드 Pod에서 백엔드 API 테스트
FRONTEND_POD=$(kubectl get pods -n board-frontend -l app=board-frontend -o jsonpath='{.items[0].metadata.name}')
kubectl exec $FRONTEND_POD -n board-frontend -- curl -s http://api.moodie.shop/api/posts?page=0&size=10
```

## 🔧 백엔드 CORS 설정 확인

프론트엔드 도메인이 백엔드 CORS 설정에 포함되어 있는지 확인하세요.

백엔드 `WebConfig.java`에서 다음 도메인들이 허용되어 있어야 합니다:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "https://moodie.shop",        // 프론트엔드 도메인
                    "https://www.moodie.shop",    // www 포함
                    "http://moodie.shop",         // HTTP (개발 환경)
                    "http://localhost"            // 로컬 개발 (선택사항)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 🐛 트러블슈팅

### 문제 진단 체크리스트: http://moodie.shop 접근 불가

`http://moodie.shop`에서 사이트가 열리지 않을 때 다음을 순서대로 확인하세요:

#### 1단계: 프론트엔드 Pod 상태 확인

```bash
# Pod 상태 확인
kubectl get pods -n board-frontend

# 정상 상태: READY 1/1, STATUS Running
# 문제 상태: Pending, CrashLoopBackOff, ErrImageNeverPull 등
```

**문제 발견 시:**
- `ErrImageNeverPull`: Docker 이미지가 없음 → 이미지 빌드 및 import 필요
- `CrashLoopBackOff`: Pod가 계속 재시작됨 → 로그 확인 필요
- `Pending`: 스케줄링 실패 → nodeSelector/tolerations 확인

#### 2단계: Ingress Controller 상태 확인

```bash
# Ingress Controller Pod 확인
kubectl get pods -n mynginx -l app.kubernetes.io/name=ingress-nginx

# 정상 상태: READY 1/1, STATUS Running
# 문제 상태: CrashLoopBackOff, Pending 등
```

**문제 발견 시:**
- Ingress Controller가 실행되지 않으면 Ingress가 작동하지 않음
- 로그 확인: `kubectl logs <ingress-pod> -n mynginx --tail=50`

#### 3단계: Ingress 설정 확인

```bash
# Ingress 상태 확인
kubectl get ingress -n board-frontend

# Ingress 상세 정보
kubectl describe ingress board-frontend-ingress -n board-frontend
```

**확인 사항:**
- `ADDRESS` 필드가 채워져 있는지
- `Rules`에 `moodie.shop` 호스트가 있는지
- `Backends`에 프론트엔드 Service가 연결되어 있는지

#### 4단계: 네트워크 설정 확인

```bash
# Ingress Controller NodePort 확인
NODE_PORT=$(kubectl get svc -n mynginx nginx-ingress-nginx-controller -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}')
echo "NodePort: $NODE_PORT"

# VM IP 확인
VM_IP=$(hostname -I | awk '{print $1}')
echo "VM IP: $VM_IP"
```

**확인 사항:**
- 포트 포워딩이 올바르게 설정되어 있는지
- Windows hosts 파일이 올바르게 설정되어 있는지

#### 5단계: 직접 접근 테스트

```bash
# VM에서 직접 접근 테스트
NODE_PORT=$(kubectl get svc -n mynginx nginx-ingress-nginx-controller -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}')
curl -H "Host: moodie.shop" http://localhost:$NODE_PORT

# 프론트엔드 Pod에서 직접 접근 테스트
FRONTEND_POD=$(kubectl get pods -n board-frontend -l app=board-frontend -o jsonpath='{.items[0].metadata.name}')
kubectl exec $FRONTEND_POD -n board-frontend -- curl -s http://localhost | head -20
```

**결과 분석:**
- VM에서 접근 성공 → 네트워크/포트 포워딩 문제
- VM에서 접근 실패 → 프론트엔드/Ingress 설정 문제

#### 6단계: 로그 확인

```bash
# 프론트엔드 Pod 로그
kubectl logs -n board-frontend -l app=board-frontend --tail=50

# Ingress Controller 로그
INGRESS_POD=$(kubectl get pods -n mynginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}')
kubectl logs $INGRESS_POD -n mynginx --tail=50 | grep -E "(moodie|404|error)"
```

### 문제 1: Pod가 시작되지 않음

**증상:** `ErrImageNeverPull` 또는 `ImagePullBackOff`

**해결 방법:**

```bash
# 1. Docker 이미지 확인
docker images | grep board-frontend

# 2. containerd로 이미지 import
docker save board-frontend:latest -o /tmp/board-frontend.tar
sudo ctr -n k8s.io images import /tmp/board-frontend.tar

# 3. Pod 재시작
kubectl delete pods -n board-frontend -l app=board-frontend
```

### 문제 2: Pod가 특정 노드에 스케줄링되지 않음

**증상:** Pod가 `Pending` 상태

**해결 방법:**

`k8s/deployment.yaml`의 `nodeSelector`를 확인하고 수정:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        kubernetes.io/hostname: myserver01  # 실제 노드 이름으로 변경
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
```

### 문제 3: CORS 오류

**증상:** 브라우저에서 `Access-Control-Allow-Origin` 오류

**해결 방법:**

1. 백엔드 CORS 설정에 프론트엔드 도메인 추가
2. ConfigMap의 `VITE_API_BASE_URL` 확인
3. 프론트엔드와 백엔드가 같은 프로토콜(HTTP/HTTPS) 사용하는지 확인

### 문제 4: Ingress가 작동하지 않음

**증상:** `404 Not Found` 또는 접근 불가

**해결 방법:**

```bash
# 1. Ingress Controller 확인
kubectl get pods -n mynginx -l app.kubernetes.io/name=ingress-nginx

# 2. Ingress 설정 확인
kubectl describe ingress board-frontend-ingress -n board-frontend

# 3. Ingress Class 확인
kubectl get ingressclass

# 4. Ingress Controller 로그 확인
INGRESS_POD=$(kubectl get pods -n mynginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}')
kubectl logs $INGRESS_POD -n mynginx --tail=50
```

### 문제 5: API 호출이 실패함

**증상:** `INTERNAL_SERVER_ERROR` 또는 연결 실패

**해결 방법:**

```bash
# 1. 백엔드 Pod 상태 확인
kubectl get pods -n board-app -l app=board-backend

# 2. 백엔드 로그 확인
BACKEND_POD=$(kubectl get pods -n board-app -l app=board-backend -o jsonpath='{.items[0].metadata.name}')
kubectl logs $BACKEND_POD -n board-app --tail=100

# 3. 백엔드 Service 확인
kubectl get svc -n board-app board-backend-service

# 4. 백엔드 Ingress 확인
kubectl get ingress -n board-app
```

## 📝 배포 체크리스트

배포 전 확인 사항:

- [ ] Docker 이미지 빌드 완료
- [ ] containerd로 이미지 import 완료
- [ ] ConfigMap에 올바른 백엔드 API URL 설정
- [ ] Deployment의 `nodeSelector` 및 `tolerations` 설정 확인
- [ ] Ingress 설정 확인 (도메인, Ingress Class)
- [ ] 백엔드 Ingress가 배포되어 있는지 확인
- [ ] 백엔드 CORS 설정에 프론트엔드 도메인 포함 확인

배포 후 확인 사항:

- [ ] 프론트엔드 Pod가 `Running` 상태이고 `READY 1/1`
- [ ] Service가 정상적으로 생성됨
- [ ] Ingress가 정상적으로 생성되고 `ADDRESS`가 할당됨
- [ ] 브라우저에서 프론트엔드 접근 가능
- [ ] API 호출이 정상적으로 작동
- [ ] CORS 오류 없음

## 🔄 업데이트 방법

프론트엔드 코드가 업데이트된 경우:

```bash
# 1. 최신 코드 pull
cd ~/work/board/Board_FE
git pull

# 2. Docker 이미지 재빌드
docker build -t board-frontend:latest .

# 3. containerd로 이미지 import
docker save board-frontend:latest -o /tmp/board-frontend.tar
sudo ctr -n k8s.io images import /tmp/board-frontend.tar
rm -f /tmp/board-frontend.tar

# 4. Deployment 롤아웃 재시작
kubectl rollout restart deployment/board-frontend -n board-frontend

# 5. 상태 확인
kubectl rollout status deployment/board-frontend -n board-frontend
```

## 📚 관련 문서

- [백엔드 연동 가이드](../backend/BACKEND_INTEGRATION.md)
- [트러블슈팅 가이드](./TROUBLESHOOTING.md)
- [ArgoCD 통합 가이드](./GITHUB_ACTIONS_ARGOCD_INTEGRATION.md)

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

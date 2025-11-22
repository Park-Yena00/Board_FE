# 배포 가이드

이 가이드는 VirtualBox Ubuntu VM 환경에서 프론트엔드를 배포하는 방법을 설명합니다.

## 사전 준비

### 1. VM 접속 방법

#### 방법 A: SSH 접속 (권장)

Windows PowerShell에서:

```powershell
# VM IP 주소 확인 (VM 네트워크 설정에서 확인)
ssh username@vm-ip-address

# 예시
ssh ubuntu@192.168.56.101
```

#### 방법 B: VirtualBox 직접 접속

VirtualBox에서 VM을 시작하고 직접 로그인

### 2. 프로젝트 파일 전송

#### 방법 A: Git 사용 (권장)

VM에서:

```bash
# Git 설치 확인
git --version

# 저장소 클론
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd Board_FE
```

#### 방법 B: SCP 사용

Windows PowerShell에서:

```powershell
# 프로젝트 폴더를 VM으로 전송
scp -r C:\Users\woori\Desktop\Board_FE username@vm-ip:/home/username/
```

### 3. VM 접속 및 환경 확인

```bash
# VM에 SSH 접속 또는 직접 접속
ssh user@vm-ip

# Kubernetes 클러스터 확인
kubectl cluster-info
kubectl get nodes

# Docker 확인
docker --version
docker ps

# ArgoCD 확인 (설치되어 있다면)
kubectl get pods -n argocd

# Node.js 확인 (개발용)
node --version
npm --version
```

### 4. 포트 포워딩 설정 (VirtualBox)

백엔드와 프론트엔드 연동만 필요한 경우 **최소 2개 포트**만 설정하면 됩니다:

#### 필수 포트 (2개)

1. **Frontend (3000 → 80)**
   - 브라우저에서 프론트엔드 접근
   - 프로토콜: TCP
   - 호스트 포트: 3000
   - 게스트 IP: [VM IP 주소]
   - 게스트 포트: 80

2. **Backend API (8080 → 8080)**
   - Swagger 문서 확인용
   - 프론트엔드가 브라우저에서 직접 API 호출하는 경우 필요
   - 프로토콜: TCP
   - 호스트 포트: 8080
   - 게스트 IP: [VM IP 주소]
   - 게스트 포트: 8080

#### 포트 포워딩 설정 방법

1. VirtualBox에서 VM 선택
2. 설정 > 네트워크 > 어댑터 1 > 고급 > 포트 포워딩
3. 위의 2개 규칙 추가

#### 접근 방법

- **프론트엔드**: http://localhost:3000
- **백엔드 Swagger**: http://localhost:8080/swagger-ui.html (선택사항)

**참고**: Kubernetes 내부 통신의 경우 백엔드 포트 포워딩이 필수는 아닙니다. VM 내부에서 Service를 통해 자동으로 통신합니다.

### 5. 로컬 Docker 레지스트리 설정 (선택사항)

로컬에서 이미지를 빌드하고 사용하는 경우:

```bash
# 로컬 레지스트리 실행 (포트 5000)
docker run -d -p 5000:5000 --name registry registry:2

# 또는 미니쿠베의 레지스트리 사용
# minikube addons enable registry
```

## 배포 방법

### 방법 1: 직접 Kubernetes 배포

#### 1단계: 프로젝트 클론 및 이동

```bash
# Windows에서 VM으로 파일 전송 (또는 Git 사용)
# 방법 A: Git 사용
git clone <your-repo-url>
cd Board_FE

# 방법 B: SCP 사용 (Windows PowerShell)
# scp -r C:\Users\woori\Desktop\Board_FE user@vm-ip:/home/user/
```

#### 2단계: Docker 이미지 빌드

```bash
# 이미지 빌드
docker build -t board-frontend:latest .

# 로컬 레지스트리에 푸시 (선택사항)
docker tag board-frontend:latest localhost:5000/board-frontend:latest
docker push localhost:5000/board-frontend:latest

# 또는 미니쿠베 레지스트리 사용
# eval $(minikube docker-env)
# docker build -t board-frontend:latest .
```

#### 3단계: Kubernetes 배포

```bash
# 스크립트에 실행 권한 부여
chmod +x scripts/*.sh

# 배포 실행
./scripts/deploy.sh

# 또는 수동 배포
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/configmap.yaml
```

#### 4단계: 배포 확인

```bash
# Pod 상태 확인
kubectl get pods -l app=board-frontend

# Service 확인
kubectl get svc board-frontend-service

# 로그 확인
kubectl logs -f deployment/board-frontend

# 포트 포워딩으로 접속 테스트
kubectl port-forward svc/board-frontend-service 8080:80
# 브라우저에서 http://localhost:8080 접속
```

### 방법 2: ArgoCD를 통한 GitOps 배포

#### 1단계: GitHub 저장소에 코드 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2단계: ArgoCD Application 생성

```bash
# 저장소 URL과 경로를 실제 값으로 수정
./scripts/setup-argocd.sh https://github.com/YOUR_USERNAME/YOUR_REPO.git k8s

# 또는 수동 생성
kubectl apply -f k8s/argocd-application.yaml
```

#### 3단계: ArgoCD UI에서 확인

```bash
# ArgoCD 서버 포트 포워딩
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 브라우저에서 접속
# https://localhost:8080
# 사용자: admin
# 비밀번호 확인:
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 방법 3: GitHub Actions를 통한 CI/CD

#### 1단계: GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서:

- `REGISTRY`: Docker 레지스트리 주소 (예: `ghcr.io` 또는 `localhost:5000`)
- `KUBECONFIG`: Kubernetes 설정 파일 내용 (base64 인코딩)

#### 2단계: 워크플로우 수정

`.github/workflows/ci-cd.yml` 파일에서 레지스트리 주소를 실제 환경에 맞게 수정:

```yaml
env:
  REGISTRY: localhost:5000  # 또는 실제 레지스트리 주소
  IMAGE_NAME: board-frontend
```

#### 3단계: 자동 배포

`main` 브랜치에 push하면 자동으로:
1. 코드 빌드
2. Docker 이미지 생성 및 푸시
3. Kubernetes 매니페스트 업데이트

### 방법 4: GitHub Actions + ArgoCD 통합 (권장)

GitHub Actions와 ArgoCD를 함께 사용하는 것이 **권장되는 일반적인 패턴**입니다.

**역할 분담:**
- **GitHub Actions (CI)**: 코드 빌드, 테스트, Docker 이미지 생성 및 푸시
- **ArgoCD (CD)**: GitOps 기반 자동 배포

#### 1단계: GitHub Actions 설정 (이미 완료)

`.github/workflows/ci-cd.yml`이 자동으로:
1. Docker 이미지를 빌드하고 레지스트리에 푸시
2. `k8s/deployment.yaml`의 이미지 태그를 업데이트
3. 변경사항을 GitHub에 커밋

#### 2단계: ArgoCD Application 생성

```bash
# argocd-application.yaml이 이미 설정되어 있음
# 저장소 URL만 확인 필요
kubectl apply -f k8s/argocd-application.yaml

# ArgoCD UI에서 확인
kubectl port-forward svc/argocd-server -n argocd 8080:443
# 브라우저: https://localhost:8080
```

#### 3단계: 자동 워크플로우

`main` 브랜치에 push하면:
1. **GitHub Actions**가 이미지를 빌드하고 `deployment.yaml` 업데이트
2. **ArgoCD**가 변경사항을 감지하고 Kubernetes에 자동 배포

**자세한 내용**: [GitHub Actions와 ArgoCD 통합 가이드](./GITHUB_ACTIONS_ARGOCD_INTEGRATION.md)

#### 백엔드와 ArgoCD 사용

**같은 ArgoCD를 사용하는 것이 권장됩니다.**

ArgoCD는 하나의 클러스터에서 여러 애플리케이션을 관리할 수 있습니다:

```
ArgoCD (하나의 인스턴스)
├─ board-backend Application
│  └─ 저장소: https://github.com/Suehyun666/Board_BE.git
│
└─ board-frontend Application
   └─ 저장소: https://github.com/Park-Yena00/Board_FE.git
```

각각 다른 Application으로 관리하되, 같은 ArgoCD 인스턴스를 사용합니다.

## 모니터링 설정

### Prometheus 연동

```bash
# ServiceMonitor 배포
./scripts/setup-monitoring.sh

# 또는 수동 배포
kubectl apply -f k8s/service-monitor.yaml
```

### 메트릭 확인

```bash
# Pod 포트 포워딩
POD_NAME=$(kubectl get pods -l app=board-frontend -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward pod/$POD_NAME 8080:80

# 메트릭 확인
curl http://localhost:8080/metrics
```

### Grafana 대시보드 (선택사항)

Grafana가 설치되어 있다면:
1. Prometheus를 데이터 소스로 추가
2. ServiceMonitor를 통해 자동으로 메트릭 수집
3. 대시보드 생성

## 트러블슈팅

### 이미지 Pull 실패

```bash
# 이미지 Pull 정책 확인
kubectl get deployment board-frontend -o yaml | grep imagePullPolicy

# 로컬 이미지 사용 시
# deployment.yaml에서 imagePullPolicy: Never로 변경
```

### Pod가 시작되지 않음

```bash
# Pod 이벤트 확인
kubectl describe pod <pod-name>

# 로그 확인
kubectl logs <pod-name>

# ConfigMap 확인
kubectl get configmap board-frontend-config -o yaml
```

### 서비스 연결 실패

```bash
# Service 엔드포인트 확인
kubectl get endpoints board-frontend-service

# 백엔드 서비스 확인
kubectl get svc board-backend-service

# DNS 확인
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup board-backend-service
```

## 업데이트 및 롤백

### 수동 업데이트

```bash
# 새 이미지 빌드
docker build -t board-frontend:v2 .

# Deployment 업데이트
kubectl set image deployment/board-frontend frontend=board-frontend:v2

# 롤아웃 상태 확인
kubectl rollout status deployment/board-frontend
```

### 롤백

```bash
# 이전 버전으로 롤백
kubectl rollout undo deployment/board-frontend

# 특정 리비전으로 롤백
kubectl rollout undo deployment/board-frontend --to-revision=2
```

## 네트워크 설정

### Ingress 설정

```bash
# Ingress Controller 확인
kubectl get ingressclass

# Ingress 배포
kubectl apply -f k8s/ingress.yaml

# Ingress 확인
kubectl get ingress
```

### 외부 접근 설정

```bash
# NodePort로 변경 (테스트용)
kubectl patch svc board-frontend-service -p '{"spec":{"type":"NodePort"}}'
kubectl get svc board-frontend-service

# 또는 LoadBalancer 사용 (클라우드 환경)
kubectl patch svc board-frontend-service -p '{"spec":{"type":"LoadBalancer"}}'
```

## 성능 최적화

### 리소스 조정

`k8s/deployment.yaml`에서 리소스 제한 조정:

```yaml
resources:
  requests:
    memory: "128Mi"  # 필요에 따라 증가
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### 레플리카 수 조정

```bash
# 레플리카 수 증가
kubectl scale deployment board-frontend --replicas=3

# 또는 deployment.yaml에서 수정
```

## 정리

```bash
# 모든 리소스 삭제
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/configmap.yaml

# 네임스페이스 전체 삭제
kubectl delete namespace board-frontend-development
```


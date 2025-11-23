# GitHub Actions와 ArgoCD 통합 가이드

## 개요

GitHub Actions와 ArgoCD를 함께 사용하는 것은 **권장되는 일반적인 패턴**입니다. 각각의 역할은 다음과 같습니다:

- **GitHub Actions (CI)**: 코드 빌드, 테스트, Docker 이미지 생성 및 푸시
- **ArgoCD (CD)**: GitOps 기반 자동 배포

## 함께 사용 가능 여부

### ✅ 네, 함께 사용할 수 있습니다!

GitHub Actions와 ArgoCD는 서로 다른 역할을 하므로 **함께 사용하는 것이 권장**됩니다.

### 역할 분담

```
개발자 → Git Push
    ↓
GitHub Actions (CI)
    ├─ 코드 빌드
    ├─ 테스트 실행
    ├─ Docker 이미지 생성
    └─ 이미지를 레지스트리에 푸시
    ↓
GitHub 저장소 (k8s/ 디렉토리)
    ├─ deployment.yaml 업데이트 (새 이미지 태그)
    └─ 변경사항 커밋
    ↓
ArgoCD (CD)
    ├─ Git 저장소 모니터링
    ├─ 변경사항 감지
    └─ Kubernetes에 자동 배포
```

## 통합 설정 방법

### 1단계: GitHub Actions 워크플로우 확인

`.github/workflows/ci-cd.yml`이 이미 설정되어 있습니다:

```yaml
- name: Update Kubernetes manifests
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: |
    sed -i "s|image: board-frontend:latest|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}|g" k8s/deployment.yaml

- name: Commit updated manifests
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: |
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git add k8s/deployment.yaml
    git diff --staged --quiet || git commit -m "Update deployment image [skip ci]"
    git push
```

이 워크플로우는:
1. Docker 이미지를 빌드하고 레지스트리에 푸시
2. `k8s/deployment.yaml`의 이미지 태그를 업데이트
3. 변경사항을 GitHub에 커밋

### 2단계: ArgoCD Application 설정

`k8s/argocd-application.yaml`을 수정:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: board-frontend
  namespace: myargocd  # ArgoCD가 설치된 네임스페이스
spec:
  project: default
  source:
    repoURL: https://github.com/Park-Yena00/Board_FE.git  # 실제 저장소 URL
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: board-frontend  # 프론트엔드 애플리케이션이 배포될 네임스페이스
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
  revisionHistoryLimit: 10
```

### 3단계: ArgoCD Application 생성

```bash
# argocd-application.yaml 수정 후
kubectl apply -f k8s/argocd-application.yaml

# ArgoCD UI에서 확인
kubectl port-forward svc/argocd-server -n myargocd 8080:443
# 브라우저: https://localhost:8080
```

## 백엔드와 ArgoCD 사용

### 같은 ArgoCD 사용 (권장)

**네, 같은 ArgoCD를 사용하는 것이 일반적입니다.**

ArgoCD는 하나의 클러스터에서 여러 애플리케이션을 관리할 수 있습니다:

```
ArgoCD (하나의 인스턴스)
├─ board-backend Application
│  ├─ 저장소: https://github.com/Suehyun666/Board_BE.git
│  └─ 경로: k8s/
│
└─ board-frontend Application
   ├─ 저장소: https://github.com/Park-Yena00/Board_FE.git
   └─ 경로: k8s/
```

### 장점

1. **통합 관리**: 하나의 UI에서 백엔드와 프론트엔드 모두 관리
2. **리소스 효율**: 하나의 ArgoCD 인스턴스로 충분
3. **일관성**: 같은 GitOps 워크플로우 적용

### 설정 방법

#### 백엔드 ArgoCD Application (예시)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: board-backend
  namespace: myargocd  # ArgoCD가 설치된 네임스페이스
spec:
  project: default
  source:
    repoURL: https://github.com/Suehyun666/Board_BE.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

#### 프론트엔드 ArgoCD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: board-frontend
  namespace: myargocd  # ArgoCD가 설치된 네임스페이스
spec:
  project: default
  source:
    repoURL: https://github.com/Park-Yena00/Board_FE.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: board-frontend  # 프론트엔드 애플리케이션이 배포될 네임스페이스
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## 전체 워크플로우

### 개발자 작업 흐름

```bash
# 1. 코드 수정
git add .
git commit -m "새 기능 추가"
git push origin main

# 2. GitHub Actions 자동 실행
#    - 코드 빌드
#    - Docker 이미지 생성 및 푸시
#    - k8s/deployment.yaml 업데이트

# 3. ArgoCD 자동 감지 및 배포
#    - Git 변경사항 감지
#    - Kubernetes에 자동 배포
```

### ArgoCD UI에서 확인

1. **ArgoCD 접속**
   ```
   https://argocd.moodie.shop/
   ```

2. **Application 목록 확인**
   - `board-backend`: 백엔드 애플리케이션
   - `board-frontend`: 프론트엔드 애플리케이션

3. **상태 확인**
   - 각 Application의 Sync 상태
   - Health 상태
   - 리소스 상태

## 설정 체크리스트

### GitHub Actions 설정

- [ ] `.github/workflows/ci-cd.yml` 파일 존재
- [ ] GitHub Secrets 설정 (필요한 경우)
- [ ] Docker 레지스트리 설정 확인
- [ ] 이미지 태그 업데이트 로직 확인

### ArgoCD 설정

- [ ] ArgoCD 설치 확인
  ```bash
  kubectl get pods -n myargocd
  ```

- [ ] ArgoCD Application 생성
  ```bash
  kubectl apply -f k8s/argocd-application.yaml
  ```

- [ ] ArgoCD UI 접속 확인
  ```bash
  kubectl port-forward svc/argocd-server -n myargocd 8080:443
  ```

- [ ] Git 저장소 접근 권한 확인
  - Private 저장소인 경우 ArgoCD에 인증 정보 설정 필요

## 트러블슈팅

### ArgoCD가 변경사항을 감지하지 못함

```bash
# ArgoCD Application 새로고침
kubectl patch application board-frontend -n myargocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"main"}}}'

# 또는 ArgoCD UI에서 "Refresh" 버튼 클릭
```

### GitHub Actions가 이미지를 푸시했지만 ArgoCD가 업데이트하지 않음

1. **deployment.yaml 확인**
   ```bash
   git log k8s/deployment.yaml
   # 최신 커밋에 이미지 태그가 업데이트되었는지 확인
   ```

2. **ArgoCD Sync 상태 확인**
   ```bash
   kubectl get application board-frontend -n myargocd -o yaml
   ```

3. **수동 Sync**
   ```bash
   # ArgoCD UI에서 "Sync" 버튼 클릭
   # 또는 CLI 사용
   argocd app sync board-frontend
   ```

## 요약

1. **GitHub Actions와 ArgoCD 함께 사용**: ✅ 권장
2. **백엔드와 프론트엔드**: 같은 ArgoCD 사용 ✅ 권장
3. **역할 분담**:
   - GitHub Actions: CI (빌드, 테스트, 이미지 생성)
   - ArgoCD: CD (GitOps 기반 배포)

## 다음 단계

1. `k8s/argocd-application.yaml` 수정 (저장소 URL)
2. ArgoCD Application 생성
3. GitHub에 push하여 전체 워크플로우 테스트


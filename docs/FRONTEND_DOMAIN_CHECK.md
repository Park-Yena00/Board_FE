# 프로덕션 환경 프론트엔드 도메인 확인 방법

프로덕션 환경에서 프론트엔드 도메인을 확인하는 방법을 설명합니다.

## ⚠️ 중요: `.env` 파일은 백엔드 API URL 설정용

`.env` 파일의 `VITE_API_BASE_URL`은 **백엔드 API URL**을 설정하는 것이지, 프론트엔드 도메인을 설정하는 것이 아닙니다.

```env
# 이것은 백엔드 API URL입니다 (프론트엔드 도메인이 아님)
VITE_API_BASE_URL=https://api.moodie.shop
```

## 🔍 프론트엔드 도메인 확인 방법

### 방법 1: Kubernetes Ingress 확인 (권장)

프로덕션 환경에서 실제 배포된 Ingress를 확인합니다:

```bash
# Ingress 리소스 확인
kubectl get ingress

# 배포 전: 아무것도 나오지 않거나 "No resources found" 메시지
# 배포 후: Ingress 리소스 목록이 표시됨

# 상세 정보 확인 (배포 후)
kubectl describe ingress board-frontend-ingress

# 출력 예시 (배포 후):
# Name:             board-frontend-ingress
# Host:             moodie.shop
# Address:          192.168.1.100
```

**⚠️ 주의:**
- **배포 전**: `kubectl get ingress` 실행 시 아무것도 나오지 않거나 "No resources found" 메시지가 표시됩니다. 이는 정상입니다.
- **배포 후**: `kubectl apply -f k8s/ingress.yaml` 명령어로 Ingress를 배포한 후에만 확인 가능합니다.

**현재 설정 확인:**
- `k8s/ingress.yaml` 파일에서 `host: board.local`로 설정되어 있음 (로컬 개발용)
- 프로덕션 환경에서는 실제 도메인으로 변경 필요

### 방법 2: 실제 접속 URL 확인

브라우저에서 프론트엔드에 접속할 때 사용하는 URL이 프론트엔드 도메인입니다:

```
https://moodie.shop          # 프론트엔드 도메인
https://www.moodie.shop      # www 포함 프론트엔드 도메인
```

### 방법 3: 백엔드 CORS 설정에서 확인

백엔드의 `WebConfig.java`에서 허용된 프론트엔드 도메인을 확인할 수 있습니다:

```java
.allowedOrigins(
    "http://localhost:5173",      // 로컬 개발
    "http://localhost:3000",      // 로컬 개발
    "https://moodie.shop",        // 프로덕션 프론트엔드 도메인 ✅
    "https://www.moodie.shop"      // www 포함 프로덕션 도메인 ✅
)
```

**현재 백엔드 CORS 설정에 허용된 프론트엔드 도메인:**
- ✅ `https://moodie.shop`
- ✅ `https://www.moodie.shop`

### 방법 4: 배포 스크립트 또는 CI/CD 설정 확인

GitHub Actions나 배포 스크립트에서 도메인 설정을 확인:

```bash
# 배포 스크립트 확인
cat scripts/deploy.sh

# GitHub Actions 워크플로우 확인
cat .github/workflows/ci-cd.yml
```

## 📋 현재 프로젝트 상태

### 1. Kubernetes Ingress 설정

**파일:** `k8s/ingress.yaml`

```yaml
spec:
  rules:
  - host: board.local  # ⚠️ 로컬 개발용 (프로덕션에서는 변경 필요)
```

**프로덕션 환경에서는 다음과 같이 변경 필요:**
```yaml
spec:
  rules:
  - host: moodie.shop  # 프로덕션 도메인
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: board-frontend-service
            port:
              number: 80
```

### 2. 백엔드 CORS 설정

백엔드 `WebConfig.java`에서 이미 다음 도메인들이 허용되어 있음:
- ✅ `https://moodie.shop`
- ✅ `https://www.moodie.shop`

### 3. ConfigMap 설정

**파일:** `k8s/configmap.yaml`

```yaml
VITE_API_BASE_URL: "https://api.moodie.shop"  # 백엔드 API URL
```

## ✅ 확인 체크리스트

프로덕션 환경에서 프론트엔드 도메인을 확인하려면:

### 배포 전
- [x] `k8s/ingress.yaml` 파일의 `host` 필드 확인 (설정된 도메인 확인)
- [x] 백엔드 CORS 설정의 `allowedOrigins` 확인 (허용된 도메인 확인)

### 배포 후
- [ ] `kubectl get ingress` 명령어로 실제 배포된 Ingress 확인
- [ ] `kubectl describe ingress board-frontend-ingress`로 상세 정보 확인
- [ ] 실제 브라우저 접속 URL 확인
- [ ] DNS 설정 확인 (도메인이 올바른 IP로 연결되는지)

**배포 전 상태:**
```bash
$ kubectl get ingress
No resources found in default namespace.
# 또는 아무것도 출력되지 않음
```

**배포 후 상태:**
```bash
$ kubectl get ingress
NAME                      CLASS    HOSTS           ADDRESS   PORTS   AGE
board-frontend-ingress    nginx    moodie.shop     10.0.0.1   80      5m
```

## 🔧 프로덕션 도메인 설정 방법

프로덕션 환경에서 프론트엔드 도메인을 설정하려면:

### 1. Ingress 설정 수정

`k8s/ingress.yaml` 파일 수정:

```yaml
spec:
  rules:
  - host: moodie.shop  # 실제 프론트엔드 도메인
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: board-frontend-service
            port:
              number: 80
```

### 2. TLS/SSL 인증서 설정 (HTTPS 사용 시)

```yaml
spec:
  tls:
  - hosts:
    - moodie.shop
    secretName: moodie-tls-secret
  rules:
  - host: moodie.shop
    # ...
```

### 3. 배포

```bash
kubectl apply -f k8s/ingress.yaml
```

## 📝 요약

1. **`.env` 파일은 백엔드 API URL 설정용** (프론트엔드 도메인이 아님)
2. **프론트엔드 도메인은 Kubernetes Ingress에서 설정**
3. **백엔드 CORS 설정에서 허용된 도메인 확인 가능**
4. **실제 접속 URL이 최종 프론트엔드 도메인**

## 🔗 관련 문서

- [Git 레포지토리 분리 시 백엔드 연동](./GIT_REPOSITORY_SEPARATION.md)
- [배포 가이드](./deployment/DEPLOYMENT.md)


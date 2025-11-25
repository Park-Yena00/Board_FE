# 게시판 프론트엔드 서비스

클라우드 네이티브 웹서비스 프로젝트의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Docker** - 컨테이너화
- **Kubernetes** - 오케스트레이션
- **Nginx** - 웹 서버

## 기능

- ✅ 게시글 목록 조회
- ✅ 게시글 작성
- ✅ 게시글 수정
- ✅ 게시글 삭제
- ✅ 게시글 상세 보기
- ✅ 반응형 디자인
- ✅ 메트릭 수집 (Prometheus)

## 개발 환경 설정

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## 환경 변수

`.env` 파일을 생성하여 다음 변수를 설정할 수 있습니다:

```env
# 로컬 개발 환경
VITE_API_BASE_URL=http://localhost:8080

# 프로덕션 환경
# VITE_API_BASE_URL=https://api.moodie.shop
```

**중요**: 백엔드 API는 `/api` prefix를 사용하므로, `VITE_API_BASE_URL`에는 기본 URL만 설정하면 됩니다.
프론트엔드 코드에서 자동으로 `/api`를 추가합니다.

자세한 백엔드 연동 방법은 아래 문서를 참고하세요.
[백엔드 연동 가이드]
(./docs/deployment/QUICK_DEPLOYMENT_GUIDE.md)
(./docs/deployment/FRONTEND_DEPLOYMENT_GUIDE.md)


## Docker 빌드 및 실행

```bash
# 이미지 빌드
docker build -t board-frontend:latest .

# 컨테이너 실행
docker run -p 3000:80 board-frontend:latest
```

## Kubernetes 배포

```bash
# Deployment 및 Service 생성
kubectl apply -f k8s/deployment.yaml

# Ingress 생성 (선택사항)
kubectl apply -f k8s/ingress.yaml
```

## CI/CD

GitHub Actions를 사용하여 자동 빌드 및 배포가 구성되어 있습니다.

- `main` 브랜치에 push 시 자동 빌드
- Docker 이미지 자동 빌드 및 푸시
- Kubernetes 매니페스트 자동 업데이트

## 모니터링

### 프론트엔드 메트릭 수집

프론트엔드에서 수집되는 메트릭:
- `http_requests_total` - HTTP 요청 수 (페이지뷰)
- `api_requests_total` - API 호출 수
- `errors_total` - 에러 발생 수

**현재 상태:**
- ✅ 메트릭 수집 기능 구현 완료
- ⏳ 백엔드 메트릭 엔드포인트 추가 대기 중
- 📝 백엔드에 `POST /api/metrics` 엔드포인트 추가 요청 필요

### 백엔드 모니터링

백엔드는 Spring Boot Actuator를 통해 메트릭을 노출:
- `/actuator/prometheus` - Prometheus 형식 메트릭
- `/actuator/health` - 헬스 체크

**Grafana**: grafana.moodie.shop
**Prometheus**: 백엔드 Actuator 엔드포인트에서 메트릭 수집

## 프로젝트 구조

```
.
├── src/
│   ├── components/      # React 컴포넌트
│   ├── services/        # API 서비스
│   ├── types/          # TypeScript 타입 정의
│   ├── utils/          # 유틸리티 함수
│   ├── hooks/          # 커스텀 훅
│   └── App.tsx         # 메인 앱 컴포넌트
├── k8s/                # Kubernetes 매니페스트
├── .github/workflows/  # CI/CD 파이프라인
├── Dockerfile          # Docker 이미지 빌드
└── nginx.conf          # Nginx 설정
```

## 🚀 배포 가이드

### 프론트엔드 배포 및 백엔드 연동

**백엔드 팀원을 위한 배포 가이드:**
- [프론트엔드 배포 및 백엔드 연동 가이드](./docs/deployment/FRONTEND_DEPLOYMENT_GUIDE.md) - **이 문서를 먼저 확인하세요!**

이 가이드에는 다음이 포함되어 있습니다:
- 프론트엔드 저장소 클론 및 Docker 이미지 빌드
- Kubernetes 배포 방법
- 백엔드 연동 설정
- 접근 방법 및 트러블슈팅


## 📚 문서

프로젝트 관련 상세 문서는 [docs](./docs/README.md) 디렉토리를 참고하세요.

### 연동 방법

1. **환경 변수 설정**
   ```env
   VITE_API_BASE_URL=https://api.moodie.shop
   ```

2. **CORS 설정**
   - 백엔드에서 프론트엔드 도메인을 허용하도록 CORS 설정 필요

3. **네트워크 접근**
   - 프론트엔드가 백엔드 API에 HTTP/HTTPS 요청 가능해야 함


### 빠른 시작 (VM에서)

```bash
# 1. 프로젝트 디렉토리로 이동
cd Board_FE

# 2. 스크립트에 실행 권한 부여
chmod +x scripts/*.sh

# 3. 빠른 배포 실행
./scripts/quick-deploy.sh

# 4. 상태 확인
./scripts/check-status.sh

# 5. 포트 포워딩으로 접속
./scripts/port-forward.sh
```

### 주요 스크립트

- `scripts/quick-deploy.sh` - 전체 배포 프로세스 자동 실행
- `scripts/deploy.sh` - Kubernetes 배포
- `scripts/build-and-push.sh` - Docker 이미지 빌드 및 푸시
- `scripts/setup-argocd.sh` - ArgoCD Application 설정
- `scripts/setup-monitoring.sh` - 모니터링 설정
- `scripts/check-status.sh` - 배포 상태 확인
- `scripts/port-forward.sh` - 포트 포워딩

## 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.


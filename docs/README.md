# 문서 (Docs)

이 디렉토리에는 프로젝트와 관련된 상세 문서들이 포함되어 있습니다.

## 📚 문서 목록

### 백엔드 연동
- [백엔드 연동 가이드](./backend/BACKEND_INTEGRATION.md) - 프론트엔드와 백엔드 API 연동 방법 (연동 완료 요약 포함)
- [백엔드 Docker 설정](./backend/BACKEND_DOCKER_ONLY_SETUP.md) - Docker만 사용한 백엔드 실행 방법

### 배포 및 인프라
- [VM 배포 가이드](./deployment/DEPLOYMENT.md) - VirtualBox Ubuntu VM에서 배포하는 방법 (VM 환경 설정 및 포트 설정 포함)
- [Docker 네트워크 설정](./deployment/DOCKER_NETWORK_SETUP_BARE_METAL.md) - 베어메탈 환경 Docker 네트워크 설정

### API 문서
- [Swagger API 가이드](./api/SWAGGER_GUIDE.md) - Swagger API 확인 및 사용 가이드 (체크리스트 및 빠른 가이드 통합)
- [프로덕션 서버 Swagger 접속](./api/PRODUCTION_SERVER_SWAGGER_ACCESS.md) - 프로덕션 서버 Swagger 접속 방법

### 모니터링
- [메트릭 대안 접근 방법](./monitoring/METRICS_ALTERNATIVE_APPROACH.md) - 메트릭 수집 대안 방법

### 기타
- [다음 단계 가이드](./NEXT_STEPS_GUIDE.md) - 백엔드 서버 실행 후 진행할 단계들
- [Git 레포지토리 분리 시 백엔드 연동](./GIT_REPOSITORY_SEPARATION.md) - 프론트엔드와 백엔드가 다른 레포지토리에 있을 때 연동 방법
- [프론트엔드 도메인 확인](./FRONTEND_DOMAIN_CHECK.md) - 프로덕션 환경에서 프론트엔드 도메인 확인 방법

## 🔗 외부 링크

- **백엔드 GitHub 저장소**: https://github.com/Suehyun666/Board_BE
- **백엔드 API 문서 (Redoc)**: https://api.moodie.shop/redoc.html
- **백엔드 Swagger UI**: https://api.moodie.shop/swagger-ui/index.html
- **프로덕션 서버**: https://api.moodie.shop

## 📝 Git 레포지토리 분리 시 백엔드 연동

프론트엔드와 백엔드가 서로 다른 Git 레포지토리에 있어도 **정상적으로 연동 가능**합니다.

### 연동 방법

1. **환경 변수 설정**
   - `.env` 파일에 백엔드 API URL 설정:
     ```env
     VITE_API_BASE_URL=https://api.moodie.shop
     ```

2. **CORS 설정**
   - 백엔드에서 프론트엔드 도메인을 허용하도록 CORS 설정 필요
   - 백엔드 저장소의 CORS 설정 확인 필요

3. **네트워크 접근**
   - 프론트엔드가 백엔드 API에 HTTP/HTTPS 요청 가능해야 함
   - 프로덕션 환경: 도메인 기반 접근
   - 개발 환경: localhost 또는 포트 포워딩

### 장점

- ✅ 프론트엔드와 백엔드 독립적 개발 및 배포
- ✅ 각 레포지토리별 CI/CD 파이프라인 구성 가능
- ✅ 버전 관리 및 협업 용이
- ✅ 마이크로서비스 아키텍처에 적합

### 주의사항

- ⚠️ 백엔드 API 변경 시 프론트엔드도 함께 업데이트 필요
- ⚠️ CORS 설정이 올바르게 되어 있어야 함
- ⚠️ 환경 변수 관리 필요 (각 환경별 설정)


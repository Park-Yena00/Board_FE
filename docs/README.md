# 문서 (Docs)

이 디렉토리에는 프로젝트와 관련된 상세 문서들이 포함되어 있습니다.

## 📚 문서 목록

### 백엔드 연동
- [백엔드 연동 가이드](./backend/BACKEND_INTEGRATION.md) - 프론트엔드와 백엔드 API 연동 방법 (연동 완료 요약 포함)
### API 문서
- [프로덕션 서버 Swagger 접속](./api/PRODUCTION_SERVER_SWAGGER_ACCESS.md) - 프로덕션 서버 Swagger 접속 방법


## 🔗 외부 링크

- **백엔드 GitHub 저장소**: https://github.com/Suehyun666/Board_BE
- **백엔드 API 문서 (Redoc)**: https://api.moodie.shop/redoc.html
- **백엔드 Swagger UI**: https://api.moodie.shop/swagger-ui/index.html
- **프로덕션 서버**: https://api.moodie.shop

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

### 주의사항

- ⚠️ 백엔드 API 변경 시 프론트엔드도 함께 업데이트 필요
- ⚠️ CORS 설정이 올바르게 되어 있어야 함
- ⚠️ 환경 변수 관리 필요 (각 환경별 설정)


# Git 레포지토리 분리 시 백엔드 연동 가이드

프론트엔드와 백엔드가 서로 다른 Git 레포지토리에 있어도 **정상적으로 연동 가능**합니다.

## ✅ 연동 가능 여부

**네, 가능합니다!** 프론트엔드와 백엔드가 다른 레포지토리에 있어도 문제없이 연동됩니다.

### 이유

1. **HTTP/HTTPS 통신**: 프론트엔드는 백엔드 API를 HTTP/HTTPS 요청으로 호출하므로, 레포지토리 위치와 무관합니다.
2. **환경 변수**: 백엔드 URL은 환경 변수(`VITE_API_BASE_URL`)로 설정하므로, 레포지토리와 독립적입니다.
3. **네트워크 기반**: 실제 연동은 네트워크를 통해 이루어지며, Git 레포지토리와는 무관합니다.

## 🔧 연동 방법

### 1. 환경 변수 설정

프론트엔드 프로젝트 루트에 `.env` 파일을 생성하고 백엔드 API URL을 설정합니다:

```env
# 개발 환경
VITE_API_BASE_URL=http://localhost:8080

# 프로덕션 환경
VITE_API_BASE_URL=https://api.moodie.shop
```

### 2. CORS 설정 확인

백엔드에서 프론트엔드 도메인을 허용하도록 CORS 설정이 되어 있어야 합니다.

**백엔드 설정 예시 (Spring Boot):**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000", "https://your-frontend-domain.com")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### 3. 네트워크 접근 확인

프론트엔드가 백엔드 API에 접근할 수 있는지 확인:

- **프로덕션**: 도메인 기반 접근 (예: `https://api.moodie.shop`)
- **개발 환경**: 
  - 같은 네트워크: `http://localhost:8080`
  - 다른 네트워크: 포트 포워딩 또는 VPN 사용

## 📋 체크리스트

연동 전 확인 사항:

- [ ] `.env` 파일에 `VITE_API_BASE_URL` 설정
- [ ] 백엔드 CORS 설정에 프론트엔드 도메인 추가
- [ ] 백엔드 서버가 실행 중인지 확인
- [ ] 네트워크 연결 확인 (프론트엔드 → 백엔드)
- [ ] 브라우저 개발자 도구에서 CORS 오류 확인

## 🎯 장점

레포지토리를 분리하면:

1. **독립적 개발**: 프론트엔드와 백엔드를 독립적으로 개발 및 배포 가능
2. **버전 관리**: 각 프로젝트별로 독립적인 버전 관리
3. **CI/CD**: 각 레포지토리별로 독립적인 CI/CD 파이프라인 구성
4. **협업**: 프론트엔드와 백엔드 팀이 독립적으로 작업 가능
5. **마이크로서비스**: 마이크로서비스 아키텍처에 적합

## ⚠️ 주의사항

1. **API 변경**: 백엔드 API가 변경되면 프론트엔드도 함께 업데이트 필요
2. **CORS 설정**: 백엔드 CORS 설정이 올바르게 되어 있어야 함
3. **환경 변수**: 각 환경(개발/스테이징/프로덕션)별로 환경 변수 관리 필요
4. **문서화**: API 변경 사항을 문서화하여 프론트엔드 팀과 공유 필요

## 🔍 문제 해결

### CORS 오류 발생 시

```
Access to XMLHttpRequest at 'https://api.moodie.shop/api/posts' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**해결 방법:**
1. 백엔드 CORS 설정 확인
2. 프론트엔드 도메인이 허용 목록에 있는지 확인
3. 백엔드 개발자에게 CORS 설정 요청

### 네트워크 연결 오류 시

```
Network Error: Failed to fetch
```

**해결 방법:**
1. 백엔드 서버가 실행 중인지 확인
2. `VITE_API_BASE_URL` 환경 변수 확인
3. 방화벽 또는 네트워크 설정 확인

## 📚 참고 자료

- [백엔드 연동 가이드](./backend/BACKEND_INTEGRATION.md)
- [백엔드 GitHub 저장소](https://github.com/Suehyun666/Board_BE)
- [백엔드 API 문서](https://api.moodie.shop/swagger-ui/index.html)


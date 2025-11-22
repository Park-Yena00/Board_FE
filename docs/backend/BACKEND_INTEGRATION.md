# 백엔드 연동 가이드

이 문서는 프론트엔드와 백엔드 API를 연동하는 방법을 설명합니다.

## 백엔드 정보

- **GitHub 저장소**: https://github.com/Suehyun666/Board_BE
- **API 문서**: https://api.moodie.shop/redoc.html
- **Swagger UI**: https://api.moodie.shop/swagger-ui.html
- **기술 스택**: Spring Boot 3.5.7, Java 21, PostgreSQL 17

## API 엔드포인트

백엔드 API는 다음과 같은 구조를 가집니다:

### 게시글 API

- `GET /api/posts` - 게시글 목록 조회 (페이징, 검색 지원)
  - Query Parameters:
    - `page`: 페이지 번호 (0부터 시작)
    - `size`: 페이지 크기 (기본값: 10)
    - `sort`: 정렬 기준 (예: `createdAt,desc`)
    - `keyword`: 검색 키워드 (제목, 내용 검색)
  
- `GET /api/posts/{id}` - 게시글 상세 조회
- `POST /api/posts` - 게시글 작성
- `PUT /api/posts/{id}` - 게시글 수정
- `DELETE /api/posts/{id}` - 게시글 삭제

### 댓글 API (선택사항)

- `GET /api/posts/{postId}/comments` - 댓글 목록 조회
- `POST /api/posts/{postId}/comments` - 댓글 작성
- `PUT /api/posts/{postId}/comments/{commentId}` - 댓글 수정
- `DELETE /api/posts/{postId}/comments/{commentId}` - 댓글 삭제

## 환경 변수 설정

### 로컬 개발 환경

프로젝트 루트에 `.env` 파일을 생성합니다:

```env
# 로컬 백엔드 서버
VITE_API_BASE_URL=http://localhost:8080
```

또는 백엔드가 다른 포트에서 실행 중이라면:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Docker Compose 환경

`docker-compose.yml`에서 환경 변수 설정:

```yaml
services:
  frontend:
    environment:
      - VITE_API_BASE_URL=http://backend:8080
```

### Kubernetes 환경

`k8s/configmap.yaml`에서 설정:

```yaml
data:
  VITE_API_BASE_URL: "http://board-backend-service:8080"
```

백엔드 서비스 이름이 다르다면 해당 서비스 이름으로 변경:

```yaml
data:
  VITE_API_BASE_URL: "http://YOUR_BACKEND_SERVICE_NAME:8080"
```

### 프로덕션 환경

프로덕션 환경에서는 실제 API 서버 주소를 사용:

```env
VITE_API_BASE_URL=https://api.moodie.shop
```

## API 응답 구조

### 게시글 목록 (페이징)

```json
{
  "content": [
    {
      "id": 1,
      "title": "게시글 제목",
      "content": "게시글 내용",
      "author": "작성자",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00",
      "viewCount": 10,
      "commentCount": 5
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "numberOfElements": 10
}
```

### 게시글 상세

```json
{
  "id": 1,
  "title": "게시글 제목",
  "content": "게시글 내용",
  "author": "작성자",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00",
  "viewCount": 10,
  "commentCount": 5
}
```

## 프론트엔드 API 서비스

프론트엔드의 API 서비스는 `src/services/api.ts`에 정의되어 있습니다.

### 사용 예시

```typescript
import { boardApi } from './services/api'

// 게시글 목록 조회 (페이징)
const pageData = await boardApi.getPosts({
  page: 0,
  size: 10,
  sort: 'createdAt,desc',
  keyword: '검색어'
})

// 게시글 상세 조회
const post = await boardApi.getPost(1)

// 게시글 작성
const newPost = await boardApi.createPost({
  title: '제목',
  content: '내용',
  author: '작성자'
})

// 게시글 수정
await boardApi.updatePost(1, {
  title: '수정된 제목',
  content: '수정된 내용'
})

// 게시글 삭제
await boardApi.deletePost(1)
```

## CORS 설정

백엔드에서 CORS를 허용해야 프론트엔드에서 API를 호출할 수 있습니다.

백엔드의 CORS 설정이 되어 있는지 확인:

```java
@CrossOrigin(origins = "*") // 또는 특정 도메인
@RestController
public class PostController {
    // ...
}
```

또는 전역 CORS 설정:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## 연동 테스트

### 1. 백엔드 서버 실행 확인

```bash
# 백엔드가 실행 중인지 확인
curl http://localhost:8080/actuator/health

# 또는 API 문서 확인
curl http://localhost:8080/swagger-ui.html
```

### 2. 프론트엔드에서 API 호출 테스트

브라우저 개발자 도구의 Network 탭에서 API 호출을 확인:

1. 게시글 목록 조회: `GET /api/posts`
2. 게시글 작성: `POST /api/posts`
3. 게시글 수정: `PUT /api/posts/{id}`
4. 게시글 삭제: `DELETE /api/posts/{id}`

### 3. 에러 처리

API 호출 실패 시:

1. **CORS 에러**: 백엔드 CORS 설정 확인
2. **404 에러**: API 엔드포인트 경로 확인 (`/api/posts` vs `/posts`)
3. **500 에러**: 백엔드 서버 로그 확인
4. **연결 실패**: 백엔드 서버가 실행 중인지 확인

## Kubernetes 배포 시 연동

### 1. 백엔드 서비스 확인

```bash
# 백엔드 서비스 확인
kubectl get svc | grep backend

# 서비스 이름 확인 (예: board-backend-service)
```

### 2. ConfigMap 수정

백엔드 서비스 이름에 맞게 `k8s/configmap.yaml` 수정:

```yaml
data:
  VITE_API_BASE_URL: "http://board-backend-service:8080"
```

### 3. 네임스페이스 확인

프론트엔드와 백엔드가 같은 네임스페이스에 있는지 확인:

```bash
# 같은 네임스페이스에 배포
kubectl apply -f k8s/configmap.yaml -n default
kubectl apply -f k8s/deployment.yaml -n default
```

### 4. 서비스 연결 테스트

```bash
# 프론트엔드 Pod에서 백엔드 연결 테스트
kubectl run -it --rm curl-test --image=curlimages/curl --restart=Never -- \
  curl http://board-backend-service:8080/api/posts
```

## 문제 해결

### 문제: API 호출이 실패함

**해결 방법:**
1. 백엔드 서버가 실행 중인지 확인
2. API URL이 올바른지 확인 (`VITE_API_BASE_URL`)
3. CORS 설정 확인
4. 네트워크 연결 확인 (Kubernetes 환경)

### 문제: 페이징이 작동하지 않음

**해결 방법:**
1. 백엔드 API가 페이징을 지원하는지 확인
2. API 응답 구조 확인 (PageResponse 형식)
3. 프론트엔드 코드에서 페이징 파라미터 전달 확인

### 문제: 검색이 작동하지 않음

**해결 방법:**
1. 백엔드 API가 검색 파라미터를 지원하는지 확인
2. 검색 파라미터 이름 확인 (`keyword` vs `search` vs `q`)
3. API 문서에서 정확한 파라미터 확인

## 연동 완료 요약

프론트엔드가 백엔드 API와 연동되도록 구현이 완료되었습니다.

### 주요 변경 사항

1. **API 서비스 업데이트** (`src/services/api.ts`)
   - ✅ 백엔드 API 엔드포인트에 맞게 수정 (`/api/posts`)
   - ✅ 페이징 지원 추가 (`page`, `size`, `sort` 파라미터)
   - ✅ 검색 기능 추가 (`keyword` 파라미터)
   - ✅ 댓글 API 추가
   - ✅ 인증 API 추가 (로그인, 회원가입)
   - ✅ 사용자 API 추가
   - ✅ 에러 처리 개선

2. **타입 정의 업데이트** (`src/types/board.ts`)
   - ✅ 페이징 응답 타입 추가 (`PageResponse<T>`)
   - ✅ 게시글 목록 파라미터 타입 추가 (`PostListParams`)
   - ✅ 댓글 관련 타입 추가
   - ✅ 인증 관련 타입 추가 (로그인, 회원가입, 사용자)

3. **UI 컴포넌트 개선**
   - ✅ 게시글 목록에 페이징 UI 추가
   - ✅ 검색 기능 UI 추가
   - ✅ 댓글 기능 UI 추가
   - ✅ 로그인/회원가입 페이지 추가
   - ✅ 헤더 네비게이션 추가

4. **환경 변수 설정**
   - ✅ `.env` 파일 예시 제공
   - ✅ `k8s/configmap.yaml` 업데이트
   - ✅ `docker-compose.yml` 업데이트

### 구현 완료된 기능

- [x] 게시글 목록 조회 (페이징 지원)
- [x] 게시글 상세 조회
- [x] 게시글 작성
- [x] 게시글 수정
- [x] 게시글 삭제
- [x] 검색 기능
- [x] 페이징 UI
- [x] 댓글 기능 (목록, 작성, 수정, 삭제)
- [x] 로그인/회원가입
- [x] 인증 토큰 관리

## 참고 자료

- [백엔드 GitHub 저장소](https://github.com/Suehyun666/Board_BE)
- [백엔드 README](https://github.com/Suehyun666/Board_BE/blob/master/README.md)
- [API 문서 (Redoc)](https://api.moodie.shop/redoc.html)
- [API 문서 (Swagger)](https://api.moodie.shop/swagger-ui/index.html)


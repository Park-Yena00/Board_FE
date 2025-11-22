# Swagger API 가이드

백엔드 Swagger 문서를 확인하고 프론트엔드에 반영하는 방법을 설명합니다.

## Swagger UI 접속

**URL**: https://api.moodie.shop/swagger-ui/index.html

## 빠른 확인 방법 (3단계)

### Step 1: 필터에 "POST" 입력

Swagger UI 상단의 **필터 입력란**에 `POST` 입력

### Step 2: "metrics" 검색

필터 입력란에 `metrics` 입력

### Step 3: 엔드포인트 클릭

검색 결과에서 메트릭 관련 엔드포인트를 클릭하여 확인:
- `POST /api/metrics` (또는 유사한 경로)
- "Try it out" 버튼 클릭
- "Request body" 섹션에서 구조 확인

## 확인할 항목

### 1. 게시글 API 엔드포인트

#### GET /api/posts (목록 조회)
- [ ] Query Parameters 확인
  - `page` (타입, 기본값)
  - `size` (타입, 기본값)
  - `sort` (타입, 형식)
  - `keyword` (타입, 검색 범위)
- [ ] Response 구조 확인
  - 페이징 정보 구조
  - 게시글 데이터 구조

#### GET /api/posts/{id} (상세 조회)
- [ ] Path Parameter 확인
  - `id` (타입)
- [ ] Response 구조 확인
  - 게시글 필드 확인
  - 날짜 형식 확인

#### POST /api/posts (작성)
- [ ] Request Body 구조 확인
  - 필수 필드
  - 선택 필드
  - 필드 타입
- [ ] Response 구조 확인

#### PUT /api/posts/{id} (수정)
- [ ] Path Parameter 확인
- [ ] Request Body 구조 확인
- [ ] Response 구조 확인

#### DELETE /api/posts/{id} (삭제)
- [ ] Path Parameter 확인
- [ ] Response 확인 (성공 시 응답)

### 2. 댓글 API

- [ ] GET /api/posts/{postId}/comments
- [ ] POST /api/posts/{postId}/comments
- [ ] PUT /api/posts/{postId}/comments/{commentId}
- [ ] DELETE /api/posts/{postId}/comments/{commentId}

### 3. 인증/인가 API

- [ ] POST /api/auth/login
  - Request Body 구조
  - Response 구조 (토큰 포함)
- [ ] POST /api/auth/register
  - Request Body 구조
  - Response 구조
- [ ] GET /api/users/{id}
  - Response 구조

### 4. 메트릭 엔드포인트 (선택사항)

Swagger UI에서 **POST 메서드**로 다음을 검색:

#### 가능한 엔드포인트들:
- [ ] `/api/metrics` - 단일 메트릭 전송
- [ ] `/api/metrics/batch` - 배치 메트릭 전송
- [ ] `/api/analytics` - 분석 데이터
- [ ] `/api/telemetry` - 원격 측정

#### 확인할 내용:
- [ ] 엔드포인트 URL
- [ ] Request Body 구조
  - 필드 이름 (`metricName` vs `name`)
  - 필드 타입
  - 필수/선택 여부
- [ ] Response 구조
- [ ] 인증 필요 여부

## 확인할 정보

### 1. 엔드포인트 URL
예: `POST /api/metrics`

### 2. Request Body 구조
예시:
```json
{
  "metricName": "string",
  "value": 0,
  "labels": {}
}
```

또는
```json
{
  "name": "string",
  "value": 0,
  "labels": {}
}
```

**중요**: 필드 이름이 `metricName`인지 `name`인지 확인!

### 3. Response 구조
성공 시 응답 형식 확인

## 확인 후 프론트엔드 업데이트

### Step 1: 메트릭 엔드포인트 확인

Swagger에서 메트릭 엔드포인트를 찾은 후:

1. **엔드포인트 URL 기록**
   - 예: `POST /api/metrics`

2. **Request Body 구조 기록**
   ```json
   {
     "metricName": "string",
     "value": 0,
     "labels": {},
     "timestamp": "string"
   }
   ```

3. **`src/services/metricsApi.ts` 파일 수정**
   - 엔드포인트 URL 업데이트
   - Request Body 구조에 맞게 타입 수정

### Step 2: 게시글 API 구조 확인

Swagger에서 게시글 API 구조를 확인한 후:

1. **Response 구조 확인**
   - `src/types/board.ts` 파일의 타입 정의와 비교
   - 필요한 경우 타입 수정

2. **Request Body 구조 확인**
   - `PostCreateRequest`, `PostUpdateRequest` 타입 확인
   - 필요한 경우 수정

### Step 3: 환경 변수 설정

프로덕션 환경에서는:

```env
VITE_API_BASE_URL=https://api.moodie.shop
```

## 확인 결과 기록

### 메트릭 엔드포인트 정보

```
엔드포인트: POST /api/metrics
Request Body:
{
  "metricName": "string",
  "value": number,
  "labels": {
    "key": "value"
  },
  "timestamp": "ISO 8601 string"
}
```

### 게시글 API 정보

```
GET /api/posts
Query Parameters:
- page: number (기본값: 0)
- size: number (기본값: 10)
- sort: string (예: "createdAt,desc")
- keyword: string (검색어)

Response:
{
  "content": [...],
  "totalElements": number,
  "totalPages": number,
  ...
}
```

## 다음 단계

1. ✅ Swagger UI 접속
2. ✅ POST 메서드로 필터링
3. ✅ "metrics" 검색
4. ✅ 엔드포인트 상세 확인
5. ✅ 정보 공유
6. ✅ 프론트엔드 코드 업데이트


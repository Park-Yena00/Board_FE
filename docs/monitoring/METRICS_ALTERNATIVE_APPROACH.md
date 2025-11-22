# 메트릭 수집 대안 방법

백엔드에 프론트엔드 메트릭 전용 엔드포인트가 없는 경우의 대안입니다.

## 현재 상황 분석

### Swagger UI에서 확인된 엔드포인트

- ✅ 댓글 작성
- ✅ 게시글 작성
- ✅ 로그인
- ✅ 회원가입
- ❌ 메트릭 엔드포인트 없음

### 결론

백엔드에 프론트엔드 메트릭을 받는 전용 엔드포인트가 **아직 구현되지 않았습니다**.

## 메트릭 수집 방식 이해

### 백엔드 메트릭 (이미 구현됨)

백엔드는 Spring Boot Actuator를 통해 자체 메트릭을 노출합니다:

- `/actuator/prometheus` - Prometheus 형식 메트릭
- `/actuator/metrics` - 메트릭 목록
- `/actuator/health` - 헬스 체크

**Prometheus**가 이 엔드포인트에서 메트릭을 수집하고, **Grafana**가 시각화합니다.

### 프론트엔드 메트릭 (구현 필요)

프론트엔드는 클라이언트 측에서 실행되므로:
- 서버로 직접 메트릭을 노출할 수 없음
- 백엔드 API를 통해 메트릭을 전송해야 함
- 또는 별도의 메트릭 수집 서비스 필요

## 대안 방법

### 방법 1: 백엔드에 메트릭 엔드포인트 추가 (권장)

백엔드 개발자와 협의하여 메트릭 엔드포인트를 추가:

**요청할 엔드포인트:**
```
POST /api/metrics
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

또는 배치 전송:
```
POST /api/metrics/batch
Request Body:
{
  "metrics": [
    {
      "metricName": "string",
      "value": number,
      "labels": {}
    }
  ]
}
```

### 방법 2: 로그를 통한 메트릭 수집

프론트엔드 메트릭을 로그로 출력하고, 백엔드에서 로그를 수집:

```typescript
// 프론트엔드에서 로그 출력
console.log(JSON.stringify({
  type: 'metric',
  metricName: 'http_requests_total',
  value: 1,
  labels: { path: '/' },
  timestamp: new Date().toISOString()
}))
```

백엔드에서 로그를 수집하여 Prometheus로 전송.

### 방법 3: 기존 API를 통한 메트릭 전송 (임시)

게시글 작성 API 등을 활용하여 메트릭을 전송 (권장하지 않음):

```typescript
// 임시 방법 (권장하지 않음)
await apiClient.post('/api/posts', {
  // 메트릭 데이터를 게시글 형식으로 변환
})
```

### 방법 4: 별도 메트릭 수집 서비스

- Google Analytics
- Mixpanel
- 자체 메트릭 수집 서버

## 현재 프로젝트에서 권장하는 방법

### 옵션 A: 백엔드에 메트릭 엔드포인트 추가 요청 (최선)

백엔드 개발자에게 다음을 요청:

1. **메트릭 엔드포인트 추가**
   - `POST /api/metrics` - 단일 메트릭
   - `POST /api/metrics/batch` - 배치 메트릭

2. **백엔드에서 Prometheus로 노출**
   - 수집된 프론트엔드 메트릭을 Prometheus 형식으로 노출
   - 기존 `/actuator/prometheus`에 포함

### 옵션 B: 현재 구조 유지 (임시)

프론트엔드에서 메트릭을 수집하되, 백엔드로 전송하지 않고:

1. **로컬에서만 수집**
   - `metricsCollector`에서 메트릭 수집
   - 백엔드 전송 기능은 주석 처리

2. **나중에 엔드포인트 추가 시 활성화**
   - 백엔드에 엔드포인트가 추가되면 코드 활성화

## 프론트엔드 코드 수정 (임시)

메트릭 엔드포인트가 없으므로, 전송 기능을 비활성화:

```typescript
// src/hooks/useMetrics.ts
// 메트릭 전송 기능을 주석 처리하고 로컬 수집만 유지
```

또는:

```typescript
// 메트릭 전송 실패 시 무시하도록 설정 (이미 구현됨)
// catch 블록에서 에러를 무시하므로 앱 동작에는 영향 없음
```

## Grafana와 Prometheus 활용

### 현재 구조

```
프론트엔드 (브라우저)
    ↓ (메트릭 전송 필요)
백엔드 API
    ↓
Prometheus (메트릭 수집)
    ↓
Grafana (시각화)
```

### 프론트엔드 메트릭을 포함하려면

```
프론트엔드 (브라우저)
    ↓ POST /api/metrics
백엔드 API
    ↓ (프론트엔드 메트릭을 Prometheus 형식으로 변환)
Prometheus (메트릭 수집)
    ↓
Grafana (시각화)
```

## 다음 단계

### 즉시 할 수 있는 것

1. ✅ 프론트엔드에서 메트릭 수집 (이미 구현됨)
2. ✅ 메트릭 전송 코드 준비 (이미 구현됨)
3. ⏳ 백엔드에 메트릭 엔드포인트 추가 요청

### 백엔드 개발자에게 요청할 내용

```
프론트엔드에서 수집한 메트릭을 백엔드로 전송하기 위한 
엔드포인트가 필요합니다.

요청:
- POST /api/metrics (단일 메트릭)
- POST /api/metrics/batch (배치 메트릭)

Request Body 예시:
{
  "metricName": "http_requests_total",
  "value": 1,
  "labels": {
    "method": "GET",
    "path": "/",
    "status": "200"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}

이 메트릭을 백엔드의 Prometheus 메트릭에 포함시켜 
Grafana에서 시각화할 수 있도록 해주세요.
```

## 현재 프론트엔드 상태

### 구현된 기능

- ✅ 메트릭 수집 (페이지뷰, API 호출, 에러)
- ✅ 메트릭 전송 코드 (백엔드 엔드포인트 대기 중)
- ✅ 에러 처리 (전송 실패해도 앱 동작에는 영향 없음)

### 대기 중인 기능

- ⏳ 백엔드 메트릭 엔드포인트 추가
- ⏳ 메트릭 전송 활성화

## 권장 사항

1. **현재 상태 유지**
   - 메트릭 수집은 계속 진행
   - 전송 기능은 백엔드 엔드포인트 추가 대기

2. **백엔드 개발자와 협의**
   - 메트릭 엔드포인트 추가 요청
   - Request Body 구조 협의

3. **임시로 로그 출력**
   - 메트릭을 로그로 출력하여 확인
   - 나중에 엔드포인트 추가 시 전송 기능 활성화

## 체크리스트

- [x] Swagger UI에서 메트릭 엔드포인트 확인 시도
- [x] 메트릭 엔드포인트가 없음을 확인
- [ ] 백엔드 개발자에게 메트릭 엔드포인트 추가 요청
- [ ] 엔드포인트 추가 후 프론트엔드 코드 활성화


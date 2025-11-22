# 프로덕션 서버 Swagger 문서 접근 가이드

프로덕션 서버에 접속하여 백엔드 API Swagger 문서를 확인하는 방법입니다.

## 서버 정보

- **서버 주소**: 161.97.130.200
- **사용자명**: yenna
- **비밀번호**: 0000
- **프로젝트 폴더**: /home/shared/work/app
- **백엔드 API 주소**: api.moodie.shop/swagger-ui.html
- **Grafana**: grafana.moodie.shop
- **ArgoCD**: https://argocd.moodie.shop/

## 방법 1: 브라우저에서 직접 접속 (가장 간단)

프로덕션 서버의 백엔드가 이미 실행 중이라면, 브라우저에서 직접 접속할 수 있습니다.

### Swagger UI 접속

**올바른 주소:**
- https://api.moodie.shop/swagger-ui.html
- 또는 http://api.moodie.shop/swagger-ui.html

**참고:** 제공된 정보에 "wagger-ui.html"이라고 되어 있지만, 올바른 경로는 "swagger-ui.html"입니다.

### Redoc 접속

- https://api.moodie.shop/redoc.html

### Actuator Health

- https://api.moodie.shop/actuator/health

## 방법 2: PuTTY로 서버 접속 후 확인

서버에 직접 접속하여 백엔드 상태를 확인하거나 로그를 확인할 수 있습니다.

### Step 1: PuTTY 설정

**PuTTY 연결 설정:**

```
Host Name (or IP address): 161.97.130.200
Port: 22
Connection type: SSH
```

**저장:**
1. Saved Sessions에 "Production Server" 입력
2. Save 버튼 클릭

### Step 2: 접속

1. **Open** 버튼 클릭
2. 첫 접속 시 "Host key not cached" 메시지 → **"예(Y)"** 클릭
3. 로그인:
   ```
   login as: yenna
   password: 0000
   ```

### Step 3: 프로젝트 디렉토리로 이동

```bash
# 프로젝트 폴더로 이동
cd /home/shared/work/app

# 디렉토리 확인
ls -la
```

### Step 4: 백엔드 상태 확인

```bash
# Docker 컨테이너 확인
docker ps

# 백엔드 로그 확인
docker logs board-backend

# 또는 docker-compose 사용 시
docker-compose ps
docker-compose logs backend
```

### Step 5: 백엔드가 실행 중인지 확인

```bash
# 헬스 체크
curl http://localhost:8080/actuator/health

# 또는 외부에서 접근 가능한지 확인
curl http://api.moodie.shop/actuator/health
```

## 방법 3: 로컬에서 Swagger 확인 (VM에서)

현재 VM에서 실행 중인 백엔드의 Swagger를 확인하려면:

### VM 내부 브라우저에서

```bash
# Firefox 설치 (없는 경우)
sudo apt update
sudo apt install firefox -y

# 브라우저에서 접속
# http://localhost:8080/swagger-ui.html
```

### Windows 브라우저에서 (포트 포워딩 필요)

포트 포워딩을 설정했다면:

- http://localhost:8080/swagger-ui.html

## Swagger 문서에서 확인할 내용

### 메트릭 엔드포인트 찾기

1. **Swagger UI 접속**
   - https://api.moodie.shop/swagger-ui.html

2. **POST 메서드 필터링**
   - 상단 필터에서 "POST" 선택

3. **메트릭 관련 엔드포인트 검색**
   - `/api/metrics`
   - `/api/analytics`
   - `/api/telemetry`
   - `/monitoring/metrics`

4. **엔드포인트 클릭하여 상세 확인**
   - Request Body 구조
   - Response 구조
   - 파라미터 설명

## 전체 접근 방법 요약

### 옵션 1: 브라우저에서 직접 접속 (권장)

```
https://api.moodie.shop/swagger-ui.html
```

### 옵션 2: PuTTY로 서버 접속

```bash
# PuTTY 설정
Host: 161.97.130.200
Port: 22
User: yenna
Password: 0000

# 접속 후
cd /home/shared/work/app
docker ps
curl http://localhost:8080/actuator/health
```

### 옵션 3: 로컬 VM에서 확인

```
http://localhost:8080/swagger-ui.html
```

## 문제 해결

### Swagger UI가 표시되지 않는 경우

**확인 사항:**

1. **백엔드가 실행 중인지 확인**
   ```bash
   # 서버에 접속하여
   docker ps
   curl http://localhost:8080/actuator/health
   ```

2. **포트 확인**
   ```bash
   # 포트 8080이 열려있는지 확인
   sudo netstat -tulpn | grep 8080
   ```

3. **방화벽 확인**
   ```bash
   # 방화벽 상태 확인
   sudo ufw status
   ```

4. **URL 확인**
   - 올바른 URL: `https://api.moodie.shop/swagger-ui.html`
   - 잘못된 URL: `api.moodie.shop/wagger-ui.html` (오타)

### PuTTY 접속 실패

**확인 사항:**

1. **네트워크 연결 확인**
   ```bash
   # Windows에서
   ping 161.97.130.200
   ```

2. **SSH 서비스 확인**
   - 서버에서 SSH가 실행 중인지 확인 필요

3. **포트 확인**
   - 기본 SSH 포트: 22

## 다음 단계

Swagger UI에서 메트릭 엔드포인트를 확인한 후:

1. ✅ 엔드포인트 URL 확인
2. ✅ Request Body 구조 확인
3. ✅ Response 구조 확인
4. ✅ 프론트엔드 코드 구현

## 체크리스트

- [ ] 브라우저에서 https://api.moodie.shop/swagger-ui.html 접속 시도
- [ ] PuTTY로 서버 접속 (필요한 경우)
- [ ] 백엔드 상태 확인
- [ ] Swagger UI에서 POST 메서드로 메트릭 엔드포인트 검색
- [ ] 엔드포인트 상세 정보 확인

## 참고

- **백엔드 API**: https://api.moodie.shop/swagger-ui.html
- **Grafana**: grafana.moodie.shop (비밀번호: 5YeMhl41OTWA3aP4t82vUI1V5JVEjFfQmUgr0rqN)
- **ArgoCD**: https://argocd.moodie.shop/ (비밀번호: TUlpiL3hO0eJK1Zi)


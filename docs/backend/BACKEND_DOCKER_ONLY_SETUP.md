# 백엔드 Docker 실행 가이드 (docker-compose 없이)

Docker만 사용하여 백엔드를 실행하는 방법입니다.

## 사전 준비 확인

### Docker 확인

```bash
# Docker 버전 확인
docker --version

# Docker 서비스 상태 확인
sudo systemctl status docker

# Docker 실행 확인
docker ps
```

## 단계별 실행

### Step 1: 작업 디렉토리 생성 및 이동

```bash
# work 디렉토리 생성 (없는 경우)
mkdir -p ~/work
cd ~/work
```

### Step 2: 백엔드 저장소 클론

```bash
# 백엔드 저장소 클론
git clone https://github.com/Suehyun666/Board_BE.git
cd Board_BE

# 디렉토리 구조 확인
ls -la
```

### Step 3: Dockerfile 확인

```bash
# Dockerfile 확인
cat Dockerfile

# docker-compose.yml 확인 (참고용)
cat docker-compose.yml
```

### Step 4: PostgreSQL 컨테이너 실행

```bash
# PostgreSQL 네트워크 생성 (컨테이너 간 통신용)
docker network create board-network

# PostgreSQL 컨테이너 실행
docker run -d \
  --name board-postgres \
  --network board-network \
  -e POSTGRES_USER=board_user \
  -e POSTGRES_PASSWORD=board_password \
  -e POSTGRES_DB=board \
  -p 5432:5432 \
  postgres:17
```

**옵션 설명:**
- `-d`: 백그라운드 실행
- `--name`: 컨테이너 이름
- `--network`: 네트워크 연결
- `-e`: 환경 변수 설정
- `-p`: 포트 매핑 (호스트:컨테이너)

### Step 5: PostgreSQL 상태 확인

```bash
# 컨테이너 실행 확인
docker ps

# PostgreSQL 로그 확인
docker logs board-postgres

# PostgreSQL 연결 테스트
docker exec -it board-postgres psql -U board_user -d board -c "SELECT version();"
```

### Step 6: 백엔드 이미지 빌드

```bash
# 백엔드 디렉토리에서 이미지 빌드
docker build -t board-backend:latest .

# 이미지 확인
docker images | grep board-backend
```

### Step 7: 백엔드 컨테이너 실행

```bash
# 백엔드 컨테이너 실행
docker run -d \
  --name board-backend \
  --network board-network \
  -e DB_URL=jdbc:postgresql://board-postgres:5432/board \
  -e DB_USERNAME=board_user \
  -e DB_PASSWORD=board_password \
  -p 8080:8080 \
  board-backend:latest
```

**환경 변수는 백엔드의 application.yml에 맞게 조정하세요.**

### Step 8: 백엔드 상태 확인

```bash
# 컨테이너 실행 확인
docker ps

# 백엔드 로그 확인
docker logs board-backend

# 실시간 로그 확인
docker logs -f board-backend
```

### Step 9: 서버 접근 테스트

```bash
# 헬스 체크
curl http://localhost:8080/actuator/health

# Swagger UI 접근 (브라우저에서)
# http://localhost:8080/swagger-ui.html
```

## 전체 명령어 요약 (복사해서 실행)

```bash
# 1. 작업 디렉토리 생성 및 이동
mkdir -p ~/work
cd ~/work

# 2. 백엔드 저장소 클론
git clone https://github.com/Suehyun666/Board_BE.git
cd Board_BE

# 3. Docker 네트워크 생성
docker network create board-network

# 4. PostgreSQL 컨테이너 실행
docker run -d \
  --name board-postgres \
  --network board-network \
  -e POSTGRES_USER=board_user \
  -e POSTGRES_PASSWORD=board_password \
  -e POSTGRES_DB=board \
  -p 5432:5432 \
  postgres:17

# 5. PostgreSQL 상태 확인 (잠시 대기)
sleep 5
docker logs board-postgres

# 6. 백엔드 이미지 빌드
docker build -t board-backend:latest .

# 7. 백엔드 컨테이너 실행
docker run -d \
  --name board-backend \
  --network board-network \
  -e DB_URL=jdbc:postgresql://board-postgres:5432/board \
  -e DB_USERNAME=board_user \
  -e DB_PASSWORD=board_password \
  -p 8080:8080 \
  board-backend:latest

# 8. 상태 확인
docker ps

# 9. 헬스 체크
sleep 10
curl http://localhost:8080/actuator/health
```

## 환경 변수 확인 및 수정

백엔드의 `application.yml` 또는 `application.properties`를 확인하여 필요한 환경 변수를 설정하세요:

```bash
# application.yml 확인
cat src/main/resources/application.yml

# 또는
cat src/main/resources/application.properties
```

**일반적인 환경 변수:**
- `DB_URL`: 데이터베이스 연결 URL
- `DB_USERNAME`: 데이터베이스 사용자명
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `DB_POOL_SIZE`: 커넥션 풀 크기

## 유용한 명령어

### 컨테이너 관리

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a

# 컨테이너 중지
docker stop board-backend
docker stop board-postgres

# 컨테이너 시작
docker start board-backend
docker start board-postgres

# 컨테이너 재시작
docker restart board-backend
docker restart board-postgres

# 컨테이너 삭제
docker rm board-backend
docker rm board-postgres

# 컨테이너 중지 및 삭제
docker stop board-backend board-postgres
docker rm board-backend board-postgres
```

### 로그 확인

```bash
# 백엔드 로그 확인
docker logs board-backend

# 실시간 로그 확인
docker logs -f board-backend

# 최근 100줄만 확인
docker logs --tail=100 board-backend

# 특정 시간 이후 로그
docker logs --since 10m board-backend
```

### 데이터베이스 접속

```bash
# PostgreSQL 컨테이너에 접속
docker exec -it board-postgres psql -U board_user -d board

# SQL 쿼리 실행
docker exec board-postgres psql -U board_user -d board -c "SELECT * FROM posts;"

# 데이터베이스 목록 확인
docker exec board-postgres psql -U board_user -d board -c "\l"
```

### 네트워크 관리

```bash
# 네트워크 목록 확인
docker network ls

# 네트워크 상세 정보
docker network inspect board-network

# 네트워크 삭제
docker network rm board-network
```

### 이미지 관리

```bash
# 이미지 목록 확인
docker images

# 이미지 삭제
docker rmi board-backend:latest

# 사용하지 않는 이미지 삭제
docker image prune -a
```

## 문제 해결

### 문제 1: 포트 5432가 이미 사용 중 (PostgreSQL)

**오류 메시지:**
```
failed to bind host port 0.0.0.0:5432/tcp: address already in use
```

**원인:**
- 로컬에 PostgreSQL이 이미 설치되어 실행 중이거나
- 다른 Docker 컨테이너가 포트 5432를 사용 중

**해결 방법 1: 포트 사용 중인 프로세스 확인 및 종료**

```bash
# 포트 5432 사용 중인 프로세스 확인
sudo lsof -i :5432
# 또는
sudo netstat -tulpn | grep 5432

# 프로세스 종료 (PID 확인 후)
sudo kill -9 <PID>

# 또는 PostgreSQL 서비스 중지 (로컬 설치된 경우)
sudo systemctl stop postgresql
sudo systemctl disable postgresql
```

**해결 방법 2: 다른 포트 사용 (권장)**

PostgreSQL 컨테이너를 다른 포트로 실행:

```bash
# 기존 컨테이너 삭제 (있는 경우)
docker rm -f board-postgres

# 다른 포트로 실행 (5433 사용)
docker run -d \
  --name board-postgres \
  --network board-network \
  -e POSTGRES_USER=board_user \
  -e POSTGRES_PASSWORD=board_password \
  -e POSTGRES_DB=board \
  -p 5433:5432 \
  postgres:17
```

**주의:** 포트를 변경한 경우, 백엔드 컨테이너 실행 시에도 포트를 맞춰야 합니다.

**해결 방법 3: 기존 Docker 컨테이너 확인 및 정리**

```bash
# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a

# 포트 5432를 사용하는 컨테이너 확인
docker ps -a | grep 5432

# 기존 컨테이너 중지 및 삭제
docker stop board-postgres
docker rm board-postgres
```

### 문제 1-2: 포트 8080이 이미 사용 중 (Backend)

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :8080
# 또는
sudo netstat -tulpn | grep 8080

# 기존 컨테이너 확인
docker ps -a | grep 8080

# 기존 컨테이너 중지 및 삭제
docker stop $(docker ps -aq --filter "publish=8080")
docker rm $(docker ps -aq --filter "publish=8080")
```

### 문제 2: PostgreSQL 연결 실패

```bash
# PostgreSQL 컨테이너 로그 확인
docker logs board-postgres

# PostgreSQL 컨테이너 상태 확인
docker ps | grep postgres

# PostgreSQL 재시작
docker restart board-postgres

# 네트워크 확인
docker network inspect board-network
```

### 문제 3: 백엔드가 시작되지 않음

```bash
# 백엔드 로그 확인
docker logs board-backend

# 백엔드 컨테이너 상태 확인
docker ps -a | grep backend

# 백엔드 재빌드
docker build -t board-backend:latest .

# 기존 컨테이너 삭제 후 재실행
docker stop board-backend
docker rm board-backend
docker run -d \
  --name board-backend \
  --network board-network \
  -e DB_URL=jdbc:postgresql://board-postgres:5432/board \
  -e DB_USERNAME=board_user \
  -e DB_PASSWORD=board_password \
  -p 8080:8080 \
  board-backend:latest
```

### 문제 4: 네트워크 오류

```bash
# 네트워크 확인
docker network ls

# 네트워크 재생성
docker network rm board-network
docker network create board-network

# 컨테이너 재시작
docker restart board-postgres board-backend
```

### 문제 5: 권한 오류

```bash
# Docker 그룹에 사용자 추가
sudo usermod -aG docker $USER
newgrp docker

# 또는 sudo 사용
sudo docker ps
```

## 정리 (Cleanup)

### 모든 컨테이너 및 네트워크 삭제

```bash
# 컨테이너 중지 및 삭제
docker stop board-backend board-postgres
docker rm board-backend board-postgres

# 네트워크 삭제
docker network rm board-network

# 이미지 삭제 (선택사항)
docker rmi board-backend:latest
```

### 완전 정리

```bash
# 모든 중지된 컨테이너 삭제
docker container prune

# 사용하지 않는 네트워크 삭제
docker network prune

# 사용하지 않는 이미지 삭제
docker image prune -a
```

## 다음 단계

백엔드가 정상적으로 실행되면:

1. ✅ Swagger UI 접속 확인
   - VM 내부: http://localhost:8080/swagger-ui.html
   - Windows: http://localhost:8080/swagger-ui.html (포트 포워딩 필요)

2. ✅ 메트릭 엔드포인트 확인
   - Swagger UI에서 POST 메서드로 메트릭 관련 엔드포인트 검색

3. ✅ 프론트엔드와 연동 테스트

## 체크리스트

- [ ] Docker 설치 확인
- [ ] work 디렉토리 생성
- [ ] 백엔드 저장소 클론
- [ ] Docker 네트워크 생성
- [ ] PostgreSQL 컨테이너 실행
- [ ] 백엔드 이미지 빌드
- [ ] 백엔드 컨테이너 실행
- [ ] 컨테이너 상태 확인
- [ ] 로그 확인
- [ ] 헬스 체크 성공
- [ ] Swagger UI 접근 확인

## 참고

- 백엔드 저장소: https://github.com/Suehyun666/Board_BE
- 백엔드 README: https://github.com/Suehyun666/Board_BE/blob/master/README.md
- Docker 공식 문서: https://docs.docker.com/


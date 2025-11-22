# 베어메탈 환경에서 Docker 네트워크 설정 가이드

로컬 PostgreSQL과 베어메탈 IP 환경에서 Docker 컨테이너를 실행하는 방법입니다.

## 현재 상황

1. **로컬 PostgreSQL**: 포트 5432 사용 중
2. **베어메탈 IP**: 10.0.0.20~10.0.0.40 범위에서 할당
3. **Docker 컨테이너**: 별도 네트워크 필요

## 네트워크 구조 이해

### 베어메탈 IP vs Docker 네트워크

- **베어메탈 IP (10.0.0.20~10.0.0.40)**: VM의 물리적 네트워크 인터페이스 IP
- **Docker 네트워크**: 컨테이너 간 통신을 위한 가상 네트워크 (베어메탈 IP와 독립적)

**중요:** Docker 컨테이너는 자체 네트워크를 사용하므로 베어메탈 IP와는 별개로 동작합니다.

## 해결 방법

### Step 1: PostgreSQL 포트 변경

로컬 PostgreSQL이 5432를 사용하므로, Docker 컨테이너는 다른 포트를 사용합니다.

```bash
# 기존 컨테이너 정리
docker rm -f board-postgres

# 포트 5433으로 PostgreSQL 실행
docker run -d \
  --name board-postgres \
  --network board-network \
  -e POSTGRES_USER=board_user \
  -e POSTGRES_PASSWORD=board_password \
  -e POSTGRES_DB=board \
  -p 5433:5432 \
  postgres:17
```

### Step 2: 네트워크 확인

```bash
# Docker 네트워크 확인
docker network ls

# board-network 상세 정보 확인
docker network inspect board-network

# 컨테이너 IP 확인
docker inspect board-postgres | grep IPAddress
```

## 네트워크 구조

```
VM (베어메탈 IP: 10.0.0.x)
│
├── 로컬 PostgreSQL (포트 5432)
│   └── localhost:5432
│
└── Docker 네트워크 (board-network)
    ├── board-postgres 컨테이너
    │   └── 내부 IP: 172.x.x.x (Docker 자동 할당)
    │   └── 호스트 포트: 5433 → 컨테이너 포트: 5432
    │
    └── board-backend 컨테이너
        └── 내부 IP: 172.x.x.x (Docker 자동 할당)
        └── 호스트 포트: 8080 → 컨테이너 포트: 8080
```

## 전체 실행 명령어

```bash
# 1. 작업 디렉토리로 이동
cd ~/work/Board_BE

# 2. Docker 네트워크 생성 (이미 있다면 스킵)
docker network create board-network

# 3. 기존 컨테이너 정리
docker rm -f board-postgres board-backend

# 4. PostgreSQL 컨테이너 실행 (포트 5433)
docker run -d \
  --name board-postgres \
  --network board-network \
  -e POSTGRES_USER=board_user \
  -e POSTGRES_PASSWORD=board_password \
  -e POSTGRES_DB=board \
  -p 5433:5432 \
  postgres:17

# 5. PostgreSQL 상태 확인
sleep 5
docker ps | grep postgres
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

## 포트 매핑 정리

| 서비스 | 호스트 포트 | 컨테이너 포트 | 접근 방법 |
|--------|------------|--------------|----------|
| 로컬 PostgreSQL | 5432 | - | localhost:5432 |
| Docker PostgreSQL | 5433 | 5432 | localhost:5433 |
| Backend API | 8080 | 8080 | localhost:8080 |

## 컨테이너 간 통신

Docker 네트워크 내에서 컨테이너는 **컨테이너 이름**으로 통신합니다:

```bash
# 백엔드에서 PostgreSQL 접근
# DB_URL=jdbc:postgresql://board-postgres:5432/board
# ↑ 컨테이너 이름 사용, 컨테이너 내부 포트(5432) 사용
```

**중요:**
- 컨테이너 간 통신: `board-postgres:5432` (컨테이너 내부 포트)
- 호스트에서 접근: `localhost:5433` (호스트 포트)

## 베어메탈 IP와의 관계

### 베어메탈 IP는 VM의 IP

```bash
# VM의 베어메탈 IP 확인
ip addr show

# 예시 출력:
# eth0: inet 10.0.0.25/24
```

### Docker 컨테이너는 독립적

- Docker 컨테이너는 자체 네트워크(172.x.x.x)를 사용
- 베어메탈 IP(10.0.0.x)와는 별개
- 포트 포워딩을 통해 호스트(VM)의 포트로 접근 가능

### 외부에서 접근

베어메탈 IP를 통해 외부에서 접근하려면:

```
http://10.0.0.25:8080/swagger-ui.html
```

포트 포워딩이 설정되어 있다면 Windows에서도 접근 가능:
```
http://localhost:8080/swagger-ui.html
```

## 문제 해결

### 문제 1: 컨테이너 간 통신 실패

```bash
# 네트워크 확인
docker network inspect board-network

# 컨테이너가 같은 네트워크에 있는지 확인
docker inspect board-postgres | grep NetworkMode
docker inspect board-backend | grep NetworkMode
```

### 문제 2: 포트 충돌

```bash
# 모든 포트 사용 확인
sudo netstat -tulpn | grep -E '5432|5433|8080'

# 특정 포트 사용 확인
sudo lsof -i :5433
sudo lsof -i :8080
```

### 문제 3: 로컬 PostgreSQL과 충돌

로컬 PostgreSQL을 사용하지 않는다면:

```bash
# 로컬 PostgreSQL 중지
sudo systemctl stop postgresql
sudo systemctl disable postgresql

# 이제 포트 5432 사용 가능
docker run -d \
  --name board-postgres \
  --network board-network \
  -e POSTGRES_USER=board_user \
  -e POSTGRES_PASSWORD=board_password \
  -e POSTGRES_DB=board \
  -p 5432:5432 \
  postgres:17
```

## 체크리스트

- [ ] 로컬 PostgreSQL 포트 확인 (5432)
- [ ] Docker PostgreSQL 포트 변경 (5433)
- [ ] Docker 네트워크 생성
- [ ] PostgreSQL 컨테이너 실행
- [ ] 백엔드 컨테이너 실행
- [ ] 컨테이너 간 통신 확인
- [ ] 헬스 체크 성공

## 요약

1. **로컬 PostgreSQL**: 포트 5432 사용 중 → 그대로 유지
2. **Docker PostgreSQL**: 포트 5433 사용 (호스트 포트)
3. **베어메탈 IP**: Docker 컨테이너와 무관 (VM의 물리적 IP)
4. **컨테이너 간 통신**: Docker 네트워크를 통해 자동으로 이루어짐

Docker 컨테이너는 베어메탈 IP와 독립적으로 동작하므로, 포트만 변경하면 정상 작동합니다.


# 다음 단계 가이드

백엔드 서버 실행 후 진행할 단계들입니다.

## 현재 완료된 상태

- ✅ 백엔드 서버 실행 완료
- ✅ Swagger UI 접속 가능 (https://api.moodie.shop/swagger-ui/index.html)
- ✅ 프론트엔드 코드 구현 완료
- ✅ 메트릭 수집 기능 구현 완료 (전송 기능은 백엔드 엔드포인트 추가 대기)

## 다음 단계

### Step 1: 백엔드 API 테스트 (Swagger UI)

Swagger UI에서 게시글 API를 테스트하여 정상 작동 확인:

1. **Swagger UI 접속**
   - https://api.moodie.shop/swagger-ui/index.html

2. **게시글 작성 테스트**
   - `POST /api/posts` 클릭
   - "Try it out" 버튼 클릭
   - Request Body 입력:
     ```json
     {
       "title": "테스트 게시글",
       "content": "테스트 내용",
       "author": "테스트 사용자"
     }
     ```
   - "Execute" 버튼 클릭
   - Response 확인

3. **게시글 목록 조회 테스트**
   - `GET /api/posts` 클릭
   - "Try it out" 버튼 클릭
   - Query Parameters 확인 (page, size, sort, keyword)
   - "Execute" 버튼 클릭
   - Response 확인

4. **게시글 상세 조회 테스트**
   - `GET /api/posts/{id}` 클릭
   - 작성한 게시글의 ID 사용
   - Response 확인

5. **게시글 수정/삭제 테스트**
   - `PUT /api/posts/{id}` - 수정
   - `DELETE /api/posts/{id}` - 삭제

### Step 2: 프론트엔드 환경 변수 설정

프론트엔드 프로젝트에서 백엔드 API URL 설정:

1. **프로젝트 루트에 `.env` 파일 생성**
   ```env
   VITE_API_BASE_URL=https://api.moodie.shop
   ```

2. **또는 로컬 개발 시**
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

### Step 3: 프론트엔드 로컬 테스트

Windows에서 프론트엔드를 실행하여 백엔드와 연동 테스트:

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저에서 접속**
   - http://localhost:3000

4. **기능 테스트**
   - 게시글 목록 조회
   - 게시글 작성
   - 게시글 수정
   - 게시글 삭제
   - 검색 기능
   - 페이징 기능

### Step 4: 프론트엔드 빌드 및 Docker 이미지 생성

프로덕션 배포를 위한 빌드:

1. **프로덕션 빌드**
   ```bash
   npm run build
   ```

2. **Docker 이미지 빌드**
   ```bash
   docker build -t board-frontend:latest .
   ```

3. **이미지 확인**
   ```bash
   docker images | grep board-frontend
   ```

### Step 5: VM으로 프론트엔드 전송

프론트엔드 프로젝트를 VM으로 전송:

**방법 1: Git 사용 (권장)**
```bash
# Windows에서 Git 저장소에 푸시
git add .
git commit -m "프론트엔드 구현 완료"
git push

# VM에서 클론
cd ~/work
git clone <your-repo-url>
cd Board_FE
```

**방법 2: SCP 사용**
```powershell
# Windows PowerShell에서
scp -r C:\Users\woori\Desktop\Board_FE yenna@161.97.130.200:/home/shared/work/app/
```

### Step 6: VM에서 프론트엔드 Docker 이미지 빌드

VM에 접속하여:

```bash
# 프로젝트 디렉토리로 이동
cd /home/shared/work/app/Board_FE

# Docker 이미지 빌드
docker build -t board-frontend:latest .

# 이미지 확인
docker images | grep board-frontend
```

### Step 7: Kubernetes에 프론트엔드 배포

VM에서 Kubernetes 클러스터에 배포:

```bash
# 네임스페이스 확인/생성
kubectl create namespace board-frontend --dry-run=client -o yaml | kubectl apply -f -

# ConfigMap 배포
kubectl apply -f k8s/configmap.yaml -n board-frontend

# Deployment 및 Service 배포
kubectl apply -f k8s/deployment.yaml -n board-frontend

# 배포 상태 확인
kubectl get pods,svc -n board-frontend

# 로그 확인
kubectl logs -f deployment/board-frontend -n board-frontend
```

### Step 8: 포트 포워딩 설정 (VirtualBox)

Windows에서 접근하기 위한 포트 포워딩:

1. **VirtualBox 네트워크 관리자**
   - 파일 → 도구 → 네트워크 관리자
   - NAT 네트워크 선택 → 편집 → 포트 포워딩

2. **포트 포워딩 규칙 추가**
   ```
   규칙 이름: frontend
   프로토콜: TCP
   호스트 포트: 3000
   게스트 IP: [VM IP 주소]
   게스트 포트: 80
   ```

3. **접속 테스트**
   - Windows 브라우저: http://localhost:3000

### Step 9: 전체 시스템 통합 테스트

프론트엔드와 백엔드가 정상 연동되는지 확인:

1. **프론트엔드 접속**
   - http://localhost:3000 (포트 포워딩 설정 시)

2. **게시글 CRUD 테스트**
   - 목록 조회
   - 게시글 작성
   - 게시글 수정
   - 게시글 삭제
   - 검색 기능
   - 페이징 기능

3. **에러 처리 확인**
   - 네트워크 오류 시나리오
   - API 오류 응답 처리

### Step 10: CI/CD 파이프라인 설정 (선택사항)

GitHub Actions를 통한 자동 배포:

1. **GitHub 저장소에 코드 푸시**
   ```bash
   git add .
   git commit -m "프론트엔드 구현 완료"
   git push origin main
   ```

2. **GitHub Actions 확인**
   - GitHub 저장소 → Actions 탭
   - 워크플로우 실행 확인

3. **Docker 이미지 확인**
   - GitHub Container Registry 또는 설정한 레지스트리

### Step 11: ArgoCD 연동 (선택사항)

GitOps 배포를 위한 ArgoCD 설정:

1. **ArgoCD 접속**
   - https://argocd.moodie.shop/
   - 비밀번호: TUlpiL3hO0eJK1Zi

2. **Application 생성**
   ```bash
   # 스크립트 실행
   ./scripts/setup-argocd.sh <github-repo-url> k8s
   ```

3. **ArgoCD UI에서 확인**
   - Application 상태 확인
   - Sync 상태 확인

### Step 12: 모니터링 설정 (선택사항)

Prometheus 및 Grafana 연동:

1. **ServiceMonitor 배포**
   ```bash
   kubectl apply -f k8s/service-monitor.yaml
   ```

2. **Grafana 접속**
   - grafana.moodie.shop
   - 비밀번호: 5YeMhl41OTWA3aP4t82vUI1V5JVEjFfQmUgr0rqN

3. **대시보드 확인**
   - Prometheus 데이터 소스 확인
   - 프론트엔드 메트릭 확인 (백엔드 엔드포인트 추가 후)

## 단계별 체크리스트

### 즉시 할 수 있는 것

- [ ] Swagger UI에서 게시글 API 테스트
- [ ] 프론트엔드 환경 변수 설정 (.env 파일)
- [ ] 프론트엔드 로컬 테스트 (Windows)
- [ ] 프론트엔드 빌드 및 Docker 이미지 생성

### VM에서 할 것

- [ ] 프론트엔드 프로젝트를 VM으로 전송
- [ ] VM에서 Docker 이미지 빌드
- [ ] Kubernetes에 배포
- [ ] 배포 상태 확인

### 배포 후 할 것

- [ ] 포트 포워딩 설정
- [ ] 전체 시스템 통합 테스트
- [ ] CI/CD 파이프라인 설정 (선택)
- [ ] ArgoCD 연동 (선택)
- [ ] 모니터링 설정 (선택)

## 우선순위

### 필수 (프로젝트 완성을 위해)

1. ✅ 백엔드 서버 실행 (완료)
2. ⏳ Swagger UI에서 API 테스트
3. ⏳ 프론트엔드 로컬 테스트
4. ⏳ 프론트엔드 VM 배포
5. ⏳ 전체 시스템 통합 테스트

### 선택사항 (점수 획득을 위해)

6. ⏳ CI/CD 파이프라인 설정
7. ⏳ ArgoCD 연동
8. ⏳ 모니터링 설정

## 예상 소요 시간

- Swagger API 테스트: 10분
- 프론트엔드 로컬 테스트: 15분
- VM 배포: 20분
- 통합 테스트: 15분
- CI/CD 설정: 30분
- ArgoCD 연동: 20분
- 모니터링 설정: 20분

**총 예상 시간**: 약 2시간 (선택사항 포함)

## 다음 단계 요약

1. **지금 할 것**: Swagger UI에서 게시글 API 테스트
2. **그 다음**: 프론트엔드 로컬 테스트
3. **그 다음**: VM에 배포
4. **마지막**: 통합 테스트 및 CI/CD 설정


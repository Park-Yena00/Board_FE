# GitHub에 프로젝트 푸시 가이드

GitHub 레포지토리에 프로젝트를 푸시하는 방법을 설명합니다.

## 사전 준비

1. **GitHub 레포지토리 생성 완료**
   - 레포지토리 URL 예: `https://github.com/YOUR_USERNAME/Board_FE.git`

2. **Git 설치 확인**
   ```bash
   git --version
   ```

## 단계별 푸시 방법

### Step 1: Git 저장소 초기화

```bash
# 현재 디렉토리에서 Git 초기화
git init
```

### Step 2: 원격 저장소 추가

```bash
# 원격 저장소 URL을 실제 레포지토리 URL로 변경
git remote add origin https://github.com/YOUR_USERNAME/Board_FE.git

# 원격 저장소 확인
git remote -v
```

### Step 3: 파일 추가

```bash
# 모든 파일 추가
git add .

# 또는 특정 파일만 추가
git add README.md
git add src/
```

### Step 4: 첫 커밋

```bash
# 커밋 메시지와 함께 커밋
git commit -m "Initial commit: 게시판 프론트엔드 프로젝트"

# 또는 더 상세한 커밋 메시지
git commit -m "Initial commit

- React + TypeScript + Vite 프론트엔드 구현
- 게시글 CRUD 기능
- 댓글 기능
- 로그인/회원가입 기능
- Docker 및 Kubernetes 배포 설정
- CI/CD 파이프라인 구성
- 문서화 완료"
```

### Step 5: 브랜치 이름 설정 (필요한 경우)

```bash
# 기본 브랜치를 main으로 설정
git branch -M main

# 또는 master 사용 시
# git branch -M master
```

### Step 6: GitHub에 푸시

```bash
# 첫 푸시 (upstream 설정)
git push -u origin main

# 이후 푸시는 간단하게
git push
```

## 인증 방법

### 방법 1: Personal Access Token (권장)

1. GitHub에서 Personal Access Token 생성
   - Settings > Developer settings > Personal access tokens > Tokens (classic)
   - `repo` 권한 선택
   - 토큰 생성 및 복사

2. 푸시 시 토큰 사용
   ```bash
   # 사용자명: GitHub 사용자명
   # 비밀번호: Personal Access Token
   git push -u origin main
   ```

### 방법 2: SSH 키 사용

1. SSH 키 생성 (없는 경우)
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. SSH 키를 GitHub에 추가
   - Settings > SSH and GPG keys > New SSH key
   - 공개 키 추가

3. SSH URL로 원격 저장소 변경
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/Board_FE.git
   git push -u origin main
   ```

### 방법 3: GitHub CLI 사용

```bash
# GitHub CLI 설치 후
gh auth login
git push -u origin main
```

## 전체 명령어 요약

```bash
# 1. Git 초기화
git init

# 2. 원격 저장소 추가 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. 파일 추가
git add .

# 4. 커밋
git commit -m "Initial commit: 게시판 프론트엔드 프로젝트"

# 5. 브랜치 이름 설정
git branch -M main

# 6. 푸시
git push -u origin main
```

## 문제 해결

### 문제: "remote origin already exists"

**해결:**
```bash
# 기존 원격 저장소 제거
git remote remove origin

# 새로 추가
git remote add origin https://github.com/YOUR_USERNAME/Board_FE.git
```

### 문제: "authentication failed"

**해결:**
- Personal Access Token 사용 확인
- 또는 SSH 키 설정 확인

### 문제: "branch 'main' does not exist"

**해결:**
```bash
# 브랜치 생성 및 전환
git checkout -b main

# 또는 기존 브랜치 확인
git branch
```

### 문제: "failed to push some refs"

**해결:**
```bash
# 원격 저장소의 변경사항 먼저 가져오기
git pull origin main --allow-unrelated-histories

# 충돌 해결 후 다시 푸시
git push -u origin main
```

## 이후 업데이트 방법

코드를 수정한 후:

```bash
# 변경사항 확인
git status

# 파일 추가
git add .

# 커밋
git commit -m "변경사항 설명"

# 푸시
git push
```

## .gitignore 확인

다음 파일들은 자동으로 제외됩니다:
- `node_modules/`
- `dist/`
- `.env` (환경 변수 파일)
- 기타 빌드 산출물

## 참고사항

- **환경 변수 파일**: `.env` 파일은 `.gitignore`에 포함되어 있어 푸시되지 않습니다.
- **빌드 산출물**: `dist/` 폴더도 제외됩니다.
- **의존성**: `node_modules/`는 제외되므로, 다른 사람이 클론한 후 `npm install`을 실행해야 합니다.


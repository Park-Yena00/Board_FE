# Git 경고 메시지 설명

`git add .` 실행 시 나올 수 있는 경고 메시지와 의미를 설명합니다.

## 일반적인 경고 메시지

### 1. LF/CRLF 줄바꿈 문자 경고

**경고 메시지:**
```
warning: LF will be replaced by CRLF in [파일명]
The file will have its original line endings in your working directory
```

**의미:**
- **LF (Line Feed)**: Unix/Linux/Mac에서 사용하는 줄바꿈 문자 (`\n`)
- **CRLF (Carriage Return + Line Feed)**: Windows에서 사용하는 줄바꿈 문자 (`\r\n`)
- Git이 자동으로 줄바꿈 문자를 변환하고 있다는 의미

**해결 방법:**
- **경고 무시 가능**: Git이 자동으로 처리하므로 대부분 무시해도 됩니다
- **설정 변경 (선택사항)**:
  ```bash
  # Windows에서 CRLF 사용 (기본값, 권장)
  git config --global core.autocrlf true
  
  # Unix 스타일 LF 유지 (프로젝트가 Unix 기반인 경우)
  git config --global core.autocrlf input
  
  # 자동 변환 비활성화 (권장하지 않음)
  git config --global core.autocrlf false
  ```

**현재 설정 확인:**
```bash
git config --get core.autocrlf
# true = Windows에서 CRLF 사용 (권장)
```

### 2. 파일 권한 경고

**경고 메시지:**
```
warning: You have divergent branches and need to specify how to reconcile them.
```

**의미:**
- 파일 권한 변경이 감지되었지만, Git이 자동으로 처리 중

**해결 방법:**
- 대부분 자동으로 처리되므로 무시 가능

### 3. 대소문자 구분 경고

**경고 메시지:**
```
warning: in the working copy of '[파일명]', LF will be replaced by CRLF
```

**의미:**
- 파일명의 대소문자 변경이 감지되었을 수 있음

**해결 방법:**
```bash
# 대소문자 구분 설정 (Windows는 기본적으로 구분하지 않음)
git config --global core.ignorecase false
```

### 4. 긴 경로 경고

**경고 메시지:**
```
warning: filename too long
```

**의미:**
- Windows에서 파일 경로가 260자 제한을 초과

**해결 방법:**
```bash
# 긴 경로 지원 활성화 (Windows 10 이상)
git config --global core.longpaths true
```

### 5. 실행 권한 경고

**경고 메시지:**
```
warning: chmod +x [파일명]
```

**의미:**
- 실행 가능한 파일로 표시된 파일이 있음

**해결 방법:**
- 스크립트 파일(`.sh`)의 경우 정상적인 경고
- 무시해도 됨

## 현재 프로젝트에서의 경고

### 일반적인 상황

대부분의 경고는 **무시해도 됩니다**:
- ✅ LF/CRLF 경고: Git이 자동으로 처리
- ✅ 파일 권한 경고: 자동 처리됨
- ✅ 실행 권한 경고: 스크립트 파일의 경우 정상

### 확인해야 할 경고

다음 경고는 확인이 필요합니다:
- ⚠️ "filename too long": 긴 경로 문제
- ⚠️ "fatal: ...": 실제 오류 (경고가 아님)

## 권장 설정

Windows 환경에서 권장하는 Git 설정:

```bash
# 줄바꿈 문자 자동 변환 (Windows 권장)
git config --global core.autocrlf true

# 긴 경로 지원 (Windows 10 이상)
git config --global core.longpaths true

# 대소문자 구분 (프로젝트에 따라)
git config --global core.ignorecase false
```

## 경고 무시하고 계속 진행

대부분의 경고는 **무시하고 계속 진행**해도 됩니다:

```bash
# 경고가 나와도 계속 진행
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 실제 오류 vs 경고

### 경고 (Warning)
- `warning: ...`로 시작
- 작업은 계속 진행됨
- 대부분 무시 가능

### 오류 (Error/Fatal)
- `fatal: ...` 또는 `error: ...`로 시작
- 작업이 중단됨
- 반드시 해결 필요

## 요약

**일반적인 경고 메시지:**
- ✅ **LF/CRLF 경고**: 무시 가능, Git이 자동 처리
- ✅ **파일 권한 경고**: 무시 가능
- ✅ **실행 권한 경고**: 스크립트 파일의 경우 정상

**대응 방법:**
- 대부분의 경고는 **무시하고 계속 진행** 가능
- `git commit`과 `git push`는 정상적으로 작동합니다


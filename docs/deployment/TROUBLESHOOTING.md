# Kubernetes 배포 트러블슈팅 가이드

## ImagePullBackOff 오류 진단

### 1단계: Pod 상세 정보 확인

```bash
# 현재 Pod 목록 확인 (네임스페이스 포함)
kubectl get pods -n board-frontend

# Pod 상세 정보 확인 (가장 최근 Pod 이름 사용)
kubectl describe pod <pod-name> -n board-frontend

# 또는 라벨로 Pod 찾기
kubectl get pods -l app=board-frontend -n board-frontend
POD_NAME=$(kubectl get pods -l app=board-frontend -n board-frontend -o jsonpath='{.items[0].metadata.name}')
kubectl describe pod $POD_NAME -n board-frontend
```

### 2단계: Pod 이벤트 확인

```bash
# Pod 이벤트만 확인 (가장 최근 이벤트가 맨 아래)
kubectl get events -n board-frontend --sort-by='.lastTimestamp'

# 특정 Pod의 이벤트만 확인
kubectl describe pod <pod-name> -n board-frontend | grep -A 10 Events
```

### 3단계: 이미지 확인

```bash
# 로컬 Docker 이미지 확인
docker images | grep board-frontend

# Deployment에서 사용하는 이미지 확인
kubectl get deployment board-frontend -n board-frontend -o jsonpath='{.spec.template.spec.containers[0].image}'

# 이미지 Pull 정책 확인
kubectl get deployment board-frontend -n board-frontend -o jsonpath='{.spec.template.spec.containers[0].imagePullPolicy}'
```

### 4단계: 로그 확인

```bash
# Pod 로그 확인
kubectl logs <pod-name> -n board-frontend

# 이전 컨테이너 로그 확인 (재시작된 경우)
kubectl logs <pod-name> -n board-frontend --previous
```

## ImagePullBackOff 해결 방법

### 원인 1: 로컬 이미지를 Kubernetes가 찾지 못함

**증상:**
- `docker images`에서 이미지가 보임
- 하지만 Kubernetes Pod는 이미지를 찾지 못함

**해결 방법 1: imagePullPolicy를 Never로 변경 (권장)**

```bash
# deployment.yaml 수정
# imagePullPolicy: IfNotPresent → imagePullPolicy: Never

# 또는 kubectl로 직접 수정
kubectl patch deployment board-frontend -n board-frontend -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","imagePullPolicy":"Never"}]}}}}'
```

**해결 방법 2: Minikube 환경인 경우**

```bash
# Minikube의 Docker 환경 사용
eval $(minikube docker-env)
docker build -t board-frontend:latest .
```

**해결 방법 3: 로컬 레지스트리 사용**

```bash
# 로컬 레지스트리 실행
docker run -d -p 5000:5000 --name registry registry:2

# 이미지 태그 및 푸시
docker tag board-frontend:latest localhost:5000/board-frontend:latest
docker push localhost:5000/board-frontend:latest

# deployment.yaml에서 이미지 주소 변경
# image: localhost:5000/board-frontend:latest
```

### 원인 2: 이미지가 빌드되지 않음

**증상:**
- `docker images | grep board-frontend` 결과가 없음

**해결 방법:**

```bash
# 이미지 빌드
cd /home/shared/work/board/Board_FE
docker build -t board-frontend:latest .

# 이미지 확인
docker images | grep board-frontend
```

### 원인 3: 이미지 이름/태그 불일치

**증상:**
- Deployment의 이미지 이름과 실제 빌드된 이미지 이름이 다름

**해결 방법:**

```bash
# Deployment에서 사용하는 이미지 확인
kubectl get deployment board-frontend -n board-frontend -o yaml | grep image:

# 실제 이미지 확인
docker images

# 이미지 이름/태그 일치시키기
docker tag <실제-이미지-이름> board-frontend:latest
```

## 전체 진단 스크립트

```bash
#!/bin/bash
echo "=== Kubernetes 배포 진단 ==="
echo ""

echo "1. Pod 상태:"
kubectl get pods -n board-frontend
echo ""

echo "2. Pod 상세 정보:"
POD_NAME=$(kubectl get pods -l app=board-frontend -n board-frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    kubectl describe pod $POD_NAME -n board-frontend
else
    echo "Pod를 찾을 수 없습니다."
fi
echo ""

echo "3. 로컬 Docker 이미지:"
docker images | grep board-frontend
echo ""

echo "4. Deployment 이미지 설정:"
kubectl get deployment board-frontend -n board-frontend -o jsonpath='{.spec.template.spec.containers[0]}' | jq .
echo ""

echo "5. 최근 이벤트:"
kubectl get events -n board-frontend --sort-by='.lastTimestamp' | tail -5
```


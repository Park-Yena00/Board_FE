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

**해결 방법 3: containerd를 사용하는 경우 (Kubernetes가 containerd 런타임 사용)**

**증상:**
- `docker images`에서 이미지가 보임
- 컨테이너 런타임이 `containerd://`로 표시됨
- `ErrImageNeverPull` 오류 발생

**해결 방법: Docker 이미지를 containerd로 가져오기**

```bash
# 1. Docker 이미지를 tar 파일로 내보내기
docker save board-frontend:latest -o /tmp/board-frontend.tar

# 2. containerd로 이미지 가져오기
sudo ctr -n k8s.io images import /tmp/board-frontend.tar

# 3. 이미지 태그 설정 (필요한 경우)
sudo ctr -n k8s.io images tag docker.io/library/board-frontend:latest board-frontend:latest

# 4. containerd 이미지 확인
sudo ctr -n k8s.io images ls | grep board-frontend

# 5. 임시 파일 삭제
rm -f /tmp/board-frontend.tar

# 6. Pod 재시작
kubectl delete pods -l app=board-frontend -n board-frontend
```

**해결 방법 4: 로컬 레지스트리 사용**

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

## ArgoCD Application Sync Status Unknown 오류

### 증상

```bash
kubectl get application board-frontend -n myargocd
# NAME             SYNC STATUS   HEALTH STATUS
# board-frontend   Unknown       Healthy
```

오류 메시지:
```
Failed to load live state: failed to get cluster info for "https://kubernetes.default.svc":
error synchronizing cache state : failed to load open api schema while syncing
cluster cache: error getting openapi resources: Get "https://10.96.0.1:443/openapi/v2?timeout=32s":
context deadline exceeded
```

### 원인

ArgoCD가 Kubernetes API 서버에 연결할 수 없습니다. 가능한 원인:
1. ArgoCD Application Controller의 RBAC 권한 부족
2. 네트워크 연결 문제
3. ArgoCD가 클러스터를 제대로 등록하지 못함

### 해결 방법

#### 1단계: ArgoCD Pod 상태 확인

```bash
# ArgoCD Application Controller Pod 확인
kubectl get pods -n myargocd -l app.kubernetes.io/name=argocd-application-controller

# Pod 로그 확인
kubectl logs -n myargocd -l app.kubernetes.io/name=argocd-application-controller --tail=50
```

#### 2단계: Kubernetes API 서버 연결 확인

```bash
# ArgoCD Application Controller Pod에서 직접 테스트
POD_NAME=$(kubectl get pods -n myargocd -l app.kubernetes.io/name=argocd-application-controller -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n myargocd $POD_NAME -- curl -k https://kubernetes.default.svc/healthz

# 또는 간단한 API 호출 테스트
kubectl exec -n myargocd $POD_NAME -- kubectl get nodes
```

#### 3단계: ArgoCD RBAC 권한 확인

```bash
# ArgoCD Application Controller의 ServiceAccount 확인
kubectl get serviceaccount -n myargocd argocd-application-controller

# ClusterRoleBinding 확인
kubectl get clusterrolebinding | grep argocd

# 필요한 권한이 있는지 확인
kubectl auth can-i get deployments --as=system:serviceaccount:myargocd:argocd-application-controller --all-namespaces
```

#### 4단계: ArgoCD 클러스터 등록 확인

```bash
# ArgoCD가 인식하는 클러스터 목록 확인
kubectl get secrets -n myargocd -l argocd.argoproj.io/secret-type=cluster

# 또는 ArgoCD UI에서 확인
# https://argocd.moodie.shop/settings/clusters
```

#### 5단계: Application Controller 재시작

```bash
# Application Controller Pod 재시작
kubectl delete pod -n myargocd -l app.kubernetes.io/name=argocd-application-controller

# 재시작 후 상태 확인 (약 1-2분 대기)
sleep 60
kubectl get application board-frontend -n myargocd
```

#### 6단계: Application 수동 새로고침

```bash
# Application 새로고침
kubectl patch application board-frontend -n myargocd \
  --type merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'

# 또는 ArgoCD CLI 사용 (설치되어 있다면)
argocd app refresh board-frontend
```

### 빠른 해결 방법 (일시적)

만약 위 방법들이 작동하지 않는다면, ArgoCD를 사용하지 않고 수동으로 배포할 수 있습니다:

```bash
# 수동으로 Kubernetes 리소스 배포
cd ~/work/board/Board_FE
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/ingress.yaml

# 배포 상태 확인
kubectl get pods -n board-frontend
```

### 추가 진단

```bash
# ArgoCD Application Controller 로그 상세 확인
kubectl logs -n myargocd -l app.kubernetes.io/name=argocd-application-controller --tail=100 | grep -i error

# 네트워크 정책 확인 (Calico 등 사용 시)
kubectl get networkpolicies -n myargocd

# DNS 확인
kubectl run -it --rm debug --image=busybox --restart=Never -n myargocd -- nslookup kubernetes.default.svc
```

## Prometheus Operator 설치 타임아웃 오류

### 증상

```bash
helm install --namespace mymonitoring --generate-name prometheus-community/kube-prometheus-stack -f my-values.yaml

# 에러 메시지:
Error: INSTALLATION FAILED: failed pre-install: 1 error occurred:
* timed out waiting for the condition
```

### 원인

Helm chart의 pre-install hook이 완료되지 않았습니다. 가능한 원인:
1. **CRD 설치 타임아웃**: 많은 CRD를 설치하는데 시간이 오래 걸림
2. **클러스터 리소스 부족**: CPU/메모리 부족으로 Pod가 시작되지 않음
3. **네트워크 문제**: 외부 이미지 Pull 실패
4. **기존 리소스 충돌**: 이전 설치의 리소스가 남아있음
5. **클러스터 응답 지연**: Kubernetes API 서버가 느림

### 해결 방법

#### 1단계: 현재 상태 확인

```bash
# 실패한 Helm 릴리스 확인
helm list -n mymonitoring

# 네임스페이스의 모든 리소스 확인
kubectl get all -n mymonitoring

# 실패한 Pod 확인
kubectl get pods -n mymonitoring

# 이벤트 확인
kubectl get events -n mymonitoring --sort-by='.lastTimestamp'

# CRD 설치 상태 확인
kubectl get crd | grep monitoring
```

#### 2단계: 실패한 설치 정리

```bash
# 실패한 Helm 릴리스 삭제
helm list -n mymonitoring
helm uninstall <release-name> -n mymonitoring

# 또는 모든 리소스 수동 삭제
kubectl delete namespace mymonitoring

# CRD 정리 (주의: 다른 애플리케이션에 영향 가능)
kubectl get crd | grep monitoring.coreos.com
# 필요한 경우만 삭제:
# kubectl delete crd <crd-name>
```

#### 3단계: 클러스터 리소스 확인

```bash
# 노드 상태 확인 (중요!)
kubectl get nodes

# 노드 상세 정보 (Taint 확인)
kubectl describe nodes

# 노드 리소스 확인
kubectl top nodes

# 전체 Pod 리소스 사용량 확인
kubectl top pods --all-namespaces

# Pending 상태인 Pod 확인
kubectl get pods --all-namespaces --field-selector=status.phase=Pending

# Pending Pod의 스케줄링 실패 이유 확인
kubectl describe pod <pending-pod-name> -n mymonitoring | grep -A 10 Events
```

**중요: 워커 노드가 없는 경우**

마스터 노드만 있는 경우, 마스터 노드에 `node-role.kubernetes.io/control-plane` 또는 `node-role.kubernetes.io/master` Taint가 있어서 일반 Pod가 스케줄링되지 않을 수 있습니다.

**해결 방법:**

```bash
# 1. 마스터 노드의 Taint 확인
kubectl describe nodes | grep Taints

# 2. 마스터 노드에 Pod 스케줄링 허용 (테스트용, 프로덕션에서는 권장하지 않음)
kubectl taint nodes <node-name> node-role.kubernetes.io/control-plane:NoSchedule- --overwrite

# 또는 특정 Pod만 허용 (더 안전)
# my-values.yaml에 추가:
# prometheus:
#   prometheusSpec:
#     tolerations:
#       - key: node-role.kubernetes.io/control-plane
#         operator: Exists
#         effect: NoSchedule
```

#### 4단계: 타임아웃 시간 증가하여 재설치

```bash
# 타임아웃 시간을 20분으로 증가
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace mymonitoring \
  --create-namespace \
  --wait \
  --timeout 20m \
  -f my-values.yaml

# 또는 타임아웃 없이 설치 (수동으로 확인)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace mymonitoring \
  --create-namespace \
  --wait=false \
  -f my-values.yaml

# 설치 후 수동으로 확인
kubectl get pods -n mymonitoring -w
```

#### 5단계: 단계별 설치 (권장)

CRD를 먼저 설치하고, 그 다음 나머지를 설치:

```bash
# 1. CRD만 먼저 설치
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace mymonitoring \
  --create-namespace \
  --set crds.enabled=true \
  --set prometheus.enabled=false \
  --set grafana.enabled=false \
  --set alertmanager.enabled=false \
  --wait \
  --timeout 10m

# CRD 설치 확인
kubectl get crd | grep monitoring

# 2. 나머지 컴포넌트 설치
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace mymonitoring \
  -f my-values.yaml \
  --wait \
  --timeout 20m
```

#### 6단계: 리소스 제한 완화

`my-values.yaml`에서 리소스 제한을 완화:

```yaml
# my-values.yaml
prometheus:
  prometheusSpec:
    resources:
      requests:
        memory: "512Mi"
        cpu: "250m"
      limits:
        memory: "2Gi"
        cpu: "1000m"

grafana:
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "500m"

alertmanager:
  alertmanagerSpec:
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "512Mi"
        cpu: "500m"
```

#### 7단계: 최소 구성으로 설치

필수 컴포넌트만 설치:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace mymonitoring \
  --create-namespace \
  --set alertmanager.enabled=false \
  --set kubeStateMetrics.enabled=false \
  --set nodeExporter.enabled=false \
  --wait \
  --timeout 15m
```

### 빠른 해결 방법

가장 간단한 방법:

```bash
# 1. 실패한 설치 정리
helm list -n mymonitoring
helm uninstall <release-name> -n mymonitoring 2>/dev/null || true
kubectl delete namespace mymonitoring 2>/dev/null || true

# 2. 네임스페이스 재생성
kubectl create namespace mymonitoring

# 3. 타임아웃 없이 설치 (수동 확인)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace mymonitoring \
  --create-namespace \
  --wait=false

# 4. Pod 상태 확인 (별도 터미널에서)
watch kubectl get pods -n mymonitoring

# 5. 모든 Pod가 Ready 상태가 될 때까지 대기 (약 5-10분)
# kubectl wait --for=condition=ready pod --all -n mymonitoring --timeout=15m
```

### 설치 확인

```bash
# Pod 상태 확인
kubectl get pods -n mymonitoring

# Service 확인
kubectl get svc -n mymonitoring

# ServiceMonitor CRD 확인
kubectl get crd | grep servicemonitor

# Prometheus 접근 (포트 포워딩)
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n mymonitoring 9090:9090
# 브라우저: http://localhost:9090

# Grafana 접근 (포트 포워딩)
kubectl port-forward svc/prometheus-grafana -n mymonitoring 3000:80
# 브라우저: http://localhost:3000
# 기본 사용자: admin
# 비밀번호 확인:
kubectl get secret prometheus-grafana -n mymonitoring -o jsonpath="{.data.admin-password}" | base64 -d
```

### 추가 진단

```bash
# Helm 릴리스 상태 확인
helm status prometheus -n mymonitoring

# Helm 릴리스 이력 확인
helm history prometheus -n mymonitoring

# 실패한 Pod 로그 확인
kubectl logs -n mymonitoring <pod-name>

# 실패한 Job 확인 (pre-install hook)
kubectl get jobs -n mymonitoring
kubectl describe job <job-name> -n mymonitoring
kubectl logs job/<job-name> -n mymonitoring
```


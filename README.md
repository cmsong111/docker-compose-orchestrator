# Docker Compose Orchestrator Action

맥미니(Mac mini) 환경 및 도커 스웜(Docker Swarm) / 도커 컴포즈(Docker Compose) 기반의 GitOps 워크플로우를 위해 설계된 GitHub Action입니다. 여러 개의 분산된 도커 컴포즈 환경에서 공통으로 사용하는 **네트워크(Network)**와 **볼륨(Volume)** 정의 파일을 기반으로 리소스를 유연하고 체계적으로 통합 관리하고 구동할 수 있도록 지원합니다.

---

## 🚀 주요 기능 (Features)

- **공통 네트워크 및 볼륨 관리**: 개별 컴포즈 파일에서 분리하여 관리하기 까다로운 Docker Network 및 Volume 리소스를 정의된 YAML 파일(`network.yaml`, `volume.yaml`)을 통해 중앙 집중식으로 자동 생성 및 관리합니다.
- **GitOps 친화적 구조**: 맥미니 등의 홈랩 및 자체 호스팅(Self-hosted) 서버 환경에서 Git 저장소와 연동하여 인프라 변경 사항을 자동으로 반영할 수 있습니다.
- **TypeScript 기반 가벼운 액션**: `@actions/core`와 `@vercel/ncc`를 활용하여 번들링된 고성능 Node.js 20 액션입니다.

---

## 📥 Inputs (입력 변수)

| 입력 파라미터 | 설명 | 필수 여부 | 기본값 |
|--------------|------|-----------|--------|
| `volume-path` | 생성 및 관리할 볼륨 정의 YAML 파일 경로 | 선택 | `./volume.yaml` |
| `network-path` | 생성 및 관리할 네트워크 정의 YAML 파일 경로 | 선택 | `./network.yaml` |

---

## 💡 사용 예시 (Usage Example)

GitHub Actions 워크플로우 파일(`/.github/workflows/deploy.yml`)에서 다음과 같이 사용할 수 있습니다:

```yaml
name: Deploy Docker Compose Orchestrator

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest # 또는 맥미니 Self-hosted Runner
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run Docker Compose Orchestrator
        uses: cmsong111/docker-compose-orchestrator@main
        with:
          volume-path: './volume.yaml'
          network-path: './network.yaml'
```

---

## 🛠️ 개발 및 빌드 (Development)

1. 패키지 설치:
   ```bash
   pnpm install
   ```

2. 액션 빌드 (ncc 번들링):
   ```bash
   pnpm run build
   ```

---

## 📜 License

ISC

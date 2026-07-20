import * as core from "@actions/core";

async function run() {
  try {
    // action.yml에 정의한 파일 경로 읽어오기
    const volumePath = core.getInput("volume-path");
    const networkPath = core.getInput("network-path");

    core.info(`입력된 볼륨 경로: ${volumePath}`);
    core.info(`입력된 네트워크 경로: ${networkPath}`);
    core.info("Docker Compose Orchestrator 실행 시작...");

    // TODO: 다음 단계에서 js-yaml 등을 활용해
    // 볼륨.yaml과 네트워크.yaml을 읽어와 dockerode로 세팅하는 로직 구현
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();

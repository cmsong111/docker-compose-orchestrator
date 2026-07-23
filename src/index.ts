import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import yaml from "js-yaml";
import Docker from "dockerode";

const docker = new Docker({ socketPath: process.env.DOCKER_HOST?.replace('unix://', '') || '/var/run/docker.sock' });

async function run() {
  try {
    const volumePath = core.getInput("volume-path");
    const networkPath = core.getInput("network-path");

    core.info(`입력된 볼륨 경로: ${volumePath}`);
    core.info(`입력된 네트워크 경로: ${networkPath}`);

    // 1. 네트워크 생성 처리
    if (fs.existsSync(networkPath)) {
      const networkFile = fs.readFileSync(networkPath, "utf8");
      const networkYaml: any = yaml.load(networkFile);
      if (networkYaml && networkYaml.networks) {
        for (const [netName, netConfig] of Object.entries(networkYaml.networks)) {
          try {
            const networks = await docker.listNetworks({ filters: { name: [netName] } });
            if (networks.length === 0) {
              const driver = (netConfig as any)?.driver || "bridge";
              const external = (netConfig as any)?.external || false;
              if (!external) {
                await docker.createNetwork({ Name: netName, Driver: driver });
                core.info(`[Network] 네트워크 생성 완료: ${netName} (driver: ${driver})`);
              } else {
                core.info(`[Network] 외부 네트워크 존재 확인: ${netName}`);
              }
            } else {
              core.info(`[Network] 네트워크 이미 존재함: ${netName}`);
            }
          } catch (err: any) {
            core.warning(`[Network] 네트워크 ${netName} 처리 중 오류: ${err.message}`);
          }
        }
      }
    }

    // 2. 볼륨 생성 처리
    if (fs.existsSync(volumePath)) {
      const volumeFile = fs.readFileSync(volumePath, "utf8");
      const volumeYaml: any = yaml.load(volumeFile);
      if (volumeYaml && volumeYaml.volumes) {
        for (const [volName, volConfig] of Object.entries(volumeYaml.volumes)) {
          try {
            const volumes = await docker.listVolumes();
            const exists = volumes.Volumes?.some((v: any) => v.Name === volName);
            if (!exists) {
              const driver = (volConfig as any)?.driver || "local";
              await docker.createVolume({ Name: volName, Driver: driver });
              core.info(`[Volume] 볼륨 생성 완료: ${volName}`);
            } else {
              core.info(`[Volume] 볼륨 이미 존재함: ${volName}`);
            }
          } catch (err: any) {
            core.warning(`[Volume] 볼륨 ${volName} 처리 중 오류: ${err.message}`);
          }
        }
      }
    }

    // 3. 작업 디렉토리 내의 서브 폴더들을 순회하며 도커 컴포즈 파일 탐색 및 실행
    // 구조: /서비스명/도커컴포즈.yaml (또는 docker-compose.yaml 등)
    const workspaceDir = process.cwd();
    core.info(`[Orchestrator] 작업 디렉토리 탐색 시작: ${workspaceDir}`);

    const entries = fs.readdirSync(workspaceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        const serviceDir = path.join(workspaceDir, entry.name);
        core.info(`[Service] 서비스 디렉토리 검사 중: ${entry.name}`);

        // 해당 디렉토리 내의 yaml 파일들 검색
        const files = fs.readdirSync(serviceDir);
        const composeFileName = files.find(f => f === "docker-compose.yaml" || f === "docker-compose.yml" || f === "도커컴포즈.yaml");

        if (composeFileName) {
          const composePath = path.join(serviceDir, composeFileName);
          core.info(`[Service] 도커 컴포즈 파일 발견: ${composePath}`);
          
          const composeFile = fs.readFileSync(composePath, "utf8");
          const composeYaml: any = yaml.load(composeFile);

          if (composeYaml && composeYaml.services) {
            for (const [serviceName, svcConfig] of Object.entries(composeYaml.services)) {
              core.info(`[Container] 서비스 [${entry.name}] -> 컨테이너 대상: ${serviceName}`);
              // TODO: 도커 이미지 풀 및 컨테이너 구동/업데이트 로직 연결
            }
          }
        }
      }
    }

    core.info("[Orchestrator] 모든 네트워크, 볼륨 및 서비스 탐색 처리가 완료되었습니다.");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();

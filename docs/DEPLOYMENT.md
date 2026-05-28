# engTest (EstellExam) 배포 환경

## 운영 서버

**alpha 서버에 docker-compose로 배포되어 있다.**

- **호스트**: alpha (61.75.21.224 포트포워딩, SSH port 1722)
- **계정**: comes
- **구성 방식**: docker-compose (`engtest-frontend`, `engtest-app`, `engtest-db`)

### 컨테이너 / 포트

| 컨테이너 | 역할 | 호스트 포트 → 컨테이너 포트 |
|---|---|---|
| engtest-frontend | Nginx + React 빌드 | 23145 → 80 |
| engtest-app | Spring Boot 백엔드 | 12345 → 8080 |
| engtest-db | MariaDB 10.11 | 23146 → 3306 |

### DB 접속 정보

- DB명: `engtest`
- 계정: `engtest`
- 비밀번호: `engtest123!`
- root 비밀번호: `root123!`

## 로컬 개발 환경과의 구분

**로컬 PC에도 동일한 docker-compose 컨테이너가 떠 있을 수 있음 — 운영으로 착각 금지.**

- 로컬 = 개발용 (localhost:23146 등)
- 운영 = alpha 서버 (SSH 필요)

## 운영 DB 접근 방법

### 1) alpha 서버 SSH 접속 후 docker exec

```bash
ssh -p 1722 comes@61.75.21.224
docker exec -it engtest-db mariadb -u engtest -pengtest123! engtest
```

### 2) alpha 서버 내부에서 mariadb 클라이언트 직접 사용

```bash
mariadb -h localhost -P 23146 -u engtest -pengtest123! engtest
```

### 3) 로컬에서 운영 DB로 원격 접속 (방화벽/보안그룹에서 23146 포트 열려 있어야 함)

```bash
mariadb -h <alpha_IP> -P 23146 -u engtest -pengtest123! engtest
```

## 운영 배포 관련 파일

- [docker-compose.yml](../docker-compose.yml) — 컨테이너 정의
- [Dockerfile](../Dockerfile) — 백엔드 이미지 빌드
- [application.yaml](../src/main/resources/application.yaml) — DB 연결 설정 (환경변수 치환)
- [.env](../.env) — 로컬 DB 접속 및 Gemini API 키

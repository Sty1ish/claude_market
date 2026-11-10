# claude_market

Claude Code에서 쓰는 플러그인 모음입니다.
어느 PC에서든 명령 몇 줄이면 같은 환경을 다시 만들 수 있습니다.

## 들어 있는 것

| 플러그인 | 종류 | 하는 일 | 왜 설치하나 |
|---|---|---|---|
| **anti-slop** | **훅** (파일 수정 후 검사) + 스킬 1 | Claude가 JS/TS 파일을 고칠 때마다 자동으로 검사합니다 | AI가 대충 짠 코드(불필요한 형변환, 읽기 힘든 줄 붙임 등)를 그 자리에서 잡아 바로 다시 고치게 합니다. 사람이 리뷰하며 일일이 지적할 필요가 줄어듭니다 |
| **superpowers** | **스킬** 15 + 훅 (세션 시작 때 사용법 프롬프트 주입) | 일하는 순서를 가르치는 스킬 모음입니다 (기획 → 계획 → 테스트 먼저 → 디버깅 → 리뷰) | Claude가 바로 코드부터 쓰지 않고, 먼저 묻고 계획한 뒤 검증까지 하게 만듭니다 |
| **andrej-karpathy-skills** | **스킬** 1 | 코딩 행동 지침입니다 | 시킨 것보다 크게 만들거나, 상관없는 곳까지 고치는 버릇을 줄입니다 |
| **diagram-design** (선택) | **스킬** 1 + 명령 6 | 구조도·흐름도·간트 같은 그림을 그려 줍니다 | 문서나 보고에 쓸 그림이 필요할 때 씁니다 |
| **agent-desktop** (선택) | **MCP 서버** (플러그인 아님) | 데스크톱 앱 화면 요소(버튼·입력칸 등)를 읽고 클릭·입력합니다 | 브라우저 밖의 데스크톱 프로그램까지 Claude가 직접 조작하게 할 때 씁니다 |
| **codebase-memory-mcp** (선택) | **MCP 서버** (플러그인 아님) | 코드를 읽어 함수·호출 관계를 그래프로 만들어 두고, Claude가 그래프에 물어보게 합니다 | 큰 코드베이스에서 "누가 이 함수를 부르나", "바꾸면 어디가 깨지나"를 grep 반복 없이 찾아 토큰을 아낍니다. 작은 프로젝트에서는 이득이 거의 없습니다 |

종류 읽는 법:

- **훅**: 정해진 순간(세션 시작, 파일 수정 직후, 답변 끝 등)에 Claude Code가 자동으로 실행합니다. 부르지 않아도 돕니다. "프롬프트 주입"은 훅이 규칙 글을 대화 앞에 자동으로 붙여 Claude가 처음부터 그 규칙을 따르게 한다는 뜻입니다.
- **스킬**: Claude가 상황을 보고 스스로 꺼내 읽는 지침입니다. `/이름`으로 직접 부를 수도 있습니다.
- **명령**: `/이름`으로 직접 불러야만 실행됩니다.
- **에이전트**: 스킬이 일을 나눠 맡기는 보조 Claude입니다. 직접 부를 일은 거의 없습니다.
- **MCP 서버**: Claude가 쓸 수 있는 도구를 늘려 주는 별도 프로그램입니다. `/plugin`이 아니라 터미널에서 `claude mcp add`로 등록합니다.

## 설치 방법

### 준비물

- Claude Code
- Node.js (anti-slop이 검사 도구를 돌릴 때, agent-desktop을 설치할 때 씁니다)

### Claude Code 채팅창에 한 줄씩 입력

anti-slop만 이 저장소에서 받고, 나머지는 각 플러그인을 만든 사람의 마켓플레이스에서 바로 받습니다. 그래야 업데이트가 이 저장소를 거치지 않고 원작자에게서 바로 옵니다.

```
# anti-slop (이 저장소)
/plugin marketplace add Sty1ish/claude_market
/plugin install anti-slop@claude-market

# superpowers (Anthropic 공식 마켓플레이스)
/plugin install superpowers@claude-plugins-official

# andrej-karpathy-skills
/plugin marketplace add forrestchang/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills

# diagram-design (선택)
/plugin marketplace add cathrynlavery/diagram-design
/plugin install diagram-design@diagram-design
```

설치가 끝나면 Claude Code를 껐다 켭니다.

`superpowers@claude-plugins-official`이 없다고 나오면 공식 마켓플레이스를 먼저 추가합니다: `/plugin marketplace add anthropics/claude-plugins-official`

### 터미널에서 하고 싶다면

```
claude plugin marketplace add Sty1ish/claude_market
claude plugin install anti-slop@claude-market
claude plugin install superpowers@claude-plugins-official
claude plugin marketplace add forrestchang/andrej-karpathy-skills
claude plugin install andrej-karpathy-skills@karpathy-skills
claude plugin marketplace add cathrynlavery/diagram-design
claude plugin install diagram-design@diagram-design
```

#### agent-desktop (선택, MCP 서버)

플러그인이 아니라서 `/plugin`으로는 설치할 수 없고, 터미널에서만 설치합니다. 먼저 프로그램을 설치합니다.

```
npm install -g agent-desktop
agent-desktop status
```

그다음 Claude Code에 MCP 서버로 등록합니다. `-s user`를 붙이면 모든 프로젝트에서 쓸 수 있습니다.

```
# Windows (PowerShell 또는 cmd에서 실행. Git Bash에서는 /c가 경로로 바뀌어 연결에 실패합니다)
claude mcp add -s user agent-desktop -- cmd /c agent-desktop mcp

# macOS / Linux
claude mcp add -s user agent-desktop -- agent-desktop mcp
```

`claude mcp get agent-desktop`을 실행해 `Connected`가 나오면 끝입니다. 그다음 Claude Code를 껐다 켭니다.

#### codebase-memory-mcp (선택, MCP 서버)

이것도 플러그인이 아니라 터미널에서 설치합니다. **저장소 폴더 밖에서** 실행하세요. 공식 설치 스크립트(`install`)는 에이전트마다 훅·스킬·지침 파일까지 써 넣고, 일부는 실행한 폴더에 생겨 저장소에 커밋될 수 있습니다. 아래 방법은 MCP 서버만 내 계정에 등록하므로 같은 저장소를 쓰는 다른 사람에게 영향이 없습니다.

```
npm install -g codebase-memory-mcp
```

```
# Windows (PowerShell 또는 cmd에서 실행)
claude mcp add -s user codebase-memory -- cmd /c codebase-memory-mcp

# macOS / Linux
claude mcp add -s user codebase-memory -- codebase-memory-mcp
```

`claude mcp get codebase-memory`에서 `Connected`가 나오면 Claude Code를 껐다 켭니다. 그다음 쓸 프로젝트 폴더에서 Claude에게 "이 프로젝트 인덱싱해 줘"라고 하면 됩니다. 모노레포라면 루트 대신 쓰는 하위 프로젝트 경로를 알려 주세요 (예: "`packages/web`만 인덱싱해 줘").

## 알아 둘 것

- **anti-slop을 처음 쓸 때 몇 초 걸립니다.** 첫 검사 때 검사 도구(oxlint)를 알아서 설치합니다. 그다음부터는 바로 돌아갑니다.
- **예전에 anti-slop을 직접 설치했다면** `~/.claude/settings.json`의 `hooks` 안에 있는 `anti-slop/hook.mjs` 줄을 지우세요. 그대로 두면 검사가 두 번 돌아갑니다.
- **예전에 `@claude-market`으로 설치한 플러그인이 있다면** (anti-slop 제외) 먼저 지우고 위 명령으로 다시 설치하세요. 예: `/plugin uninstall superpowers@claude-market`. 둘 다 두면 같은 스킬이 두 벌 생깁니다.
- **agent-desktop은 화면 내용을 그대로 읽습니다.** 화면 정보, 클립보드, 스크린샷에 고객 정보 같은 민감한 내용이 담길 수 있으니 결과를 공개 저장소나 채널에 올리지 마세요. macOS는 처음에 `agent-desktop permissions --guide`로 손쉬운 사용 권한을 줘야 합니다.
  - `status` 실행 때 "Node launcher" 경고가 나와도 그대로 쓸 수 있습니다. 명령마다 0.1초쯤 느려질 뿐입니다.
  - 새 버전 받기: `npm install -g agent-desktop` (플러그인이 아니라서 `/plugin marketplace update`로는 갱신되지 않습니다)
- **codebase-memory-mcp는 모두 내 PC 안에서 돕니다.** 그래프는 `~/.cache/codebase-memory-mcp/`에 저장되고, LLM·API 키·텔레메트리가 없습니다. 쓰지 않는 팀원에게는 아무 영향이 없습니다.
  - **저장소에 아무것도 커밋하지 마세요.** `persistence: true`로 인덱싱하면 `.codebase-memory/graph.db.zst`가 저장소에 생기고, 커밋할 때마다 파일이 통째로 쌓여 저장소가 커집니다. 공용 저장소라면 `.gitignore`에 `.codebase-memory/`를 넣어 두세요. `.mcp.json`, `.cursor/mcp.json` 같은 프로젝트 MCP 설정이 생겼다면 커밋하지 마세요. 설치하지 않은 팀원의 Claude가 없는 서버를 띄우려다 오류를 냅니다.
  - 첫 인덱싱이 끝나면 `.env` 같은 비밀 파일이 들어가지 않았는지 확인하세요. 환경 변수 `CBM_ALLOWED_ROOT`에 폴더를 지정하면 그 밖은 인덱싱하지 않습니다.
  - 하위 프로젝트만 인덱싱하면 다른 패키지에서 들어오는 호출은 그래프에 보이지 않습니다.
  - Windows Defender가 `Trojan:Script/Wacatac.B!ml`로 잡을 수 있습니다. 원작자가 밝힌 오탐이지만, 회사 PC라면 보안 담당자에게 먼저 확인하세요.
  - 파일이 바뀌면 자동으로 다시 인덱싱합니다. 끄려면 `codebase-memory-mcp config set watcher_enabled false` 후 `codebase-memory-mcp daemon stop`.
  - 새 버전 받기: `npm install -g codebase-memory-mcp@latest` (자동 업데이트 없음). 지우기: `claude mcp remove -s user codebase-memory` 후 `npm uninstall -g codebase-memory-mcp`. 그래프는 `~/.cache/codebase-memory-mcp/`를 지우면 없어집니다.
- 새 버전 받기: `/plugin marketplace update` (추가한 마켓플레이스를 모두 새로 받습니다)

## anti-slop이 막는 것 (예시)

- `.filter().map()`처럼 배열을 두 번 도는 코드
- `as unknown as X`처럼 형변환을 겹쳐서 타입 검사를 피하는 코드
- `unknown`을 그냥 받거나 돌려주는 함수
- 문장 사이에 빈 줄이 없어 읽기 힘든 코드

규칙 목록은 [plugins/anti-slop/.oxlintrc.json](plugins/anti-slop/.oxlintrc.json)에서 켜고 끌 수 있습니다.
anti-slop 플러그인에는 `install-anti-slop` 스킬도 들어 있습니다. 특정 저장소에 규칙을 아예 심고 싶을 때 씁니다.

## 출처

- anti-slop 규칙: Dillon Mulroy (MIT). [LICENSE](plugins/anti-slop/LICENSE)
- superpowers: [obra/superpowers](https://github.com/obra/superpowers)
- andrej-karpathy-skills: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
- diagram-design: [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design)
- agent-desktop: Vercel Labs. [vercel-labs/agent-desktop](https://github.com/vercel-labs/agent-desktop)
- codebase-memory-mcp: DeusData (MIT). [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)

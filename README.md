# claude_market

Claude Code에서 쓰는 플러그인 모음입니다.
어느 PC에서든 명령 몇 줄이면 같은 환경을 다시 만들 수 있습니다.

## 들어 있는 것

| 플러그인 | 하는 일 | 왜 설치하나 |
|---|---|---|
| **anti-slop** | Claude가 JS/TS 파일을 고칠 때마다 자동으로 검사합니다 | AI가 대충 짠 코드(불필요한 형변환, 읽기 힘든 줄 붙임 등)를 그 자리에서 잡아 바로 다시 고치게 합니다. 사람이 리뷰하며 일일이 지적할 필요가 줄어듭니다 |
| **superpowers** | 일하는 순서를 가르치는 스킬 모음입니다 (기획 → 계획 → 테스트 먼저 → 디버깅 → 리뷰) | Claude가 바로 코드부터 쓰지 않고, 먼저 묻고 계획한 뒤 검증까지 하게 만듭니다 |
| **andrej-karpathy-skills** | 코딩 행동 지침입니다 | 시킨 것보다 크게 만들거나, 상관없는 곳까지 고치는 버릇을 줄입니다 |
| **diagram-design** (선택) | 구조도·흐름도·간트 같은 그림을 그려 줍니다 | 문서나 보고에 쓸 그림이 필요할 때 씁니다 |

## 설치 방법

### 준비물

- Claude Code
- Node.js (anti-slop이 검사 도구를 돌릴 때 씁니다)

### Claude Code 채팅창에 한 줄씩 입력

```
/plugin marketplace add Sty1ish/claude_market
/plugin install anti-slop@claude-market
/plugin install superpowers@claude-market
/plugin install andrej-karpathy-skills@claude-market
/plugin install diagram-design@claude-market
```

설치가 끝나면 Claude Code를 껐다 켭니다.

### 터미널에서 하고 싶다면

```
claude plugin marketplace add Sty1ish/claude_market
claude plugin install anti-slop@claude-market
claude plugin install superpowers@claude-market
claude plugin install andrej-karpathy-skills@claude-market
claude plugin install diagram-design@claude-market
```

## 알아 둘 것

- **anti-slop을 처음 쓸 때 몇 초 걸립니다.** 첫 검사 때 검사 도구(oxlint)를 알아서 설치합니다. 그다음부터는 바로 돌아갑니다.
- **예전에 anti-slop을 직접 설치했다면** `~/.claude/settings.json`의 `hooks` 안에 있는 `anti-slop/hook.mjs` 줄을 지우세요. 그대로 두면 검사가 두 번 돌아갑니다.
- **superpowers를 공식 마켓플레이스에서 이미 설치했다면** 다시 설치하지 않아도 됩니다. 같은 스킬이 두 벌 생깁니다.
- 새 버전 받기: `/plugin marketplace update claude-market`

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

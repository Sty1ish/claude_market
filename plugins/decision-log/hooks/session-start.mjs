// 세션 시작 때 「목적 묻기 · 결정 저장」 규칙을 대화 앞에 붙인다.
// 볼트가 없으면 규칙 대신 설치 안내 한 줄만 붙인다.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vaultPath } from "../scripts/vault.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const vault = vaultPath();

const context = existsSync(join(vault, ".git"))
  ? readFileSync(join(here, "rules.md"), "utf8")
  : `[decision-log] 옵시디언 볼트(${vault})가 없어 결정 기록을 건너뛴다. 사용자가 결정 기록을 물으면 claude_market 의 obsidian/setup.ps1 을 먼저 실행하라고 안내한다.`;

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }),
);

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const input = JSON.parse(readFileSync(0, "utf8"));

const file = input.tool_input?.file_path ?? input.tool_response?.filePath;

if (!file || !/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(file)) process.exit(0);

const norm = file.replaceAll("\\", "/");

if (/\/(node_modules|dist|build|vendor)\//.test(norm) || norm.includes("/.claude/")) process.exit(0);

const bin = join(here, "node_modules", ".bin", process.platform === "win32" ? "oxlint.cmd" : "oxlint");

if (!existsSync(bin)) {
  spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: here, stdio: "ignore", shell: process.platform === "win32" });
}

if (!existsSync(bin)) {
  process.stderr.write("[anti-slop] oxlint 설치 실패로 검사를 건너뜀. 플러그인 폴더에서 npm ci 를 직접 실행할 것\n");
  process.exit(0);
}

const result = spawnSync(bin, ["-c", join(here, ".oxlintrc.json"), "--format", "unix", file], {
  encoding: "utf8",
  shell: process.platform === "win32",
});

const lines = (result.stdout ?? "").split("\n").filter(line => /:\d+:\d+:/.test(line));

if (lines.length === 0) process.exit(0);

const shown = lines.slice(0, 40).join("\n");

const more = lines.length > 40 ? `\n... 외 ${lines.length - 40}건` : "";

process.stderr.write(
  `[anti-slop] ${file} 에 위반 ${lines.length}건. 파일 전체를 기준으로 고칠 것(빈 줄 규칙은 oxlint --fix 로 자동 수정 가능, 규칙을 끄거나 형변환으로 덮지 말 것):\n${shown}${more}\n`,
);

process.exit(2);

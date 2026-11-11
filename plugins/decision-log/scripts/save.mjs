// 결정 노트를 볼트에 쓰고, 오늘 일지에 링크를 걸고, 그 두 파일만 커밋 · push 한다.
//   node save.mjs --title "제목"   (노트 본문 markdown 은 stdin)
// 같은 날 같은 제목이면 노트를 덮어쓴다(값이 바뀐 결정 고치기).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { vaultPath } from "./vault.mjs";

const titleIndex = process.argv.indexOf("--title");
const rawTitle = titleIndex > 0 ? process.argv[titleIndex + 1] : "";
if (!rawTitle) {
  process.stderr.write("사용법: node save.mjs --title \"제목\" < 본문.md\n");
  process.exit(2);
}

const body = readFileSync(0, "utf8").trim();
if (!body) {
  process.stderr.write("본문이 비어 있습니다 (stdin 으로 markdown 을 넘길 것)\n");
  process.exit(2);
}

const vault = vaultPath();
if (!existsSync(join(vault, ".git"))) {
  process.stderr.write(`볼트가 없습니다: ${vault} — claude_market 의 obsidian/setup.ps1 을 먼저 실행\n`);
  process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const title = rawTitle.replace(/[\\/:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim();
const noteName = `${date} ${title}`;
const notePath = join(vault, "결정", `${noteName}.md`);
const dailyPath = join(vault, "일지", `${date}.md`);

mkdirSync(join(vault, "결정"), { recursive: true });
mkdirSync(join(vault, "일지"), { recursive: true });

writeFileSync(notePath, `---\n날짜: ${date}\n태그: [결정]\n---\n# ${title}\n\n${body}\n`, "utf8");

const templatePath = join(vault, "템플릿", "일지.md");
let daily = existsSync(dailyPath)
  ? readFileSync(dailyPath, "utf8")
  : existsSync(templatePath)
    ? readFileSync(templatePath, "utf8").replaceAll("{{date}}", date)
    : `# ${date}\n\n## 오늘 내린 결정\n`;

const link = `- [[결정/${noteName}]]`;
if (!daily.includes(link)) {
  const heading = "## 오늘 내린 결정";
  if (!daily.includes(heading)) daily = `${daily.trimEnd()}\n\n${heading}\n`;
  const lines = daily.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === heading);
  const placeholder = lines.findIndex((l, i) => i > start && /^- \[\[결정\/\s*\]\]\s*$/.test(l.trim()));
  if (placeholder > 0) lines[placeholder] = link;
  else {
    let end = start + 1;
    while (end < lines.length && !lines[end].startsWith("## ")) end++;
    while (end > start + 1 && lines[end - 1].trim() === "") end--;
    lines.splice(end, 0, link);
  }
  daily = lines.join("\n");
}
writeFileSync(dailyPath, daily, "utf8");

const git = (...args) => spawnSync("git", ["-C", vault, ...args], { encoding: "utf8" });
const rel = [`결정/${noteName}.md`, `일지/${date}.md`];
git("add", "--", ...rel);
const commit = git("commit", "-q", "-m", `결정: ${title}`, "--", ...rel);
const committed = commit.status === 0;

let pushed = "커밋할 변경 없음";
if (committed) {
  const hasRemote = git("remote").stdout.trim() !== "";
  if (!hasRemote) pushed = "원격 없음 — 로컬 커밋만";
  else {
    git("pull", "--no-rebase", "-q", "origin", "main");
    const push = git("push", "-q", "origin", "HEAD");
    pushed = push.status === 0 ? "push 완료" : `push 실패(옵시디언 Git 이 다음 동기화 때 올림): ${push.stderr.trim()}`;
  }
}

process.stdout.write(`노트: ${notePath}\n일지: ${dailyPath}\n${pushed}\n`);

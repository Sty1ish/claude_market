import { homedir } from "node:os";
import { join } from "node:path";

// OBSIDIAN_VAULT 가 있으면 그 경로, 없으면 setup.ps1 기본값(문서\ObsidianVault).
export function vaultPath() {
  return process.env.OBSIDIAN_VAULT || join(homedir(), "Documents", "ObsidianVault");
}

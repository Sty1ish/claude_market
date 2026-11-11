# 옵시디언 볼트를 어느 PC에서든 같은 상태로 다시 세팅한다.
#   - 옵시디언이 없으면 winget 으로 설치
#   - GitHub 에 볼트 저장소가 있으면 clone, 없으면 비공개로 만들고 push
#   - 이 볼트 저장소만 지정한 GitHub 계정(gh 토큰)으로 push 하도록 고정
#     (Git Credential Manager 에 회사 계정이 저장돼 있어도 섞이지 않음)
#
# 실행: powershell -ExecutionPolicy Bypass -File obsidian\setup.ps1
# 준비물: git, gh(GitHub CLI) — gh 에 볼트 계정이 로그인돼 있어야 한다 (gh auth login)

param(
    [string]$VaultPath = (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'ObsidianVault'),
    [string]$Repo = 'Sty1ish/obsidian-vault',
    [string]$GitHubUser = 'Sty1ish',
    [string]$GitEmail = '89575978+Sty1ish@users.noreply.github.com'
)

function Step($msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }
function Fail($msg) { Write-Host "실패: $msg" -ForegroundColor Red; exit 1 }
function Check($what) { if ($LASTEXITCODE -ne 0) { Fail "$what (종료 코드 $LASTEXITCODE)" } }

function Need($cmd, $hint) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { Fail "$cmd 가 없습니다. $hint" }
}

# 이 저장소에서만 쓰는 인증 helper. 앞의 빈 값이 시스템 helper(manager)를 끈다.
$Helper = "!f() { echo username=$GitHubUser; echo password=`$(gh auth token --user $GitHubUser); }; f"

function Set-VaultCredential($dir) {
    # 빈 값 인자와 stderr 숨기기는 PowerShell 버전마다 달라 cmd 를 거친다.
    cmd /c "git -C `"$dir`" config --local --unset-all credential.helper 2>nul"
    cmd /c "git -C `"$dir`" config --local --add credential.helper `"`""
    git -C $dir config --local --add credential.helper $Helper
    git -C $dir config --local user.name $GitHubUser
    git -C $dir config --local user.email $GitEmail
    git -C $dir config --local core.quotepath false
    $who = cmd /c "(echo protocol=https& echo host=github.com) | git -C `"$dir`" credential fill" | Where-Object { $_ -like 'username=*' }
    if ($who -ne "username=$GitHubUser") { Fail "push 계정이 $GitHubUser 가 아닙니다: $who" }
    Write-Host "push 계정: $GitHubUser"
}

Step '준비물 확인'
Need git 'https://git-scm.com 에서 설치하세요.'
Need gh  'winget install GitHub.cli 로 설치하세요.'
$token = cmd /c "gh auth token --user $GitHubUser 2>nul"
if (-not $token) { Fail "gh 에 $GitHubUser 가 로그인돼 있지 않습니다. gh auth login 으로 $GitHubUser 계정을 추가한 뒤 다시 실행하세요." }
# 아래 gh 명령만 볼트 계정으로 돌린다. gh 의 활성 계정은 바꾸지 않는다.
$env:GH_TOKEN = $token

Step '옵시디언 설치'
$exe = Join-Path $env:LOCALAPPDATA 'Programs\Obsidian\Obsidian.exe'
if (Test-Path $exe) { Write-Host '이미 설치됨' }
else {
    winget install --id Obsidian.Obsidian -e --silent --accept-source-agreements --accept-package-agreements
    Check '옵시디언 설치'
}

Step '볼트 저장소'
cmd /c "gh repo view $Repo --json name >nul 2>nul"
$remoteExists = ($LASTEXITCODE -eq 0)
$url = "https://github.com/$Repo.git"

if (Test-Path (Join-Path $VaultPath '.git')) {
    Write-Host "로컬 볼트 있음: $VaultPath"
    Set-VaultCredential $VaultPath
    if (-not (git -C $VaultPath remote)) { git -C $VaultPath remote add origin $url }
    if ($remoteExists) {
        git -C $VaultPath pull --no-rebase origin main; Check 'pull'
    } else {
        # origin 은 위에서 이미 걸었으므로 저장소만 만들고 push 는 git 으로 한다.
        gh repo create $Repo --private; Check '저장소 만들기'
    }
    git -C $VaultPath push -u origin main; Check 'push'
} elseif ($remoteExists) {
    if ((Test-Path $VaultPath) -and (Get-ChildItem $VaultPath -Force | Select-Object -First 1)) {
        Fail "$VaultPath 에 다른 파일이 있습니다. 비우거나 -VaultPath 로 다른 곳을 지정하세요."
    }
    git -c credential.helper= -c "credential.helper=$Helper" clone $url $VaultPath; Check 'clone'
    Set-VaultCredential $VaultPath
} else {
    Fail "GitHub 에 $Repo 도 없고 로컬 볼트($VaultPath)도 없습니다. 볼트를 먼저 만든 PC 에서 이 스크립트를 실행하세요."
}

git -C $VaultPath log --oneline -3

Step '남은 일 (직접)'
Write-Host "1. 옵시디언 실행 → 「폴더를 보관소로 열기」 → $VaultPath"
Write-Host '2. 「이 보관소의 작성자를 신뢰하나요?」 → 신뢰 (Obsidian Git 플러그인이 켜짐)'
Write-Host '3. 그 뒤로는 10분마다 자동 커밋 · push, 열 때 pull'

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Private', 'Public')]
  [string]$Mode,

  [Parameter(Mandatory = $true)]
  [string]$Source,

  [Parameter(Mandatory = $true)]
  [ValidateSet('kenton', 'eddey')]
  [string]$Child,

  [Parameter(Mandatory = $true)]
  [string]$Title,

  [ValidateSet('英语', '语文', '数学', '古诗', '综合')]
  [string]$Subject = '综合',

  [string]$FileName,

  [switch]$PrivacyChecked,
  [switch]$ReplaceExisting,
  [switch]$Publish,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$archiveIndex = Join-Path $repoRoot 'data\mistake-archives.json'
$publicDir = Join-Path $repoRoot 'apps'
$privateDir = Join-Path $repoRoot 'local-data\mistake-apps'
$today = (Get-Date).ToString('yyyy-MM-dd')

function Stop-Fastlane([string]$message) {
  throw "FASTLANE STOP: $message"
}

function Invoke-Git([string[]]$arguments) {
  & git -C $repoRoot @arguments
  if ($LASTEXITCODE -ne 0) {
    Stop-Fastlane "git $($arguments -join ' ') failed"
  }
}

function Get-NormalizedFileName([string]$requested, [string]$sourceName) {
  $name = if ($requested) { $requested } else { $sourceName }
  if ($name -notmatch '\.html?$') { $name += '.html' }
  $name = $name.ToLowerInvariant().Replace('-', '_')
  if ($name -notmatch '^[a-z0-9][a-z0-9_]*\.html$') {
    Stop-Fastlane 'FileName must use English lowercase snake_case, for example eddey_grammar_midterm.html'
  }
  return $name
}

function Test-Secrets([string]$html) {
  $patterns = @(
    '(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*["''][^"'']{8,}["'']',
    '(?i)-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
  )
  foreach ($pattern in $patterns) {
    if ($html -match $pattern) {
      Stop-Fastlane "possible secret found: $pattern"
    }
  }
}

function Test-PublicPrivacy([string]$html) {
  if (-not $PrivacyChecked) {
    Stop-Fastlane 'Public mode requires -PrivacyChecked after visually inspecting every embedded image'
  }

  $rawPaperSignals = 0
  foreach ($marker in @('PAPER_IMAGES', '原卷点读', '试卷第1页', '孩子卷面答案', 'Name:', 'Score:')) {
    if ($html.Contains($marker)) { $rawPaperSignals++ }
  }
  if ($html -match 'data:image/' -and $rawPaperSignals -ge 2) {
    Stop-Fastlane 'embedded original-paper workflow detected; keep it Private and publish only an anonymous knowledge-point version'
  }

  foreach ($pattern in @('学校', '班级', '住址', '联系电话', '身份证', '(?i)school\s*:', '(?i)class\s*:')) {
    if ($html -match $pattern) {
      Stop-Fastlane "public privacy marker found: $pattern"
    }
  }
}

function Sync-PublicBranch {
  $status = @(& git -C $repoRoot status --porcelain)
  if ($status.Count -gt 0) {
    Stop-Fastlane 'repository has existing changes; preserve them and publish manually after review'
  }
  Invoke-Git -arguments @('fetch', 'origin', 'main')
  $counts = ((& git -C $repoRoot rev-list --left-right --count 'HEAD...origin/main') -split '\s+')
  if ($LASTEXITCODE -ne 0 -or $counts.Count -lt 2) {
    Stop-Fastlane 'could not compare local main with origin/main'
  }
  if ([int]$counts[0] -ne 0) {
    Stop-Fastlane 'local branch is ahead of origin/main; review before fast-lane publishing'
  }
  if ([int]$counts[1] -gt 0) {
    Invoke-Git -arguments @('pull', '--ff-only', 'origin', 'main')
  }
}

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
if ([IO.Path]::GetExtension($sourcePath) -notin @('.html', '.htm')) {
  Stop-Fastlane 'Source must be a single-file HTML learning app'
}
$sourceName = [IO.Path]::GetFileName($sourcePath)
$safeName = Get-NormalizedFileName $FileName $sourceName
$html = [IO.File]::ReadAllText($sourcePath, [Text.Encoding]::UTF8)
Test-Secrets $html

if ($Mode -eq 'Public') {
  Test-PublicPrivacy $html
  if ($Publish -and -not $DryRun) { Sync-PublicBranch }
  $targetDir = $publicDir
} else {
  if ($Publish) { Stop-Fastlane 'Private mode never commits or pushes files' }
  $targetDir = $privateDir
}

$targetPath = Join-Path $targetDir $safeName
$sourceHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
$sameFile = $false
if (Test-Path -LiteralPath $targetPath) {
  $targetHash = (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash
  $sameFile = $targetHash -eq $sourceHash
  if (-not $sameFile -and -not $ReplaceExisting) {
    Stop-Fastlane "target exists with different content; rerun with -ReplaceExisting after review: $targetPath"
  }
}

$result = [ordered]@{
  mode = $Mode
  child = $Child
  title = $Title
  subject = $Subject
  source = $sourcePath
  target = $targetPath
  file = if ($Mode -eq 'Public') { "apps/$safeName" } else { $safeName }
  dryRun = [bool]$DryRun
  publish = [bool]$Publish
}

if ($DryRun) {
  $result.status = 'validated_only'
  $result | ConvertTo-Json -Depth 4
  exit 0
}

if (-not (Test-Path -LiteralPath $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}
if (-not $sameFile) {
  Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force:$ReplaceExisting
}

if ($Mode -eq 'Private') {
  & git -C $repoRoot check-ignore -q -- "local-data/mistake-apps/$safeName"
  if ($LASTEXITCODE -ne 0) {
    Stop-Fastlane 'private target is not ignored by git; refusing to continue'
  }
  $result.status = if ($sameFile) { 'already_current_private' } else { 'stored_private' }
  $result.archiveUrl = 'mistakes.html?who=' + $Child
  $result | ConvertTo-Json -Depth 4
  exit 0
}

$index = Get-Content -LiteralPath $archiveIndex -Encoding UTF8 -Raw | ConvertFrom-Json
$items = @($index.$Child)
$relativeFile = "apps/$safeName"
$entry = [pscustomobject][ordered]@{
  subject = $Subject
  title = $Title
  file = $relativeFile
  added = $today
}
$existingIndex = -1
for ($i = 0; $i -lt $items.Count; $i++) {
  if ($items[$i].file -eq $relativeFile) { $existingIndex = $i; break }
}
if ($existingIndex -ge 0) {
  $items[$existingIndex] = $entry
} else {
  $items = @($entry) + $items
}
$index.$Child = $items
$json = $index | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($archiveIndex, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))

Get-Content -LiteralPath $archiveIndex -Encoding UTF8 -Raw | ConvertFrom-Json | Out-Null
if (-not (Test-Path -LiteralPath $targetPath)) {
  Stop-Fastlane 'public target was not created'
}

$result.status = if ($existingIndex -ge 0) { 'updated_public' } else { 'added_public' }
$result.archiveUrl = 'mistakes.html?who=' + $Child
$result.appUrl = $relativeFile

if ($Publish) {
  Invoke-Git -arguments @('add', '--', "apps/$safeName", 'data/mistake-archives.json')
  Invoke-Git -arguments @('diff', '--cached', '--check')
  Invoke-Git -arguments @('commit', '-m', "归档: $Title")
  Invoke-Git -arguments @('push', 'origin', 'main')
  $result.status = 'published_public'
}

$result | ConvertTo-Json -Depth 4

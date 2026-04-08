param(
    [string]$Version = "2.1.5",
    [string]$Repo = "vcbobby/ModoFreelanceOS",
    [string]$Message = "✨ ¡ModoFreelanceOS v2.1.5! Mejoras y correcciones para una mayor estabilidad.",
    [bool]$Critical = $true,
    [switch]$SkipUrlValidation,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Test-ReleaseAssetUrl {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -MaximumRedirection 10 -UseBasicParsing
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptRoot
$versionFile = Join-Path $projectRoot "public/version.json"

if (-not (Test-Path $versionFile)) {
    throw "No se encontró version.json en: $versionFile"
}

$apkUrl = "https://github.com/$Repo/releases/download/v$Version/app-release.apk"
$exeUrl = "https://github.com/$Repo/releases/download/v$Version/ModoFreelanceOS.Setup.exe"

if (-not $SkipUrlValidation) {
    Write-Host "Validando assets publicados para v$Version..." -ForegroundColor Cyan

    if (-not (Test-ReleaseAssetUrl -Url $apkUrl)) {
        throw "APK no disponible o no accesible: $apkUrl"
    }

    if (-not (Test-ReleaseAssetUrl -Url $exeUrl)) {
        throw "EXE no disponible o no accesible: $exeUrl"
    }

    Write-Host "Validación de URLs OK." -ForegroundColor Green
}
else {
    Write-Host "Saltando validación de URLs por parámetro -SkipUrlValidation" -ForegroundColor Yellow
}

$content = Get-Content -Raw -Path $versionFile | ConvertFrom-Json

$content.version = $Version
$content.critical = $Critical
$content.apkUrl = $apkUrl
$content.exeUrl = $exeUrl
$content.message = $Message

if ($DryRun) {
    Write-Host "Dry run: no se escribieron cambios en version.json" -ForegroundColor Yellow
    $content | ConvertTo-Json -Depth 10
    exit 0
}

$content | ConvertTo-Json -Depth 10 | Set-Content -Path $versionFile -Encoding UTF8

Write-Host "Update feed activado en $versionFile" -ForegroundColor Green
Write-Host "- version: $Version"
Write-Host "- critical: $Critical"
Write-Host "- apkUrl: $apkUrl"
Write-Host "- exeUrl: $exeUrl"

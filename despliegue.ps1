# ============================================================================
#  despliegue.ps1 — Sube la web de Lebeche al NAS Synology (Web Station)
#  ---------------------------------------------------------------------------
#  Copia los archivos de la web desde este repositorio a /volume1/web/lebeche/
#  del NAS, en un solo paso.
#
#  IMPORTANTE: por defecto NO toca la carpeta data/ (ahí guarda el panel Staff
#  los contenidos en vivo). Usa -ConDatos solo si quieres sobrescribir esos
#  JSON, y añade -BackupDatos para descargar antes una copia de seguridad.
#
#  Uso:
#    .\despliegue.ps1                      # sube los 4 archivos de código del arreglo
#    .\despliegue.ps1 -Todo                # sube todo el sitio (sin data/)
#    .\despliegue.ps1 -Metodo scp          # fuerza SSH/scp en vez de SMB
#    .\despliegue.ps1 -DryRun              # solo muestra qué se copiaría
#    .\despliegue.ps1 -ConDatos -BackupDatos   # también sube data/ con copia previa
# ============================================================================

param(
    [string]$NasIp = "192.168.50.94",          # usa .93 si es el que responde
    [string]$NasUser = "pelotxo",
    [ValidateSet("auto", "smb", "scp")] [string]$Metodo = "auto",
    [switch]$Todo,
    [switch]$ConDatos,
    [switch]$BackupDatos,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$raizRepo      = $PSScriptRoot
$destinoScp    = "/volume1/web/lebeche"
$smbRaiz       = "\\$NasIp\web\lebeche"

# --- Archivos ----------------------------------------------------------------
# Código modificado en el arreglo del renderizado (no toca data/)
$archivosBase = @(
    "js\main.js",
    "admin\admin.js",
    "admin\guardar.php",
    "admin\estilos.css"
)

# Todo el sitio (estáticos + panel), sin data/
$archivosTodo = @(
    "index.html",
    "css\styles.css",
    "js\apps.js",
    "js\datos.js",
    "js\main.js",
    "js\noticias.js",
    "js\programacion.js",
    "assets\apple-touch-icon.png",
    "assets\favicon-32.png",
    "assets\lebeche-logo-azul.png",
    "assets\lebeche-logo-oscuro.png",
    "fonts\Courgette-Regular.ttf",
    "fonts\Garet-Book.ttf",
    "fonts\Garet-Heavy.ttf",
    "fonts\OpenSans-Regular.ttf",
    "fonts\OpenSans-Italic.ttf",
    "fonts\OpenSans-Semibold.ttf",
    "fonts\OpenSans-Bold.ttf",
    "fonts\OpenSans-BoldItalic.ttf",
    "fonts\OpenSans-ExtraBold.ttf",
    "admin\admin.js",
    "admin\estilos.css",
    "admin\guardar.php",
    "admin\index.php",
    "admin\logout.php"
)

# Contenidos editables (solo con -ConDatos)
$archivosDatos = @(
    "data\apps.json",
    "data\datos.json",
    "data\noticias.json",
    "data\programacion.json"
)

$lista = if ($Todo) { $archivosTodo } else { $archivosBase }
if ($ConDatos) { $lista = $lista + $archivosDatos }

# --- Elegir método de transporte --------------------------------------------
$usarSmb = $false
$usarScp = $false
switch ($Metodo) {
    "smb" { $usarSmb = $true }
    "scp" { $usarScp = $true }
    "auto" {
        if (Test-Path $smbRaiz) { $usarSmb = $true } else { $usarScp = $true }
    }
}

$etiquetaMetodo = if ($usarSmb) { "SMB  -> $smbRaiz" } else { "SCP  -> $NasUser@$NasIp$destinoScp" }
Write-Host "Método de subida: $etiquetaMetodo" -ForegroundColor Cyan

# --- Verificar que existen los archivos locales -----------------------------
foreach ($rel in $lista) {
    $src = Join-Path $raizRepo $rel
    if (-not (Test-Path $src)) { throw "No encuentro el archivo local: $src" }
}

if ($DryRun) {
    Write-Host "`n--- Simulación (no se copia nada) ---" -ForegroundColor Yellow
    foreach ($rel in $lista) { Write-Host "  $rel" }
    exit 0
}

# --- Copia de seguridad opcional de data/ -----------------------------------
if ($ConDatos -and $BackupDatos) {
    $stamp     = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupDir = Join-Path $raizRepo ("backups\datos-" + $stamp)
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "`nDescargando copia de seguridad de data/ a $backupDir" -ForegroundColor Yellow

    foreach ($rel in $archivosDatos) {
        $nombre = Split-Path $rel -Leaf
        if ($usarSmb) {
            $origen = Join-Path $smbRaiz $rel
            Copy-Item -Path $origen -Destination (Join-Path $backupDir $nombre) -Force
        } else {
            $remoto = "$($NasUser)@$($NasIp):$destinoScp/" + ($rel -replace '\\','/')
            scp $remoto (Join-Path $backupDir $nombre)
        }
    }
    Write-Host "Copia de seguridad lista." -ForegroundColor Green
}

# --- Subida -----------------------------------------------------------------
Write-Host "`nSubiendo $($lista.Count) archivo(s)..." -ForegroundColor Cyan

# Asegurar la carpeta fonts/ en el destino (tipografías de marca, añadida 2026-09-24)
if ($usarSmb) {
    New-Item -ItemType Directory -Path (Join-Path $smbRaiz "fonts") -Force | Out-Null
} else {
    & ssh "$($NasUser)@$($NasIp)" "mkdir -p $destinoScp/fonts"
}

foreach ($rel in $lista) {
    $src = Join-Path $raizRepo $rel
    $relScp = $rel -replace '\\','/'

    if ($usarSmb) {
        $dst = Join-Path $smbRaiz $rel
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  OK  $rel"
    } else {
        scp $src ("{0}@{1}:{2}/{3}" -f $NasUser, $NasIp, $destinoScp.TrimEnd('/'), $relScp)
        if ($LASTEXITCODE -eq 0) { Write-Host "  OK  $rel" } else { Write-Error "Fallo al subir $rel" }
    }
}

Write-Host "`nHecho. Recarga la web con Ctrl+F5 en:" -ForegroundColor Green
Write-Host "  https://www.corrientelebeche.es/lebeche/" -ForegroundColor White

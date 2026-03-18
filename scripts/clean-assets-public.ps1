# Script de limpieza automática para builds multiplataforma
# Elimina archivos de Electron/Windows y otros archivos grandes de assets/public antes de cada build de Android

$publicPath = "c:\Users\vc_bo\Desktop\OS\frontend\ModoFreelanceOS-main\ModoFreelanceOS\android\app\src\main\assets\public"

# Eliminar carpetas y archivos de Electron/Windows
Remove-Item -Path "$publicPath\win-unpacked" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$publicPath\ModoFreelanceOS Setup *.exe" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$publicPath\*.dll" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$publicPath\*.yml" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$publicPath\*.blockmap" -Force -ErrorAction SilentlyContinue

# Eliminar archivos grandes innecesarios
Get-ChildItem -Path $publicPath -File | Where-Object { $_.Length -gt 100MB } | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "Limpieza completada. Solo quedan archivos esenciales para Android."

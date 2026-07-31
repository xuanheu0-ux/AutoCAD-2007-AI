# Starts the AutoCAD MCP server.
#
#   powershell -ExecutionPolicy Bypass -File .\run.ps1
#
# AutoCAD must already be running with a drawing open.

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Get-Process -Name acad -ErrorAction SilentlyContinue)) {
    Write-Warning "AutoCAD does not appear to be running."
    Write-Warning "Start AutoCAD and open a drawing, or the first tool call will try to launch it (slow)."
    Write-Host ""
}

# 8765 is taken by the Codex AutoCAD host and 8766 is inside a Windows-reserved
# range on this machine, so this project defaults to 8770.
if (-not $env:ACAD_MCP_PORT) { $env:ACAD_MCP_PORT = "8770" }

python server.py

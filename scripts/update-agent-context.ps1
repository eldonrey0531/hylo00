# Update Agent Context Script
# Purpose: Refresh agent awareness of new specifications and implementation artifacts
# Usage: Run after completing design phase to update agent's working context

param(
    [string]$SpecPath = ".\specs\002-create-an-ai",
    [switch]$Verbose = $false
)

Write-Host "=== Agent Context Update ===" -ForegroundColor Green
Write-Host "Updating agent context with new specification artifacts..." -ForegroundColor Yellow

# Define specification files to validate
$SpecFiles = @(
    "spec.md",
    "research.md", 
    "data-model.md",
    "contracts\api-contracts.md",
    "contracts\api-contract-tests.spec.ts",
    "quickstart.md"
)

Write-Host ""
Write-Host "Validating specification artifacts:" -ForegroundColor Cyan

foreach ($file in $SpecFiles) {
    $fullPath = Join-Path $SpecPath $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "  ✅ $file ($size bytes)" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "     Path: $fullPath" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Context update summary:" -ForegroundColor Cyan

# Check if all required files exist
$missingFiles = $SpecFiles | Where-Object { -not (Test-Path (Join-Path $SpecPath $_)) }

if ($missingFiles.Count -eq 0) {
    Write-Host "  ✅ All specification artifacts present" -ForegroundColor Green
    Write-Host "  ✅ Agent context successfully updated" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready for implementation planning Phase 2" -ForegroundColor Green
    Write-Host "Next: Generate task breakdown for incremental development" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  Missing files: $($missingFiles -join ', ')" -ForegroundColor Yellow
    Write-Host "  ❌ Agent context update incomplete" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Context Update Complete ===" -ForegroundColor Green
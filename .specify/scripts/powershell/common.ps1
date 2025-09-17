#!/usr/bin/env pwsh
# Common PowerShell functions analogous to common.sh (moved to powershell/)

function Get-RepoRoot {
    git rev-parse --show-toplevel
}

function Get-CurrentBranch {
    git rev-parse --abbrev-ref HEAD
}

function Test-FeatureBranch {
    param([string]$Branch)
    if ($Branch -notmatch '^[0-9]{3}-') {
        Write-Output "ERROR: Not on a feature branch. Current branch: $Branch"
        Write-Output "Feature branches should be named like: 001-feature-name"
        return $false
    }
    return $true
}

function Get-FeatureDir {
    param([string]$RepoRoot, [string]$Branch)
    Join-Path $RepoRoot "specs/$Branch"
}

function Get-FeaturePathsEnv {
    $repoRoot = Get-RepoRoot
    $currentBranch = Get-CurrentBranch
    $featureDir = Get-FeatureDir -RepoRoot $repoRoot -Branch $currentBranch
    [PSCustomObject]@{
        REPO_ROOT    = $repoRoot
        CURRENT_BRANCH = $currentBranch
        FEATURE_DIR  = $featureDir
        FEATURE_SPEC = Join-Path $featureDir 'spec.md'
        IMPL_PLAN    = Join-Path $featureDir 'plan.md'
        TASKS        = Join-Path $featureDir 'tasks.md'
        RESEARCH     = Join-Path $featureDir 'research.md'
        DATA_MODEL   = Join-Path $featureDir 'data-model.md'
        QUICKSTART   = Join-Path $featureDir 'quickstart.md'
        CONTRACTS_DIR = Join-Path $featureDir 'contracts'
    }
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    if (Test-Path -Path $Path -PathType Leaf) {
        Write-Output "  ✓ $Description"
        return $true
    } else {
        Write-Output "  ✗ $Description"
        return $false
    }
}

function Test-DirHasFiles {
    param([string]$Path, [string]$Description)
    if ((Test-Path -Path $Path -PathType Container) -and (Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Select-Object -First 1)) {
        Write-Output "  ✓ $Description"
        return $true
    } else {
        Write-Output "  ✗ $Description"
        return $false
    }
}

# Context7 research helper - only for research.md generation
function Suggest-Context7Research {
    param([string]$FeatureBranch)
    
    if (Get-Command mcp -ErrorAction SilentlyContinue) {
        Write-Output ""
        Write-Output "📚 Context7 available for research.md documentation:"
        Write-Output "   Use: mcp call resolve-library-id --libraryName=`"[library]`""
        Write-Output "   Then: mcp call get-library-docs --context7CompatibleLibraryID=`"/[library]/docs`" --topic=`"[topic]`" --tokens=2000"
        Write-Output "   Append to research: >> `$RESEARCH""
        Write-Output ""
    }
}

# Clean Build Script for Windows PowerShell
# Removes all build artifacts and caches

Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "✓ .next directory doesn't exist" -ForegroundColor Green
}

# Remove .webpack directory
if (Test-Path .webpack) {
    Remove-Item -Recurse -Force .webpack
    Write-Host "✓ Removed .webpack directory" -ForegroundColor Green
} else {
    Write-Host "✓ .webpack directory doesn't exist" -ForegroundColor Green
}

# Remove node_modules cache
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✓ Removed node_modules cache" -ForegroundColor Green
} else {
    Write-Host "✓ No node_modules cache found" -ForegroundColor Green
}

Write-Host "`nBuild cleanup complete! You can now run 'npm run dev' or 'npm run build'" -ForegroundColor Cyan


git add -A
$diff = git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "auto: agent session changes"
    git push
}

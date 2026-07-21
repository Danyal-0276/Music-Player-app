$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entries = @(
  "104.16.72.101 plugins.gradle.org",
  "151.101.0.215 repo.maven.apache.org",
  "142.251.167.136 maven.google.com",
  "142.250.190.14 dl.google.com"
)
$content = Get-Content $hostsPath -Raw -ErrorAction SilentlyContinue
if ($null -eq $content) { $content = "" }
foreach ($entry in $entries) {
  $name = ($entry -split "\s+")[1]
  if ($content -notmatch [regex]::Escape($name)) {
    Add-Content -Path $hostsPath -Value "`r`n$entry"
    Write-Host "Added $entry"
  } else {
    Write-Host "Exists $name"
  }
}
Write-Host "DONE"

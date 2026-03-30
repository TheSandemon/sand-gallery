$projects = @('VOID BALL','PIXEL STORM','NEON MAZE','ORBITAL DECAY','GRAVITON')
$r = Get-Random -Minimum 0 -Maximum 5
Write-Host "SELECTED: $($projects[$r])"

$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot'
$env:ANDROID_HOME = 'E:\Android\SDK'
$env:ANDROID_SDK_ROOT = 'E:\Android\SDK'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Set-Location "$PSScriptRoot\android"
Write-Output "JAVA_HOME=$env:JAVA_HOME"
Write-Output "PROJECT=$PWD"
& .\gradlew.bat assembleRelease --no-daemon --console=plain 2>&1 | Tee-Object -FilePath "$PSScriptRoot\android-build.log"
Write-Output "GRADLE_EXIT=$LASTEXITCODE"

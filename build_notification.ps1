$metaData = @{
    "repoName" = $Env:BUILD_REPOSITORY_NAME
    "repoUri" = $Env:BUILD_REPOSITORY_URI
    "branch" = $Env:BUILD_SOURCEBRANCHNAME
    "BuildId" = $Env:BUILD_BUILDID
    "BuildNumber" = $Env:BUILD_BUILDNUMBER
    "BuildName" = $Env:BUILD_DEFINITIONNAME
    "BuildUri" = $Env:BUILD_BUILDURI
};

$url = [string]::Format("https://wujun4code.visualstudio.com/leancloud-typescript-rx-sdk/_build/index?buildId={0}&_a=summary", $metaData.BuildId);
$text = [string]::Format(" :wtf: @group [{0}]({1}) build failed on branch {2}: [{3}-{4}]({5})", 
    $metaData.repoName, 
    $metaData.repoUri, 
    $metaData.branch, 
    $metaData.BuildName, 
    $metaData.BuildNumber, 
    $url);

$user = 'jun.wu';

$payload = @{
    "text" = $text
    "user" = $user
    "channel" = "TypeScript-SDK"
    "markdown" = true
};

$response = Invoke-WebRequest -URI "https://hook.bearychat.com/=bw52Y/incoming/31ff14b639151357b5be93afc7be53e8" -Method Post -Body ($payload | ConvertTo-Json) -Headers @{"Content-Type" = "application/json"}
Write-Output $response;

# google

https://apiharmony-open.mybluemix.net/public/apis/google_sheets#post_v4_spreadsheets

## Dashboard

dotnet new webapp --auth IndividualB2C

Creating this template will make changes to existing files:
  Overwrite   appsettings.Development.json
  Overwrite   appsettings.json
  Overwrite   Dashboard.csproj
html
  Overwrite   Properties/launchSettings.json

Rerun the command and pass --force to accept and create.

dotnet new react --force


added to .csproj:

```c#
<UserSecretsId>aspnet-Dashboard-7D5A78D3-C561-4B7E-9638-4CC29396CF44</UserSecretsId>
```

added to startup:

- imports

```c#
services.AddAuthentication(AzureADB2CDefaults.AuthenticationScheme)
    .AddAzureADB2C(options => Configuration.Bind("AzureAdB2C", options));
services.AddRazorPages();
```

added to appsetting:

- adB2C config

```
dotnet add package Microsoft.AspNetCore.Authentication.AzureADB2C.UI
dotnet add package VueCliMiddleware
```
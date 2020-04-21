# Dashboard

## OAuth 2.0

### Google
- https://github.com/perarnborg/vuex-oidc

### auth0

## Gapi - Google Api

- [Accessing child classes](https://developers.google.com/apps-script/guides/services)
    -   Every service includes one or more child classes that cannot be accessed from the top level as a global object can. You cannot use the new keyword to construct these classes, as you can with standard JavaScript classes like Date; you can only access a child class by calling a method that returns it. If you're not sure how to access a certain class, visit the root page for the service's reference documentation and look for a method that returns the class you want.

### Google Api Samples
- https://github.com/shortpoet/node-samples
- https://developers.google.com/gmail/api/quickstart/nodejs
### GMAIL

### Gmail Api

- [access thread id info](https://webapps.stackexchange.com/questions/116748/how-i-can-locate-the-thread-id-in-new-gmail)
    ```js
    document.querySelector('[data-legacy-thread-id]').getAttribute('data-legacy-thread-id')
    ```
### Google Auth Api

```bash
cd ~
cd gcf-gmail-codelab/auth

# Deploy Cloud Function auth_init
gcloud beta functions deploy auth_init --runtime=nodejs8 --trigger-http --env-vars-file=env_vars.yaml

# Deploy Cloud Function auth_callback
gcloud beta functions deploy auth_callback --runtime=nodejs8 --trigger-http --env-vars-file=env_vars.yaml
```
### Shortpoet

### gmail

### list

npm install --save googleapis open server-destroy fs url

## LinkedIn API

- https://docs.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
- GET https://api.linkedin.com/v2/me
export const index = {
  // ROOT STORE @/store/index.js
  // TODO
  // let clientRoot = window.location.protocol + '//' + window.location.host
  // BACKEND_PREFIX_PROD: 'https://' + window.location.hostname,
  // hardcode prod url for github pages
  // TODO set env var to detect this 
  // maybe also env var to detect git branch

  // BACKEND_PREFIX_PROD: window.location.protocol + '//' + window.location.host,
  // BACKEND_PREFIX_PROD: 'https://localhost:5001',
  BACKEND_PREFIX_DEV: 'https://localhost:5001'
}
export const google = {
  // GOOGLE @/store/modules/StoreGoogle.js
}
export const auth = {
  // AUTH @/store/modules/StoreAuth.js
  ROLES_API: '/api/Roles',
  HEADERS_API: '/api/Idy/Get'
}
export const endpoints = {
  index: index,
  google: google,
  auth: auth
}

export default endpoints

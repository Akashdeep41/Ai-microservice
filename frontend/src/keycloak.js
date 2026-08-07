import Keycloak from 'keycloak-js'

const enableKeycloak = import.meta.env.VITE_USE_KEYCLOAK === 'true'

let exportedKeycloak

if (enableKeycloak) {
  exportedKeycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'docucast-realm',
    clientId: 'docucast-frontend',
  })
} else {
  // Minimal mock implementation compatible with react-keycloak provider
  exportedKeycloak = {
    token: null,
    tokenParsed: {},
    authenticated: false,
    realm: 'docucast-realm',
    clientId: 'docucast-frontend',
    init: (opts) => Promise.resolve(true),
    login: () => { console.info('Mock Keycloak login called') },
    logout: () => { console.info('Mock Keycloak logout called') },
  }
}

export default exportedKeycloak

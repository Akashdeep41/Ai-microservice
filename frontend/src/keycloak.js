import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'docucast-realm',
  clientId: 'docucast-frontend',
})

export default keycloak

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import App from './App'
import './index.css'

const eventLogger = (event, error) => {
  if (error) {
    console.error('Keycloak event', event, error)
  } else {
    console.log('Keycloak event', event)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{ onLoad: 'login-required' }}
    onEvent={eventLogger}
    onTokens={() => {}}
  >
    <App />
  </ReactKeycloakProvider>,
)

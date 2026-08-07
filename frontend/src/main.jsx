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

// Use Vite env var VITE_USE_KEYCLOAK to toggle real Keycloak in development.
const enableKeycloak = import.meta.env.VITE_USE_KEYCLOAK === 'true'
const initOptions = enableKeycloak ? { onLoad: 'login-required' } : { onLoad: 'check-sso' }

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={initOptions}
    onEvent={eventLogger}
    onTokens={() => {}}
  >
    <App />
  </ReactKeycloakProvider>,
)

import { useKeycloak } from '@react-keycloak/web'
import axios from 'axios'
import { useEffect, useState } from 'react'

function App() {
  const { keycloak, initialized } = useKeycloak()
  const [status, setStatus] = useState({ loading: true, message: 'Initializing...' })

  const login = () => keycloak.login()
  const logout = () => keycloak.logout()

  useEffect(() => {
    if (!initialized) {
      return
    }

    if (!keycloak.authenticated) {
      setStatus({ loading: false, message: 'Please sign in using Keycloak to continue.' })
      return
    }

    setStatus({ loading: true, message: 'Verifying session with backend...' })
    const token = keycloak.token

    axios
      .get('/api/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setStatus({ loading: false, message: `Backend responded with status ${response.status}.` })
      })
      .catch((error) => {
        const statusCode = error.response?.status
        setStatus({
          loading: false,
          message: statusCode
            ? `Backend returned ${statusCode}. Ensure your Keycloak token is valid.`
            : 'Unable to reach the backend. Check the API gateway and your network.',
        })
      })
  }, [initialized, keycloak])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Docucast</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Secure gateway for your backend ecosystem
              </h1>
              <p className="max-w-2xl text-slate-400 sm:text-lg">
                A clean React experience that integrates with your Spring Cloud Gateway backend and Keycloak security.
              </p>
            </div>
            <div className="rounded-[2rem] border border-cyan-400/10 bg-cyan-500/10 p-6 text-center shadow-xl shadow-cyan-500/10">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Authentication</p>
              <p className="mt-3 text-3xl font-semibold text-cyan-300">
                {initialized ? (keycloak.authenticated ? 'Authenticated' : 'Signed out') : 'Loading...'}
              </p>
              <p className="mt-2 text-slate-400">
                {initialized && keycloak.authenticated
                  ? keycloak.tokenParsed?.preferred_username || 'Unknown user'
                  : 'Complete login to access the gateway.'}
              </p>
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-700/70 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Gateway status</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Backend connection</h2>
              </div>
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 ring-1 ring-slate-600/60">
                {status.loading ? 'Checking…' : 'Ready'}
              </span>
            </div>

            <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/90 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Latest response</p>
              <p className="mt-4 text-lg leading-8 text-slate-100">{status.message}</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/90 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">API path</p>
                <p className="mt-3 text-slate-200">/api/</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/90 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Auth type</p>
                <p className="mt-3 text-slate-200">OAuth2 / JWT</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-700/70 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">User profile</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Current session</h3>
              </div>

              <div className="space-y-4 rounded-[2rem] border border-slate-700/60 bg-slate-900/90 p-6">
                <p className="text-slate-400">Username</p>
                <p className="text-lg font-medium text-slate-100">{keycloak.tokenParsed?.preferred_username ?? 'Not signed in'}</p>
                <p className="text-slate-400">Realm</p>
                <p className="text-lg font-medium text-slate-100">{keycloak.realm ?? 'master'}</p>
                <p className="text-slate-400">Client</p>
                <p className="text-lg font-medium text-slate-100">{keycloak.clientId}</p>
              </div>

              <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/90 p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Integration notes</p>
                <ul className="mt-4 space-y-3 text-slate-300">
                  <li>• Frontend proxies `/api` to the Spring gateway.</li>
                  <li>• Keycloak handles login and token management.</li>
                  <li>• The backend validates JWTs on protected routes.</li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/90 p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Deployment</p>
                <p className="mt-3 text-slate-300">This UI is ready to build and serve in Docker with your compose stack.</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default App

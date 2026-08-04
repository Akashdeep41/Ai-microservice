import { useKeycloak } from '@react-keycloak/web'
import axios from 'axios'
import { useEffect, useState } from 'react'

const statusStyles = {
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  info: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
}

function App() {
  const { keycloak, initialized } = useKeycloak()
  const [status, setStatus] = useState({
    loading: true,
    tone: 'info',
    title: 'Initializing DocuCast AI',
    message: 'Checking authentication and gateway readiness...',
  })
  const [profile, setProfile] = useState(null)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatAnswer, setChatAnswer] = useState('')
  const [loadingDoc, setLoadingDoc] = useState(false)

  const login = () => keycloak.login({ redirectUri: window.location.origin })
  const logout = () => keycloak.logout({ redirectUri: window.location.origin })

  useEffect(() => {
    if (!initialized) {
      return
    }

    if (!keycloak.authenticated) {
      setStatus({
        loading: false,
        tone: 'info',
        title: 'Sign in to continue',
        message: 'Authenticate with Keycloak to start transforming documents into audio-ready insights.',
      })
      setProfile(null)
      return
    }

    const nextProfile = {
      username: keycloak.tokenParsed?.preferred_username ?? 'Signed-in user',
      realm: keycloak.realm ?? 'docucast-realm',
      clientId: keycloak.clientId ?? 'docucast-frontend',
    }
    setProfile(nextProfile)

    setStatus({
      loading: false,
      tone: 'success',
      title: 'Ready for uploads',
      message: 'Your session is active. Upload a PDF and DocuCast AI will turn it into a podcast-style experience.',
    })
  }, [initialized, keycloak.authenticated, keycloak.clientId, keycloak.realm, keycloak.tokenParsed?.preferred_username])

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file || !keycloak.authenticated) {
      setStatus({
        loading: false,
        tone: 'warning',
        title: 'Upload blocked',
        message: 'Please sign in and choose a PDF file to continue.',
      })
      return
    }

    setLoadingDoc(true)
    setStatus({
      loading: true,
      tone: 'info',
      title: 'Processing document',
      message: 'The gateway is extracting content and preparing the podcast-style summary.',
    })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult(response.data)
      setChatAnswer('')
      setStatus({
        loading: false,
        tone: 'success',
        title: 'Document ready',
        message: 'Your document has been processed into an AI-style summary and podcast-ready script.',
      })
    } catch (error) {
      setStatus({
        loading: false,
        tone: 'warning',
        title: 'Processing failed',
        message: error.response?.data?.message || 'The gateway could not process the document.',
      })
    } finally {
      setLoadingDoc(false)
    }
  }

  const handleChat = async (event) => {
    event.preventDefault()
    if (!result || !chatInput.trim()) {
      return
    }

    try {
      const response = await axios.post('/api/documents/chat', {
        documentId: result.id,
        question: chatInput,
      }, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })

      setChatAnswer(response.data.answer)
      setChatInput('')
    } catch (error) {
      setChatAnswer('The chat service could not respond right now. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <header className="overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur xl:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">DocuCast AI</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn dense documents into short, engaging podcast-style experiences
              </h1>
              <p className="text-base leading-7 text-slate-400 sm:text-lg">
                Upload a PDF, let the gateway process it, and explore a summary plus an AI-host conversation that makes the content easier to absorb.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!initialized ? (
                <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  Connecting to Keycloak...
                </span>
              ) : keycloak.authenticated ? (
                <button
                  onClick={logout}
                  className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={login}
                  className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  Sign in with Keycloak
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 backdrop-blur xl:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Upload & transform</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Drop in a PDF and launch the experience</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[status.tone]}`}>
                  {status.loading ? 'Processing…' : 'Ready'}
                </span>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-700 bg-slate-950/70 px-6 py-10 text-center transition hover:border-cyan-400">
                  <span className="text-lg font-medium text-white">{file ? file.name : 'Choose a PDF or text document'}</span>
                  <span className="mt-2 text-sm text-slate-400">The gateway will extract and structure the content for the AI experience.</span>
                  <input type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                </label>
                <button
                  type="submit"
                  disabled={loadingDoc}
                  className="w-full rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingDoc ? 'Processing document...' : 'Transform document'}
                </button>
              </form>
            </div>

            {result && (
              <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 backdrop-blur xl:p-7">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">AI summary</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{result.fileName}</h3>
                <p className="mt-4 leading-7 text-slate-300">{result.summary}</p>

                <div className="mt-6 rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Podcast-style script</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-200">{result.podcastScript}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {result.tags?.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Active session</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{profile?.username ?? 'Not signed in'}</h3>
              <div className="mt-5 space-y-3 rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-5">
                <div>
                  <p className="text-sm text-slate-400">Realm</p>
                  <p className="mt-1 text-base font-medium text-slate-100">{profile?.realm ?? 'docucast-realm'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="mt-1 text-base font-medium text-slate-100">{profile?.clientId ?? 'docucast-frontend'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Ask about the document</p>
              <form onSubmit={handleChat} className="mt-4 space-y-3">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  rows={4}
                  placeholder="Ask like: summarize the main idea or explain the podcast script"
                  className="w-full rounded-[1.25rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 outline-none ring-0"
                />
                <button
                  type="submit"
                  className="w-full rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  Ask DocuCast AI
                </button>
              </form>

              {chatAnswer && (
                <div className="mt-5 rounded-[1.25rem] border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Answer</p>
                  <p className="mt-3 leading-7 text-slate-200">{chatAnswer}</p>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default App

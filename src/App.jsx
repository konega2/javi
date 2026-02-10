import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import ResidenceDashboard from './components/ResidenceDashboard'

const AUTH_STORAGE_KEY = 'vitalia.auth'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.username) {
        setUsername(parsed.username)
        setRememberMe(true)
      }
    } catch {
      // noop
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos')
      return
    }

    // Simular login exitoso
    onLogin(username, rememberMe)
  }

  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative transform transition-all animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-vitalia-purple to-vitalia-purple-light shadow-lg mb-5">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Restablecer Contraseña
            </h3>
            <p className="text-gray-600 leading-relaxed text-base">
              Para restablecer la contraseña o conocer la actual, contacta al{' '}
              <a href="tel:653265348" className="text-vitalia-purple font-bold hover:text-vitalia-purple-dark transition-colors inline-flex items-center gap-1">
                653 26 53 48
              </a>
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-8 w-full bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light hover:from-vitalia-purple-dark hover:to-vitalia-purple text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Entendido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vitalia-purple via-purple-600 to-white p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-vitalia-purple-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-vitalia-green rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md lg:max-w-xl relative z-10">
        {/* Card del login */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          {/* Logo y título */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-5 p-3 border-2 border-gray-100">
              <img 
                src="/vitalia.png" 
                alt="Logo Vitalia" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light bg-clip-text text-transparent mb-2">
              Vitalia
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Residencias de Mayores
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de usuario */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-vitalia-purple/50 focus:border-vitalia-purple transition-all outline-none bg-gray-50 hover:bg-white"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-vitalia-purple/50 focus:border-vitalia-purple transition-all outline-none bg-gray-50 hover:bg-white"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-vitalia-purple transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Recordarme y olvidé contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center group">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-vitalia-purple focus:ring-vitalia-purple border-gray-300 rounded cursor-pointer transition-all"
                />
                <label 
                  htmlFor="remember-me" 
                  className="ml-2 block text-sm text-gray-700 cursor-pointer select-none font-medium group-hover:text-vitalia-purple transition-colors"
                >
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-sm text-vitalia-purple hover:text-vitalia-purple-dark font-semibold transition-colors relative group"
              >
                ¿Olvidaste tu contraseña?
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-vitalia-purple-dark group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>

            {/* Botón de iniciar sesión */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light hover:from-vitalia-purple-dark hover:to-vitalia-purple text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              Iniciar Sesión
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>

          {/* Detalle decorativo */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-vitalia-green animate-pulse"></div>
              <p className="text-center text-xs text-gray-500 font-medium">
                Sistema de gestión interno
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-white text-sm font-medium drop-shadow-lg flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            ¿Necesitas ayuda? Contacta con soporte
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [selectedResidence, setSelectedResidence] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.remember === true && typeof parsed.username === 'string' && parsed.username.trim()) {
        setCurrentUser(parsed.username)
        setIsLoggedIn(true)
      }
    } catch {
      // Si hay basura en storage, no bloqueamos la app
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  const handleLogin = (username, remember) => {
    setCurrentUser(username)
    setIsLoggedIn(true)

    if (remember) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ username, remember: true, savedAt: Date.now() })
      )
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser('')
    setSelectedResidence(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const handleSelectResidence = (residence) => {
    setSelectedResidence(residence)
  }

  const handleBackToResidences = () => {
    setSelectedResidence(null)
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  if (selectedResidence) {
    return (
      <ResidenceDashboard 
        residence={selectedResidence} 
        onBack={handleBackToResidences}
        userName={currentUser}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <Dashboard 
      userName={currentUser} 
      onLogout={handleLogout}
      onSelectResidence={handleSelectResidence}
    />
  )
}

export default App

import { useState } from 'react'
import Header from './Header'
import RegistrosDiario from './RegistrosDiario'
import IncidenciasGlobales from './IncidenciasGlobales'
import { contarTodasTareasPendientesHoy, verificarTodosLosPisosCompletos } from '../utils/tareas'

function Registros({ onBack, userName, onLogout }) {
  const [view, setView] = useState('home')

  // Obtener estadísticas de tareas diarias
  const estadisticasTareas = contarTodasTareasPendientesHoy()
  const todosLosPisosCompletos = verificarTodosLosPisosCompletos()

  // Categorías de registro
  const registroCategories = [
    {
      id: 1,
      title: 'Diario',
      description: todosLosPisosCompletos
        ? 'Todos los pisos tienen al menos 1 tarea completada ✅'
        : `⚠️ FALTAN ${estadisticasTareas.pendientes} TAREAS POR COMPLETAR HOY`,
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: todosLosPisosCompletos ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
    },
    {
      id: 2,
      title: 'Semanal',
      description: 'Registro semanal consolidado de controles de Legionela',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      title: 'Registro Mensual T-Puntos',
      description: 'Control mensual de puntos de temperatura',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 4,
      title: 'Trimestral ACU+Depósito',
      description: 'Registro trimestral de ACU y depósitos',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 5,
      title: 'Registro Control Anual',
      description: 'Control anual de instalaciones y servicios',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600'
    },
    {
      id: 6,
      title: 'Recogido Muestras Anual',
      description: 'Registro anual de recogida de muestras',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 7,
      title: 'Incidencias',
      description: 'Registro y seguimiento de incidencias',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'from-yellow-500 to-amber-600'
    }
  ]

  const handleCategoryClick = (category) => {
    if (category.id === 1) {
      setView('diario')
    } else if (category.id === 7) {
      setView('incidencias')
    } else {
      // Para otros registros, podrías redirigir a otras páginas específicas
      console.log(`Clicking on categoria ${category.title}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        userName={userName} 
        onLogout={onLogout}
        onSettings={() => alert('Configuración próximamente')}
      />
      
      {/* Contenido con padding-top para el header fijo */}
      <div className="pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {view === 'home' ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Volver a Legionela</span>
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light bg-clip-text text-transparent">
                Registros de Legionela
              </h1>
              <p className="text-gray-600 mt-2">Gestión de registros diarios, semanales y anuales para el control de Legionela</p>
            </div>

            {/* Grid de categorías */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registroCategories.map((category) => {
                const destacarDiarioPendiente = category.id === 1 && !todosLosPisosCompletos

                return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden transform hover:-translate-y-1 ${
                    destacarDiarioPendiente ? 'ring-2 ring-red-300 shadow-red-100' : ''
                  }`}
                >
                  {/* Fondo degradado */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} ${destacarDiarioPendiente ? 'opacity-20' : 'opacity-10'} rounded-bl-full transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:opacity-20`}></div>

                  {/* Contenido */}
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    {destacarDiarioPendiente && (
                      <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Pendiente de completar hoy
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-vitalia-purple transition-colors">
                      {category.title}
                    </h3>
                    <p className={`${destacarDiarioPendiente ? 'text-red-700 font-semibold text-base' : 'text-gray-600 text-sm'}`}>{category.description}</p>

                    {/* Flecha */}
                    <div className="mt-4 flex items-center text-vitalia-purple opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-semibold mr-2">Acceder</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              )})}
            </div>
          </>
        ) : view === 'diario' ? (
          <RegistrosDiario 
            onBack={() => setView('home')} 
            userName={userName} 
            onLogout={onLogout} 
          />
        ) : view === 'incidencias' ? (
          <IncidenciasGlobales 
            onBack={() => setView('home')} 
            userName={userName} 
            onLogout={onLogout} 
          />
        ) : null}
      </div>
      </div>
    </div>
  )
}

export default Registros

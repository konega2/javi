import { useState } from 'react'
import SotanoRegistro from './SotanoRegistro'
import { obtenerEstadisticasPlanta } from '../utils/tareas'

function RegistrosDiario({ onBack, userName, onLogout }) {
  const [view, setView] = useState('apartados') // 'apartados' o 'sotano'
  
  const apartados = [
    { 
      id: 1, 
      title: 'Sótano', 
      subtitle: 'Nivel -1', 
      color: 'from-gray-500 to-gray-600', 
      habilitado: true, 
      planta: 'sotano',
      totalPuntos: 20
    },
    { 
      id: 2, 
      title: 'Planta baja', 
      subtitle: 'Nivel 0', 
      color: 'from-blue-500 to-blue-600', 
      habilitado: false,
      planta: 'planta_baja',
      totalPuntos: 0
    },
    { 
      id: 3, 
      title: 'Primera planta', 
      subtitle: 'Nivel 1', 
      color: 'from-green-500 to-green-600', 
      habilitado: false,
      planta: 'primera_planta',
      totalPuntos: 0
    },
    { 
      id: 4, 
      title: 'Segunda planta', 
      subtitle: 'Nivel 2', 
      color: 'from-orange-500 to-orange-600', 
      habilitado: false,
      planta: 'segunda_planta',
      totalPuntos: 0
    },
    { 
      id: 5, 
      title: 'Tercera planta', 
      subtitle: 'Nivel 3', 
      color: 'from-purple-500 to-purple-600', 
      habilitado: false,
      planta: 'tercera_planta',
      totalPuntos: 0
    },
    { 
      id: 6, 
      title: 'Cuarta planta', 
      subtitle: 'Nivel 4', 
      color: 'from-red-500 to-red-600', 
      habilitado: false,
      planta: 'cuarta_planta',
      totalPuntos: 0
    },
    { 
      id: 7, 
      title: 'Quinta planta', 
      subtitle: 'Nivel 5', 
      color: 'from-teal-500 to-teal-600', 
      habilitado: false,
      planta: 'quinta_planta',
      totalPuntos: 0
    }
  ]

  const handleApartadoClick = (apartado) => {
    if (apartado.title === 'Sótano' && apartado.habilitado) {
      setView('sotano')
    }
  }

  if (view === 'sotano') {
    return (
      <SotanoRegistro 
        onBack={() => setView('apartados')}
        userName={userName}
        onLogout={onLogout}
      />
    )
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver a Registros</span>
        </button>

        <h2 className="text-3xl font-bold text-gray-800">Diario</h2>
        <p className="text-gray-600 mt-2">Selecciona un apartado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartados.map((apartado) => {
          const estadisticas = apartado.habilitado ? obtenerEstadisticasPlanta(apartado.planta, apartado.totalPuntos) : null
          
          return (
          <button
            key={apartado.id}
            type="button"
            disabled={!apartado.habilitado}
            onClick={() => handleApartadoClick(apartado)}
            className={`group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 ${
              apartado.habilitado 
                ? 'cursor-pointer hover:shadow-lg hover:scale-105'
                : 'cursor-not-allowed opacity-70'
            }`}
            title={apartado.habilitado ? `Acceder a ${apartado.title}` : "Próximamente"}
          >
            {/* Fondo degradado */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${apartado.color} opacity-10 rounded-bl-full`}></div>
            
            {/* Contenido */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${apartado.color} text-white shadow-lg`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                {/* Indicador de estado de tareas diarias */}
                {apartado.habilitado && estadisticas && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                    estadisticas.color === 'green' 
                      ? 'bg-green-100 text-green-800'
                      : estadisticas.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800'  
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      estadisticas.color === 'green' 
                        ? 'bg-green-500'
                        : estadisticas.color === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}></div>
                    {estadisticas.completadas}/{estadisticas.total} hoy
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {apartado.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{apartado.subtitle}</p>
              
              {/* Estadísticas del día */}
              {apartado.habilitado && estadisticas && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Tareas de hoy</span>
                    <span>{estadisticas.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        estadisticas.color === 'green' 
                          ? 'bg-green-500'
                          : estadisticas.color === 'yellow'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${estadisticas.porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.pendientes > 0 
                      ? `${estadisticas.pendientes} pendientes`
                      : 'Todas completadas'
                    }
                  </p>
                </div>
              )}
              
              {/* Badge de bloqueado - solo si no está habilitado */}
              {!apartado.habilitado && (
                <div className="flex items-center text-vitalia-purple">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-vitalia-purple bg-vitalia-purple/10 border border-vitalia-purple/20 px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Próximamente</span>
                  </div>
                </div>
              )}
            </div>
          </button>
          )
        })}
      </div>
    </div>
  )
}

export default RegistrosDiario

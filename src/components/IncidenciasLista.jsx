import { useState, useMemo } from 'react'
import Header from './Header'

function IncidenciasLista({ incidencias, onBack, userName, onLogout }) {
  const [busqueda, setBusqueda] = useState('')
  const [ordenPor, setOrdenPor] = useState('fecha')
  const [direccionOrden, setDireccionOrden] = useState('desc')
  const [filtroRiesgo, setFiltroRiesgo] = useState('todos')
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null)

  // Filtrado y ordenamiento de incidencias
  const incidenciasFiltradas = useMemo(() => {
    let resultado = incidencias.filter(incidencia => {
      const coincideBusqueda = incidencia.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                              incidencia.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                              incidencia.zona.toLowerCase().includes(busqueda.toLowerCase())
      
      const coinicdeRiesgo = filtroRiesgo === 'todos' || incidencia.riesgo === filtroRiesgo
      
      return coincideBusqueda && coinicdeRiesgo
    })

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA, valorB

      switch (ordenPor) {
        case 'fecha':
          valorA = new Date(a.fecha)
          valorB = new Date(b.fecha)
          break
        case 'riesgo':
          const ordenRiesgo = { 'Crítico': 4, 'Alto': 3, 'Medio': 2, 'Bajo': 1 }
          valorA = ordenRiesgo[a.riesgo] || 0
          valorB = ordenRiesgo[b.riesgo] || 0
          break
        case 'usuario':
          valorA = a.reportadoPor.toLowerCase()
          valorB = b.reportadoPor.toLowerCase()
          break
        case 'zona':
          valorA = a.zona.toLowerCase()
          valorB = b.zona.toLowerCase()
          break
        default:
          return 0
      }

      if (direccionOrden === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0
      }
    })

    return resultado
  }, [incidencias, busqueda, ordenPor, direccionOrden, filtroRiesgo])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerColorRiesgo = (riesgo) => {
    const colores = {
      'Bajo': 'bg-green-100 text-green-800',
      'Medio': 'bg-yellow-100 text-yellow-800',
      'Alto': 'bg-red-100 text-red-800',
      'Crítico': 'bg-red-200 text-red-900'
    }
    return colores[riesgo] || 'bg-gray-100 text-gray-800'
  }

  if (incidenciaSeleccionada) {
    return <DetalleIncidencia 
      incidencia={incidenciaSeleccionada} 
      onBack={() => setIncidenciaSeleccionada(null)}
      userName={userName}
      onLogout={onLogout}
    />
  }

  return (
    <div>
      <Header userName={userName} onLogout={onLogout} />
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver al Registro</span>
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Incidencias del Sótano</h2>
            <p className="text-gray-600 mt-2">{incidenciasFiltradas.length} de {incidencias.length} incidencias</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título, descripción o zona..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por riesgo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riesgo</label>
            <select
              value={filtroRiesgo}
              onChange={(e) => setFiltroRiesgo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
            >
              <option value="todos">Todos los riesgos</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <div className="flex gap-2">
              <select
                value={ordenPor}
                onChange={(e) => setOrdenPor(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              >
                <option value="fecha">Fecha</option>
                <option value="riesgo">Riesgo</option>
                <option value="usuario">Usuario</option>
                <option value="zona">Zona</option>
              </select>
              <button
                onClick={() => setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={direccionOrden === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                <svg className={`w-5 h-5 transform ${direccionOrden === 'asc' ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de incidencias */}
      <div className="space-y-4">
        {incidenciasFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay incidencias</h3>
            <p className="text-gray-500">No se encontraron incidencias que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          incidenciasFiltradas.map((incidencia) => (
            <div
              key={incidencia.id}
              onClick={() => setIncidenciaSeleccionada(incidencia)}
              className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{incidencia.titulo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${obtenerColorRiesgo(incidencia.riesgo)}`}>
                      {incidencia.riesgo}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{incidencia.descripcion}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {incidencia.zona}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {incidencia.reportadoPor}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatearFecha(incidencia.fecha)}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Componente para mostrar el detalle de una incidencia
function DetalleIncidencia({ incidencia, onBack, userName, onLogout }) {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerColorRiesgo = (riesgo) => {
    const colores = {
      'Bajo': 'bg-green-100 text-green-800 border-green-200',
      'Medio': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Alto': 'bg-red-100 text-red-800 border-red-200',
      'Crítico': 'bg-red-200 text-red-900 border-red-300'
    }
    return colores[riesgo] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div>
      <Header userName={userName} onLogout={onLogout} />
      
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver a la lista</span>
        </button>
      </div>

      {/* Detalle de la incidencia */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{incidencia.titulo}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${obtenerColorRiesgo(incidencia.riesgo)}`}>
              Riesgo {incidencia.riesgo}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="font-medium">Zona:</span>
              <p className="mt-1">{incidencia.zona}</p>
            </div>
            <div>
              <span className="font-medium">Reportado por:</span>
              <p className="mt-1">{incidencia.reportadoPor}</p>
            </div>
            <div>
              <span className="font-medium">Fecha y hora:</span>
              <p className="mt-1">{formatearFecha(incidencia.fecha)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{incidencia.descripcion}</p>
          </div>
        </div>

        {incidencia.foto && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Fotografía</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <img 
                src={incidencia.foto} 
                alt={`Incidencia: ${incidencia.titulo}`}
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidenciasLista
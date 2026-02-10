import { useState, useEffect, useMemo } from 'react'
import Header from './Header'
import IncidenciasModal from './IncidenciasModal'
import IncidenciasLista from './IncidenciasLista'

// Datos predefinidos del sótano según la tabla
const puntosAgua = [
  { id: 1, lugar: 'SÓTANO', zona: 'LAVANDERÍA', tipoTerminal: 'GRIFO LAVABO', numGrifo: 2 },
  { id: 2, lugar: 'SÓTANO', zona: 'VESTUARIO FEMENINO', tipoTerminal: 'LAVABO', numGrifo: 3 },
  { id: 3, lugar: 'SÓTANO', zona: 'VESTUARIO FEMENINO', tipoTerminal: 'GRIFO DUCHA', numGrifo: 3 },
  { id: 4, lugar: 'SÓTANO', zona: 'VESTUARIO ADAPTADO', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 5, lugar: 'SÓTANO', zona: 'VESTUARIO MASCULINO', tipoTerminal: 'LAVABO', numGrifo: 3 },
  { id: 6, lugar: 'SÓTANO', zona: 'VESTUARIO MASCULINO', tipoTerminal: 'GRIFO DUCHA', numGrifo: 3 },
  { id: 7, lugar: 'SÓTANO', zona: 'LAVAPLATOS', tipoTerminal: 'GRIFO FREGADERO', numGrifo: 1 },
  { id: 8, lugar: 'SÓTANO', zona: 'COCINA', tipoTerminal: 'GRIFO FREGADERO', numGrifo: 1 },
  { id: 9, lugar: 'SÓTANO', zona: 'COCINA', tipoTerminal: 'LAVAMANOS', numGrifo: 1 },
  { id: 10, lugar: 'SÓTANO', zona: 'COCINA', tipoTerminal: 'LAVAMANOS CUARTO FRÍO', numGrifo: 1 },
  { id: 11, lugar: 'SÓTANO', zona: 'COCINA', tipoTerminal: 'FREGADERO CUARTO FRÍO', numGrifo: 1 },
  { id: 12, lugar: 'SÓTANO', zona: 'COCINA', tipoTerminal: 'FREGADERO PLONGE', numGrifo: 1 },
  { id: 13, lugar: 'SÓTANO', zona: 'COCINA', tipoTerminal: 'GRIFO MARMITA', numGrifo: 1 },
  { id: 14, lugar: 'SÓTANO', zona: 'CUARTO BASURAS', tipoTerminal: 'GRIFO AFCH', numGrifo: 1 },
  { id: 15, lugar: 'SÓTANO', zona: 'PARKING', tipoTerminal: 'GRIFO AFCH 1', numGrifo: 1 },
  { id: 16, lugar: 'SÓTANO', zona: 'PARKING', tipoTerminal: 'GRIFO AFCH 2', numGrifo: 1 },
  { id: 17, lugar: 'SÓTANO', zona: 'SALA CALDERAS', tipoTerminal: 'GRIFO AFCH', numGrifo: 1 },
  { id: 18, lugar: 'SÓTANO', zona: 'SALA DEPÓSITO GRISES', tipoTerminal: 'GRIFO AFCH', numGrifo: 1 },
  { id: 19, lugar: 'SÓTANO', zona: 'SALA GRUPO PRESIÓN', tipoTerminal: 'GRIFO AFCH', numGrifo: 1 },
  { id: 20, lugar: 'SÓTANO', zona: 'PATIO INGLÉS', tipoTerminal: 'GRIFO AFCH', numGrifo: 1 }
]

function SotanoRegistro({ onBack, userName, onLogout }) {
  const [view, setView] = useState('registro') // 'registro' o 'incidencias'
  const [registros, setRegistros] = useState({})
  const [incidencias, setIncidencias] = useState([])
  const [showIncidenciasModal, setShowIncidenciasModal] = useState(false)
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const [puntoActivo, setPuntoActivo] = useState(null)
  
  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos', 'completado', 'pendiente'
  const [filtroZona, setFiltroZona] = useState('todas')

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const savedRegistros = localStorage.getItem('vitalia.sotano.registros')
    const savedIncidencias = localStorage.getItem('vitalia.incidencias')
    
    if (savedRegistros) {
      setRegistros(JSON.parse(savedRegistros))
    }
    if (savedIncidencias) {
      setIncidencias(JSON.parse(savedIncidencias))
    }
  }, [])

  // Guardar registros en localStorage
  const saveRegistro = (puntoId, datos) => {
    const hoy = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    const nuevosRegistros = {
      ...registros,
      [puntoId]: {
        ...datos,
        fechaActualizacion: new Date().toISOString(),
        actualizadoPor: userName
      }
    }
    setRegistros(nuevosRegistros)
    localStorage.setItem('vitalia.sotano.registros', JSON.stringify(nuevosRegistros))
    
    // Marcar tarea diaria como completada si el registro está completo
    const esCompleto = datos.fecha && datos.clr && datos.ph && datos.tAcu && datos.retorno && datos.firma
    if (esCompleto) {
      actualizarTareaDiaria(puntoId, hoy, true)
    }
  }

  // Gestión de tareas diarias
  const actualizarTareaDiaria = (puntoId, fecha, completada) => {
    const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
    
    if (!tareasDiarias[fecha]) {
      tareasDiarias[fecha] = {}
    }
    if (!tareasDiarias[fecha]['sotano']) {
      tareasDiarias[fecha]['sotano'] = {}
    }
    
    tareasDiarias[fecha]['sotano'][puntoId] = completada
    localStorage.setItem('vitalia.tareas.diarias', JSON.stringify(tareasDiarias))
  }

  // Verificar si una tarea se hizo hoy
  const seTareaHechaHoy = (puntoId) => {
    const hoy = new Date().toISOString().split('T')[0]
    const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
    return tareasDiarias[hoy]?.sotano?.[puntoId] || false
  }

  // Contar tareas del día
  const contarTareasHoy = () => {
    const hoy = new Date().toISOString().split('T')[0]
    const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
    const tareasHoy = tareasDiarias[hoy]?.sotano || {}
    
    const completadas = Object.values(tareasHoy).filter(Boolean).length
    const total = puntosAgua.length
    const pendientes = total - completadas
    
    return { completadas, total, pendientes }
  }

  // Agregar nueva incidencia
  const agregarIncidencia = (incidencia) => {
    const nuevaIncidencia = {
      ...incidencia,
      id: Date.now(),
      fecha: new Date().toISOString(),
      reportadoPor: userName,
      zona: puntoActivo ? puntoActivo.zona : 'General'
    }
    const nuevasIncidencias = [...incidencias, nuevaIncidencia]
    setIncidencias(nuevasIncidencias)
    localStorage.setItem('vitalia.incidencias', JSON.stringify(nuevasIncidencias))
  }

  // Verificar si un registro está completo
  const esRegistroCompleto = (registro) => {
    if (!registro) return false
    return registro.fecha && registro.clr && registro.ph && registro.tAcu && registro.retorno && registro.firma
  }

  // Obtener zonas únicas para filtro
  const zonasUnicas = useMemo(() => {
    const zonas = [...new Set(puntosAgua.map(p => p.zona))]
    return zonas.sort()
  }, [])

  // Filtrar puntos de agua
  const puntosFiltrados = useMemo(() => {
    return puntosAgua.filter(punto => {
      const registro = registros[punto.id]
      const completo = esRegistroCompleto(registro)
      
      // Filtro por búsqueda
      const coincideBusqueda = busqueda === '' || 
        punto.zona.toLowerCase().includes(busqueda.toLowerCase()) ||
        punto.tipoTerminal.toLowerCase().includes(busqueda.toLowerCase())
      
      // Filtro por estado
      const coinicdeEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'completado' && completo) ||
        (filtroEstado === 'pendiente' && !completo)
      
      // Filtro por zona
      const coinicdeZona = filtroZona === 'todas' || punto.zona === filtroZona
      
      return coincideBusqueda && coinicdeEstado && coinicdeZona
    })
  }, [puntosAgua, registros, busqueda, filtroEstado, filtroZona, esRegistroCompleto])

  // Contar registros por estado
  const stats = useMemo(() => {
    const total = puntosAgua.length
    const completados = puntosAgua.filter(p => esRegistroCompleto(registros[p.id])).length
    const pendientes = total - completados
    return { total, completados, pendientes }
  }, [puntosAgua, registros, esRegistroCompleto])

  // Contar tareas del día
  const tareasHoy = useMemo(() => {
    return contarTareasHoy()
  }, [])

  if (view === 'incidencias') {
    return (
      <IncidenciasLista 
        incidencias={incidencias.filter(inc => inc.zona.includes('SÓTANO') || inc.zona === 'General')}
        onBack={() => setView('registro')}
        userName={userName}
        onLogout={onLogout}
      />
    )
  }

  return (
    <div>
      <Header userName={userName} onLogout={onLogout} />
      
      {/* Header con navegación */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver a Diario</span>
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Sótano - Registro de Puntos de Agua</h2>
            <div className="flex items-center gap-6 mt-2">
              {/* Estadísticas generales */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Completados: {stats.completados}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pendientes: {stats.pendientes}</span>
                </div>
                <span className="text-sm text-gray-500">Total: {stats.total}</span>
              </div>
              
              {/* Estadísticas del día */}
              <div className="border-l border-gray-300 pl-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Hechas hoy: {tareasHoy.completadas}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Faltan hoy: {tareasHoy.pendientes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setView('incidencias')}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Ver Incidencias
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por zona o tipo..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              >
                <option value="todos">Todos los registros</option>
                <option value="completado">Completados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>  
              <select
                value={filtroZona}
                onChange={(e) => setFiltroZona(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              >
                <option value="todas">Todas las zonas</option>
                {zonasUnicas.map(zona => (
                  <option key={zona} value={zona}>{zona}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de cards compactas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {puntosFiltrados.map((punto) => {
          const registro = registros[punto.id]
          const completo = esRegistroCompleto(registro)
          const hechaHoy = seTareaHechaHoy(punto.id)
          
          // Lógica de colores: Verde si está completo en general, Azul si se hizo hoy, Rojo si no
          let colorClases = ''
          let estadoTexto = ''
          
          if (hechaHoy) {
            colorClases = 'bg-blue-50 border-blue-200 hover:border-blue-300'
            estadoTexto = 'Hecha hoy'
          } else if (completo) {
            colorClases = 'bg-green-50 border-green-200 hover:border-green-300'
            estadoTexto = 'Completa'
          } else {
            colorClases = 'bg-red-50 border-red-200 hover:border-red-300'
            estadoTexto = 'Pendiente hoy'
          }
          
          return (
            <button
              key={punto.id}
              onClick={() => {
                setPuntoActivo(punto)
                setShowRegistroModal(true)
              }}
              className={`text-left p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 relative ${colorClases}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm">{punto.zona}</h3>
                <div className="flex items-center gap-2">
                  {hechaHoy ? (
                    <div className="w-3 h-3 bg-blue-500 rounded-full" title="Hecha hoy"></div>
                  ) : completo ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Registro completo"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full" title="Pendiente hoy"></div>
                  )}
                </div>
              </div>
              
              {/* Badge de estado */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  hechaHoy 
                    ? 'bg-blue-100 text-blue-800'
                    : completo 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {estadoTexto}
                </span>
              </div>
              
              <p className="text-gray-600 text-xs mb-2">
                <span className="font-medium">Tipo:</span> {punto.tipoTerminal}
              </p>
              <p className="text-gray-600 text-xs">
                <span className="font-medium">Nº Grifo:</span> {punto.numGrifo}
              </p>
              {registro?.fechaActualizacion && (
                <p className="text-gray-400 text-xs mt-2">
                  Actualizado: {new Date(registro.fechaActualizacion).toLocaleDateString()}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {puntosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No se encontraron registros que coincidan con los filtros aplicados.</p>
        </div>
      )}

      {/* Modal de registro */}
      {showRegistroModal && puntoActivo && (
        <PuntoAguaModal
          punto={puntoActivo}
          registro={registros[puntoActivo.id] || {}}
          onSave={(datos) => {
            saveRegistro(puntoActivo.id, datos)
            setShowRegistroModal(false)
            setPuntoActivo(null)
          }}
          onIncidencia={() => {
            setShowRegistroModal(false)
            setShowIncidenciasModal(true)
          }}
          onClose={() => {
            setShowRegistroModal(false)
            setPuntoActivo(null)
          }}
        />
      )}

      {/* Modal de incidencias */}
      {showIncidenciasModal && (
        <IncidenciasModal
          onClose={() => {
            setShowIncidenciasModal(false)
            setPuntoActivo(null)
          }}
          onSubmit={agregarIncidencia}
          punto={puntoActivo}
        />
      )}
    </div>
  )
}

// Componente modal para editar cada punto de agua
function PuntoAguaModal({ punto, registro, onSave, onIncidencia, onClose }) {
  const [datos, setDatos] = useState({
    fecha: registro.fecha || '',
    clr: registro.clr || '',
    ph: registro.ph || '',
    tAcu: registro.tAcu || '',
    retorno: registro.retorno || '',
    firma: registro.firma || '',
    foto: registro.foto || null,
    observaciones: registro.observaciones || ''
  })

  const handleSave = () => {
    onSave(datos)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setDatos(prev => ({ ...prev, foto: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header del modal */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{punto.zona}</h3>
              <div className="text-sm text-gray-600 mt-1">
                <p><span className="font-medium">Tipo:</span> {punto.tipoTerminal}</p>
                <p><span className="font-medium">Nº Grifo:</span> {punto.numGrifo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={datos.fecha}
                  onChange={(e) => setDatos(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CLR</label>
                <input
                  type="text"
                  value={datos.clr}
                  onChange={(e) => setDatos(prev => ({ ...prev, clr: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
                <input
                  type="text"
                  value={datos.ph}
                  onChange={(e) => setDatos(prev => ({ ...prev, ph: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tº ACU</label>
                <input
                  type="text"
                  value={datos.tAcu}
                  onChange={(e) => setDatos(prev => ({ ...prev, tAcu: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retorno</label>
                <input
                  type="text"
                  value={datos.retorno}
                  onChange={(e) => setDatos(prev => ({ ...prev, retorno: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input
                type="text"
                value={datos.firma}
                onChange={(e) => setDatos(prev => ({ ...prev, firma: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
            </div>

            {/* Foto opcional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto del Registro (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
              {datos.foto && (
                <div className="mt-3">
                  <img src={datos.foto} alt="Registro" className="w-40 h-40 object-cover rounded-lg border" />
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
              <textarea
                value={datos.observaciones}
                onChange={(e) => setDatos(prev => ({ ...prev, observaciones: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none"
                placeholder="Añade cualquier observación relevante..."
              />
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onIncidencia}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Reportar Incidencia
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300"
            >
              Guardar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SotanoRegistro
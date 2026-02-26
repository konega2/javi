import { useState, useEffect, useMemo } from 'react'
import Header from './Header'
import IncidenciasModal from './IncidenciasModal'
import IncidenciasLista from './IncidenciasLista'
import PDFPeriodosModal from './PDFPeriodosModal'
import { verificarYReiniciarDia, reiniciarTareasPlanta, rotarRegistrosPorMes } from '../utils/tareas'
import { descargarPlantaPDFPorAnios } from '../utils/pdfExport'

// Datos predefinidos de la Planta Baja según la tabla
const puntosAguaPredefinidos = [
  { id: 1, lugar: 'PLANTA BAJA', zona: 'U11', tipoTerminal: 'GRIFO LAVABO', numGrifo: 2 },
  { id: 2, lugar: 'PLANTA BAJA', zona: 'BAÑO U11', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 3, lugar: 'PLANTA BAJA', zona: 'BAÑO VISITAS', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 4, lugar: 'PLANTA BAJA', zona: 'BAÑO PATIO INTERIOR', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 5, lugar: 'PLANTA BAJA', zona: 'UNIDAD CONVIVENCIA 1', tipoTerminal: 'GRIFO COCINA', numGrifo: 2 },
  { id: 6, lugar: 'PLANTA BAJA', zona: 'UC 2', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 7, lugar: 'PLANTA BAJA', zona: 'UC 3', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 8, lugar: 'PLANTA BAJA', zona: 'UC 4', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 9, lugar: 'PLANTA BAJA', zona: 'PELUQUERÍA', tipoTerminal: 'LAVA CABEZAS', numGrifo: 2 },
  { id: 10, lugar: 'PLANTA BAJA', zona: 'UC 5', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 11, lugar: 'PLANTA BAJA', zona: 'UC 6', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 12, lugar: 'PLANTA BAJA', zona: 'COMEDOR FAMILIAR', tipoTerminal: 'GRIFO LAVABO Y GRIFO DUCHA', numGrifo: 2 },
  { id: 13, lugar: 'PLANTA BAJA', zona: 'PATIO INTERIOR', tipoTerminal: 'GRIFO MANGUERA', numGrifo: 2 }
]

function PlantaBajaRegistro({ onBack, userName, onLogout }) {
  const obtenerMesActual = () => String(new Date().getFullYear())
  const formatearMes = (mes) => {
    return String(mes)
  }

  const [view, setView] = useState('registro') // 'registro' o 'incidencias'
  const [registros, setRegistros] = useState({})
  const [incidencias, setIncidencias] = useState([])
  const [showIncidenciasModal, setShowIncidenciasModal] = useState(false)
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const [puntoActivo, setPuntoActivo] = useState(null)
  const [puntosAgua, setPuntosAgua] = useState(puntosAguaPredefinidos)
  const [showNuevaTareaModal, setShowNuevaTareaModal] = useState(false)
  const [showReiniciarModal, setShowReiniciarModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [mesesDisponiblesPdf, setMesesDisponiblesPdf] = useState([obtenerMesActual()])
  
  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos', 'completado', 'pendiente'
  const [filtroZona, setFiltroZona] = useState('todas')

  // Cargar datos del localStorage al montar
  useEffect(() => {
    rotarRegistrosPorMes('plantabaja')
    const savedRegistros = localStorage.getItem('vitalia.plantabaja.registros')
    const savedIncidencias = localStorage.getItem('vitalia.incidencias')
    const savedPuntosPersonalizados = localStorage.getItem('vitalia.plantabaja.puntos')
    const historicoMensual = JSON.parse(localStorage.getItem('vitalia.plantabaja.registros.anuales') || '{}')
    const mesActual = obtenerMesActual()
    const meses = [mesActual, ...Object.keys(historicoMensual)].sort((a, b) => b.localeCompare(a))
    
    if (savedRegistros) {
      setRegistros(JSON.parse(savedRegistros))
    }
    if (savedIncidencias) {
      setIncidencias(JSON.parse(savedIncidencias))
    }
    if (savedPuntosPersonalizados) {
      const puntosPersonalizados = JSON.parse(savedPuntosPersonalizados)
      setPuntosAgua([...puntosAguaPredefinidos, ...puntosPersonalizados])
    }

    setMesesDisponiblesPdf([...new Set(meses)])
    
    // Verificar si cambió el día
    verificarYReiniciarDia()
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
    localStorage.setItem('vitalia.plantabaja.registros', JSON.stringify(nuevosRegistros))
    
    // Marcar tarea diaria como completada si se guardó al menos un dato
    const tieneDatos = Boolean(
      datos.fecha || datos.clr || datos.ph || datos.tAcu || datos.retorno || datos.firma || datos.foto || datos.observaciones
    )
    if (tieneDatos) {
      actualizarTareaDiaria(puntoId, hoy, true)
    }
  }

  // Gestión de tareas diarias
  const actualizarTareaDiaria = (puntoId, fecha, completada) => {
    const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
    
    if (!tareasDiarias[fecha]) {
      tareasDiarias[fecha] = {}
    }
    if (!tareasDiarias[fecha]['plantabaja']) {
      tareasDiarias[fecha]['plantabaja'] = {}
    }
    
    tareasDiarias[fecha]['plantabaja'][puntoId] = completada
    localStorage.setItem('vitalia.tareas.diarias', JSON.stringify(tareasDiarias))
  }

  // Verificar si una tarea se hizo hoy
  const seTareaHechaHoy = (puntoId) => {
    const hoy = new Date().toISOString().split('T')[0]
    const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
    return tareasDiarias[hoy]?.plantabaja?.[puntoId] || false
  }

  // Contar tareas del día
  const contarTareasHoy = () => {
    const hoy = new Date().toISOString().split('T')[0]
    const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
    const tareasHoy = tareasDiarias[hoy]?.plantabaja || {}
    
    const completadasReales = Object.values(tareasHoy).filter(Boolean).length
    const completadas = completadasReales > 0 ? 1 : 0
    const total = 1
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
      zona: puntoActivo ? `${puntoActivo.lugar} - ${puntoActivo.zona}` : 'General'
    }
    const nuevasIncidencias = [...incidencias, nuevaIncidencia]
    setIncidencias(nuevasIncidencias)
    localStorage.setItem('vitalia.incidencias', JSON.stringify(nuevasIncidencias))
  }

  // Agregar nuevo punto de agua manualmente
  const agregarNuevaTarea = (nuevaTarea) => {
    const nuevoPunto = {
      ...nuevaTarea,
      id: `custom-${Date.now()}`,
      isCustom: true,
      lugar: 'PLANTA BAJA'
    }
    
    // Agregar al estado
    const nuevosPuntos = [...puntosAgua, nuevoPunto]
    setPuntosAgua(nuevosPuntos)
    
    // Guardar solo puntos personalizados en localStorage
    const puntosPersonalizados = nuevosPuntos.filter(p => p.isCustom)
    localStorage.setItem('vitalia.plantabaja.puntos', JSON.stringify(puntosPersonalizados))
    
    setShowNuevaTareaModal(false)
  }

  const reiniciarCardsSeleccionadas = (tareasIds) => {
    const nuevosRegistros = { ...registros }
    tareasIds.forEach((id) => {
      delete nuevosRegistros[id]
      delete nuevosRegistros[String(id)]
    })

    setRegistros(nuevosRegistros)
    localStorage.setItem('vitalia.plantabaja.registros', JSON.stringify(nuevosRegistros))
    reiniciarTareasPlanta('plantabaja', tareasIds)
    setShowReiniciarModal(false)
  }

  const descargarPDFPorMesesSeleccionados = (mesesSeleccionados) => {
    const mesActual = obtenerMesActual()
    const historico = JSON.parse(localStorage.getItem('vitalia.plantabaja.registros.anuales') || '{}')
    const actuales = JSON.parse(localStorage.getItem('vitalia.plantabaja.registros') || '{}')

    const registrosPorMes = Object.fromEntries(
      Object.entries(historico).map(([mes, contenido]) => [mes, contenido?.registros || {}])
    )
    registrosPorMes[mesActual] = actuales

    const mesesValidos = (mesesSeleccionados || []).filter((mes) => registrosPorMes[mes])
    if (mesesValidos.length === 0) {
      window.alert('No hay datos disponibles para los periodos seleccionados.')
      return
    }

    descargarPlantaPDFPorAnios({
      nombrePlanta: puntosAgua[0]?.lugar || 'PLANTA',
      puntosAgua,
      registrosPorAnio: registrosPorMes,
      aniosSeleccionados: mesesValidos
    })
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
  }, [puntosAgua])

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
  }, [registros, puntosAgua])

  if (view === 'incidencias') {
    return (
      <IncidenciasLista 
        incidencias={incidencias.filter(inc => inc.zona.includes('PLANTA BAJA') || inc.zona === 'General' || puntosAgua.some(p => p.zona === inc.zona))}
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

        <div className="flex flex-col xl:flex-row xl:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Planta Baja - Registro de Puntos de Agua</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
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
              <div className="border-t sm:border-t-0 sm:border-l border-gray-300 pt-3 sm:pt-0 sm:pl-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-wrap gap-3 w-full xl:w-auto">
            <button
              onClick={() => setShowNuevaTareaModal(true)}
              className="bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Tarea
            </button>
            <button
              onClick={() => setShowReiniciarModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reiniciar Cards
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16.5A2.5 2.5 0 006.5 19h11a2.5 2.5 0 002.5-2.5" />
              </svg>
              Descargar PDF
            </button>
            <button
              onClick={() => setView('incidencias')}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Ver Incidencias
            </button>
          </div>
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

      {/* Modal para nueva tarea */}
      {showNuevaTareaModal && (
        <NuevaTareaModal
          onClose={() => setShowNuevaTareaModal(false)}
          onSave={agregarNuevaTarea}
          zonasExistentes={zonasUnicas}
        />
      )}

      {/* Modal para reiniciar cards */}
      {showReiniciarModal && (
        <ReiniciarCardsModal
          onClose={() => setShowReiniciarModal(false)}
          puntosAgua={puntosAgua}
          planta="plantabaja"
          onReset={reiniciarCardsSeleccionadas}
        />
      )}

      {showPdfModal && (
        <PDFPeriodosModal
          title="Descargar PDF"
          subtitle="Elige años a incluir"
          periodosDisponibles={mesesDisponiblesPdf}
          periodoInicial={obtenerMesActual()}
          formatearPeriodo={formatearMes}
          onClose={() => setShowPdfModal(false)}
          onDescargar={(periodos) => {
            descargarPDFPorMesesSeleccionados(periodos)
            setShowPdfModal(false)
          }}
        />
      )}
    </div>
  )
}

// Componente modal para editar cada punto de agua
function PuntoAguaModal({ punto, registro, onSave, onIncidencia, onClose }) {
  const [datos, setDatos] = useState({
    fecha: registro.fecha || new Date().toISOString().split('T')[0],
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
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className="block w-full max-w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent file:mr-2 file:px-3 file:py-2 file:border-0 file:rounded-md file:bg-gray-100 file:text-gray-700"
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
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onIncidencia}
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Reportar Incidencia
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:flex-1 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300"
            >
              Guardar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal para agregar nueva tarea manualmente
const NuevaTareaModal = ({ onClose, onSave, zonasExistentes }) => {
  const [zona, setZona] = useState('')
  const [nuevaZona, setNuevaZona] = useState('')
  const [tipoTerminal, setTipoTerminal] = useState('')
  const [numGrifo, setNumGrifo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const nuevaTarea = {
      zona: zona === 'nueva' ? nuevaZona : zona,
      tipoTerminal,
      numGrifo: parseInt(numGrifo) || 1
    }
    
    onSave(nuevaTarea)
    
    // Reset form
    setZona('')
    setNuevaZona('')
    setTipoTerminal('')
    setNumGrifo('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">➞ Nueva Tarea / Punto de Agua</h3>
          <p className="text-white/80 mt-1">Agrega un nuevo punto de agua manualmente</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Selector de Zona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona <span className="text-red-500">*</span>
              </label>
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                required
              >
                <option value="">Seleccionar zona...</option>
                {zonasExistentes.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
                <option value="nueva">➞ Nueva zona...</option>
              </select>
            </div>

            {/* Input para nueva zona */}
            {zona === 'nueva' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la nueva zona <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nuevaZona}
                  onChange={(e) => setNuevaZona(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  placeholder="Ej: Zona Nueva, Área 5, etc."
                  required
                />
              </div>
            )}

            {/* Tipo de Terminal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Terminal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tipoTerminal}
                onChange={(e) => setTipoTerminal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                placeholder="Ej: Lavabo, Ducha, Grifo, etc."
                required
              />
            </div>

            {/* Número de Grifo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Grifo
              </label>
              <input
                type="number"
                value={numGrifo}
                onChange={(e) => setNumGrifo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300"
            >
              Agregar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para reiniciar cards de tareas completadas
const ReiniciarCardsModal = ({ onClose, puntosAgua, planta, onReset }) => {
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([])
  const [todasSeleccionadas, setTodasSeleccionadas] = useState(false)

  // Obtener tareas completadas hoy
  const hoy = new Date().toISOString().split('T')[0]
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  const tareasHoy = tareasDiarias[hoy]?.[planta] || {}
  
  const tareasCompletadas = puntosAgua.filter(punto => tareasHoy[punto.id])

  const toggleTarea = (tareaId) => {
    if (tareasSeleccionadas.includes(tareaId)) {
      setTareasSeleccionadas(tareasSeleccionadas.filter(id => id !== tareaId))
      setTodasSeleccionadas(false)
    } else {
      const nuevasSeleccionadas = [...tareasSeleccionadas, tareaId]
      setTareasSeleccionadas(nuevasSeleccionadas)
      if (nuevasSeleccionadas.length === tareasCompletadas.length) {
        setTodasSeleccionadas(true)
      }
    }
  }

  const seleccionarTodas = () => {
    if (todasSeleccionadas) {
      setTareasSeleccionadas([])
      setTodasSeleccionadas(false)
    } else {
      setTareasSeleccionadas(tareasCompletadas.map(p => p.id))
      setTodasSeleccionadas(true)
    }
  }

  const handleReiniciar = () => {
    onReset(tareasSeleccionadas)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">🔄 Reiniciar Cards Completadas</h3>
          <p className="text-white/80 mt-1">Selecciona las tareas que quieres marcar como no completadas</p>
        </div>

        <div className="p-6">
          {tareasCompletadas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No hay tareas completadas hoy para reiniciar</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {tareasCompletadas.length} tarea(s) completada(s) hoy
                </p>
                <button
                  onClick={seleccionarTodas}
                  className="text-sm font-medium text-vitalia-purple hover:text-vitalia-purple-light transition-colors"
                >
                  {todasSeleccionadas ? '✓ Todas seleccionadas' : 'Seleccionar todas'}
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tareasCompletadas.map(punto => (
                  <label
                    key={punto.id}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tareasSeleccionadas.includes(punto.id)}
                      onChange={() => toggleTarea(punto.id)}
                      className="mt-1 w-5 h-5 text-vitalia-purple border-gray-300 rounded focus:ring-vitalia-purple"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{punto.zona}</p>
                      <p className="text-sm text-gray-600">{punto.tipoTerminal}</p>
                      <p className="text-xs text-gray-400">Nº Grifo: {punto.numGrifo}</p>
                    </div>
                    <div className="text-green-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            {tareasCompletadas.length > 0 && (
              <button
                onClick={handleReiniciar}
                disabled={tareasSeleccionadas.length === 0}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reiniciar {todasSeleccionadas ? 'Todas' : `${tareasSeleccionadas.length} Seleccionada(s)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlantaBajaRegistro
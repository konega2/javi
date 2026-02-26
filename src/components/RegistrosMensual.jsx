import { useMemo, useState, useEffect } from 'react'
import PDFPeriodosModal from './PDFPeriodosModal'
import { obtenerClaveMesActual } from '../utils/tareas'
import { descargarMensualPDFPorMeses } from '../utils/pdfExport'

const registroVacio = () => ({ elevacion: null, purga: null })

const normalizarRegistroMes = (registroMes) => {
  if (!registroMes) return registroVacio()
  if (registroMes.elevacion || registroMes.purga) {
    return {
      elevacion: registroMes.elevacion || null,
      purga: registroMes.purga || null
    }
  }
  return {
    elevacion: registroMes,
    purga: null
  }
}

const elevacionCompleta = (registro) => Boolean(
  registro?.fecha &&
  registro?.temperaturaAlcanza &&
  registro?.tiempoElevada &&
  registro?.firmado
)

const purgaCompleta = (registro) => Boolean(
  registro?.fecha &&
  (
    registro?.puntoPurgaModo === 'todo_edificio' ||
    Boolean(registro?.puntoPurgaDetalle || registro?.puntoPurga)
  ) &&
  registro?.firmado
)

function RegistrosMensual({ onBack, userName }) {
  const [showElevacionModal, setShowElevacionModal] = useState(false)
  const [showPurgaModal, setShowPurgaModal] = useState(false)
  const [showReiniciarModal, setShowReiniciarModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [claveMesActual, setClaveMesActual] = useState(obtenerClaveMesActual())
  const [mesSeleccionado, setMesSeleccionado] = useState(obtenerClaveMesActual())
  const [registroMes, setRegistroMes] = useState(registroVacio())
  const [mesesDisponibles, setMesesDisponibles] = useState([])

  const mensualCompletado = elevacionCompleta(registroMes.elevacion) && purgaCompleta(registroMes.purga)

  const mesActualTexto = useMemo(() => {
    const [year, month] = mesSeleccionado.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }, [mesSeleccionado])

  useEffect(() => {
    const revisarCambioMes = () => {
      const nuevaClave = obtenerClaveMesActual()
      setClaveMesActual((anterior) => {
        if (anterior !== nuevaClave) {
          setMesSeleccionado(nuevaClave)
        }
        return nuevaClave
      })
    }

    const intervalo = setInterval(revisarCambioMes, 60 * 1000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const registrosMensuales = JSON.parse(localStorage.getItem('vitalia.mensual.registros') || '{}')
    const actual = normalizarRegistroMes(registrosMensuales[mesSeleccionado])
    setRegistroMes(actual)

    const meses = [claveMesActual, ...Object.keys(registrosMensuales)].sort((a, b) => b.localeCompare(a))
    setMesesDisponibles([...new Set(meses)])
  }, [mesSeleccionado, claveMesActual])

  const formatearMes = (mes) => {
    const [year, month] = mes.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  const guardarTareaMensual = (tipo, datos) => {
    const registrosMensuales = JSON.parse(localStorage.getItem('vitalia.mensual.registros') || '{}')
    const actual = normalizarRegistroMes(registrosMensuales[mesSeleccionado])

    const registroActualizado = {
      ...actual,
      [tipo]: {
        ...datos,
        actualizadoPor: userName,
        fechaActualizacion: new Date().toISOString()
      }
    }

    registrosMensuales[mesSeleccionado] = registroActualizado
    localStorage.setItem('vitalia.mensual.registros', JSON.stringify(registrosMensuales))

    setRegistroMes(registroActualizado)
    if (tipo === 'elevacion') setShowElevacionModal(false)
    if (tipo === 'purga') setShowPurgaModal(false)
  }

  const reiniciarMesSeleccionado = () => {
    const registrosMensuales = JSON.parse(localStorage.getItem('vitalia.mensual.registros') || '{}')
    delete registrosMensuales[mesSeleccionado]
    localStorage.setItem('vitalia.mensual.registros', JSON.stringify(registrosMensuales))

    setRegistroMes(registroVacio())
    const meses = [claveMesActual, ...Object.keys(registrosMensuales)].sort((a, b) => b.localeCompare(a))
    setMesesDisponibles([...new Set(meses)])
    setShowReiniciarModal(false)
  }

  const descargarPdfMensual = (mesesSeleccionados) => {
    const registrosMensuales = JSON.parse(localStorage.getItem('vitalia.mensual.registros') || '{}')
    const registrosPorMes = { ...registrosMensuales, [mesSeleccionado]: registroMes }

    const mesesValidos = (mesesSeleccionados || []).filter((mes) => registrosPorMes[mes])
    if (mesesValidos.length === 0) {
      window.alert('No hay datos disponibles para los meses seleccionados.')
      return
    }

    descargarMensualPDFPorMeses({
      registrosPorMes,
      mesesSeleccionados: mesesValidos
    })
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver a Registros</span>
        </button>

        <h2 className="text-3xl font-bold text-gray-800">Mensual</h2>
        <p className="text-gray-600 mt-2">Mes seleccionado: {mesActualTexto}</p>
        <div className="mt-3 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar mes</label>
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
          >
            {mesesDisponibles.map((mes) => (
              <option key={mes} value={mes}>{formatearMes(mes)}</option>
            ))}
          </select>
          {mesSeleccionado === claveMesActual ? (
            <p className="text-xs text-green-700 mt-1 font-medium">Mes actual</p>
          ) : (
            <p className="text-xs text-amber-700 mt-1 font-medium">Mes histórico</p>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowReiniciarModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reiniciar Mes
        </button>

        <button
          onClick={() => setShowPdfModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16.5A2.5 2.5 0 006.5 19h11a2.5 2.5 0 002.5-2.5" />
          </svg>
          Descargar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => setShowElevacionModal(true)}
          className="group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
          title="Abrir tarea mensual de elevación"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 opacity-10 rounded-bl-full"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                elevacionCompleta(registroMes.elevacion) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${elevacionCompleta(registroMes.elevacion) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {elevacionCompleta(registroMes.elevacion) ? '1/1 mes' : '0/1 mes'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">Elevar Tª acumuladores &gt; 70°C</h3>
            <p className="text-gray-600 text-sm mb-4">Registro mensual de temperatura y tiempo de elevación</p>

            <p className="text-xs text-gray-500 mt-1">
              {elevacionCompleta(registroMes.elevacion) ? 'Tarea mensual completada' : 'Debes hacer esta tarea 1 vez al mes'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowPurgaModal(true)}
          className="group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
          title="Abrir tarea mensual de purga"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500 to-cyan-600 opacity-10 rounded-bl-full"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                purgaCompleta(registroMes.purga) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${purgaCompleta(registroMes.purga) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {purgaCompleta(registroMes.purga) ? '1/1 mes' : '0/1 mes'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">Purga a través de válvulas de drenaje</h3>
            <p className="text-gray-600 text-sm mb-4">Registro mensual de purga y observaciones</p>

            <p className="text-xs text-gray-500 mt-1">
              {purgaCompleta(registroMes.purga) ? 'Tarea mensual completada' : 'Debes hacer esta tarea 1 vez al mes'}
            </p>
          </div>
        </button>
      </div>

      <div className="mt-4 text-sm font-medium text-gray-700">
        Estado mensual general: {mensualCompletado ? '2/2 tareas completadas ✅' : 'Faltan tareas por completar ⚠️'}
      </div>

      {showElevacionModal && (
        <RegistroElevacionMensualModal
          registro={registroMes.elevacion}
          onClose={() => setShowElevacionModal(false)}
          onSave={(datos) => guardarTareaMensual('elevacion', datos)}
        />
      )}

      {showPurgaModal && (
        <RegistroPurgaMensualModal
          registro={registroMes.purga}
          onClose={() => setShowPurgaModal(false)}
          onSave={(datos) => guardarTareaMensual('purga', datos)}
        />
      )}

      {showReiniciarModal && (
        <ReiniciarMensualModal
          onClose={() => setShowReiniciarModal(false)}
          onConfirm={reiniciarMesSeleccionado}
          hayRegistro={Boolean(registroMes.elevacion || registroMes.purga)}
        />
      )}

      {showPdfModal && (
        <PDFPeriodosModal
          title="Descargar PDF Mensual"
          subtitle="Elige meses a incluir"
          periodosDisponibles={mesesDisponibles}
          periodoInicial={mesSeleccionado}
          formatearPeriodo={formatearMes}
          onClose={() => setShowPdfModal(false)}
          onDescargar={(periodos) => {
            descargarPdfMensual(periodos)
            setShowPdfModal(false)
          }}
        />
      )}
    </div>
  )
}

function RegistroElevacionMensualModal({ registro, onClose, onSave }) {
  const [datos, setDatos] = useState({
    fecha: registro?.fecha || new Date().toISOString().split('T')[0],
    temperaturaAlcanza: registro?.temperaturaAlcanza || '',
    tiempoElevada: registro?.tiempoElevada || '',
    observacionesAcciones: registro?.observacionesAcciones || '',
    firmado: registro?.firmado || '',
    verificadoPor: registro?.verificadoPor || '',
    fechaVerificacion: registro?.fechaVerificacion || ''
  })

  const handleGuardar = (e) => {
    e.preventDefault()

    if (!datos.fecha || !datos.temperaturaAlcanza || !datos.tiempoElevada || !datos.firmado.trim()) {
      window.alert('Fecha, Tª alcanza acumulador 1, tiempo elevada y firmado son obligatorios.')
      return
    }

    onSave({
      ...datos,
      firmado: datos.firmado.trim(),
      verificadoPor: datos.verificadoPor.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleGuardar} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Registro Mensual</h3>
              <p className="text-sm text-gray-600">Elevar la temperatura de los acumuladores a más de 70°C</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={datos.fecha}
                  onChange={(e) => setDatos(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tª alcanza acumulador 1</label>
                <input
                  type="text"
                  value={datos.temperaturaAlcanza}
                  onChange={(e) => setDatos(prev => ({ ...prev, temperaturaAlcanza: e.target.value }))}
                  placeholder="Ej: 71.2°C"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo elevada</label>
              <input
                type="text"
                value={datos.tiempoElevada}
                onChange={(e) => setDatos(prev => ({ ...prev, tiempoElevada: e.target.value }))}
                placeholder="Ej: 30 minutos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones / Acciones correctoras</label>
              <textarea
                value={datos.observacionesAcciones}
                onChange={(e) => setDatos(prev => ({ ...prev, observacionesAcciones: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firmado</label>
                <input
                  type="text"
                  value={datos.firmado}
                  onChange={(e) => setDatos(prev => ({ ...prev, firmado: e.target.value }))}
                  placeholder="Nombre y apellidos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verificado por</label>
                <input
                  type="text"
                  value={datos.verificadoPor}
                  onChange={(e) => setDatos(prev => ({ ...prev, verificadoPor: e.target.value }))}
                  placeholder="Nombre y firma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha verificación</label>
              <input
                type="date"
                value={datos.fechaVerificacion}
                onChange={(e) => setDatos(prev => ({ ...prev, fechaVerificacion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
            </div>
          </div>

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
              Guardar tarea mensual
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RegistroPurgaMensualModal({ registro, onClose, onSave }) {
  const valorInicialPurga = registro?.puntoPurga || ''
  const modoInicial = registro?.puntoPurgaModo || (valorInicialPurga.toLowerCase() === 'todo el edificio' ? 'todo_edificio' : 'un_punto')
  const [datos, setDatos] = useState({
    fecha: registro?.fecha || new Date().toISOString().split('T')[0],
    puntoPurgaModo: modoInicial,
    puntoPurgaDetalle: registro?.puntoPurgaDetalle || (modoInicial === 'todo_edificio' ? '' : valorInicialPurga),
    observaciones: registro?.observaciones || '',
    firmado: registro?.firmado || '',
    verificadoPor: registro?.verificadoPor || '',
    fechaVerificacion: registro?.fechaVerificacion || ''
  })

  const handleGuardar = (e) => {
    e.preventDefault()

    if (!datos.fecha || !datos.firmado.trim()) {
      window.alert('Fecha y firmado son obligatorios.')
      return
    }

    const requiereDetalle = datos.puntoPurgaModo === 'un_punto' || datos.puntoPurgaModo === 'varios_puntos'
    if (requiereDetalle && !datos.puntoPurgaDetalle.trim()) {
      window.alert('Debes indicar el/los punto(s) de purga.')
      return
    }

    const puntoPurgaTexto = datos.puntoPurgaModo === 'todo_edificio'
      ? 'Todo el edificio'
      : datos.puntoPurgaDetalle.trim()

    onSave({
      ...datos,
      puntoPurgaDetalle: requiereDetalle ? datos.puntoPurgaDetalle.trim() : '',
      puntoPurga: puntoPurgaTexto,
      firmado: datos.firmado.trim(),
      verificadoPor: datos.verificadoPor.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleGuardar} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Registro Mensual</h3>
              <p className="text-sm text-gray-600">Purga a través de válvulas de drenaje</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={datos.fecha}
                  onChange={(e) => setDatos(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Punto de purga</label>
                <select
                  value={datos.puntoPurgaModo}
                  onChange={(e) => setDatos(prev => ({ ...prev, puntoPurgaModo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                >
                  <option value="todo_edificio">Todo el edificio</option>
                  <option value="un_punto">1 punto específico</option>
                  <option value="varios_puntos">Varios puntos</option>
                </select>
              </div>
            </div>

            {(datos.puntoPurgaModo === 'un_punto' || datos.puntoPurgaModo === 'varios_puntos') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {datos.puntoPurgaModo === 'un_punto' ? 'Punto específico' : 'Puntos específicos'}
                </label>
                <input
                  type="text"
                  value={datos.puntoPurgaDetalle}
                  onChange={(e) => setDatos(prev => ({ ...prev, puntoPurgaDetalle: e.target.value }))}
                  placeholder={datos.puntoPurgaModo === 'un_punto' ? 'Ej: Acumulador 1' : 'Ej: Acumulador 1, Acumulador 2, Retorno'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={datos.observaciones}
                onChange={(e) => setDatos(prev => ({ ...prev, observaciones: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firmado</label>
                <input
                  type="text"
                  value={datos.firmado}
                  onChange={(e) => setDatos(prev => ({ ...prev, firmado: e.target.value }))}
                  placeholder="Nombre y apellidos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verificado por</label>
                <input
                  type="text"
                  value={datos.verificadoPor}
                  onChange={(e) => setDatos(prev => ({ ...prev, verificadoPor: e.target.value }))}
                  placeholder="Nombre y firma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha verificación</label>
              <input
                type="date"
                value={datos.fechaVerificacion}
                onChange={(e) => setDatos(prev => ({ ...prev, fechaVerificacion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
            </div>
          </div>

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
              Guardar tarea mensual
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReiniciarMensualModal({ onClose, onConfirm, hayRegistro }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">Reiniciar Mes Mensual</h3>
          <p className="text-white/80 mt-1">Esto borrará las tareas del mes seleccionado</p>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {hayRegistro
              ? '¿Seguro que quieres reiniciar el mes seleccionado? Esta acción eliminará ambas tareas mensuales de ese mes.'
              : 'No hay registros mensuales cargados para este mes.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            {hayRegistro && (
              <button
                onClick={onConfirm}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300"
              >
                Confirmar Reinicio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrosMensual

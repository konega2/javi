import { useMemo, useState, useEffect } from 'react'
import PDFPeriodosModal from './PDFPeriodosModal'
import { obtenerClaveSemanaActual, tareaSemanalCompletadaSemanaActual } from '../utils/tareas'
import { descargarSemanalPDFPorSemanas } from '../utils/pdfExport'

function RegistrosSemanal({ onBack, userName }) {
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const [showReiniciarModal, setShowReiniciarModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [registroSemana, setRegistroSemana] = useState(null)
  const [completadaSemana, setCompletadaSemana] = useState(false)
  const [semanasDisponibles, setSemanasDisponibles] = useState([])

  const claveSemana = useMemo(() => obtenerClaveSemanaActual(), [])

  const rangoSemanaTexto = useMemo(() => {
    const [year, month, day] = claveSemana.split('-').map(Number)
    const inicio = new Date(year, month - 1, day)
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)

    const format = (fecha) => fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    return `${format(inicio)} - ${format(fin)}`
  }, [claveSemana])

  useEffect(() => {
    const registrosSemanales = JSON.parse(localStorage.getItem('vitalia.semanal.registros') || '{}')
    const actual = registrosSemanales[claveSemana] || null
    setRegistroSemana(actual)
    setCompletadaSemana(tareaSemanalCompletadaSemanaActual())
    const semanas = [claveSemana, ...Object.keys(registrosSemanales)].sort((a, b) => b.localeCompare(a))
    setSemanasDisponibles([...new Set(semanas)])
  }, [claveSemana])

  const formatearSemana = (semana) => {
    const [year, month, day] = semana.split('-').map(Number)
    const inicio = new Date(year, month - 1, day)
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    const formato = (fecha) => fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${formato(inicio)} - ${formato(fin)}`
  }

  const guardarRegistroSemanal = (datos) => {
    const registrosSemanales = JSON.parse(localStorage.getItem('vitalia.semanal.registros') || '{}')

    const registroActualizado = {
      ...datos,
      actualizadoPor: userName,
      fechaActualizacion: new Date().toISOString()
    }

    registrosSemanales[claveSemana] = registroActualizado
    localStorage.setItem('vitalia.semanal.registros', JSON.stringify(registrosSemanales))

    setRegistroSemana(registroActualizado)
    setCompletadaSemana(tareaSemanalCompletadaSemanaActual())
    setShowRegistroModal(false)
  }

  const reiniciarSemanaActual = () => {
    const registrosSemanales = JSON.parse(localStorage.getItem('vitalia.semanal.registros') || '{}')
    delete registrosSemanales[claveSemana]
    localStorage.setItem('vitalia.semanal.registros', JSON.stringify(registrosSemanales))

    setRegistroSemana(null)
    setCompletadaSemana(false)
    setShowReiniciarModal(false)
  }

  const descargarPdfSemanal = (semanasSeleccionadas) => {
    const registrosSemanales = JSON.parse(localStorage.getItem('vitalia.semanal.registros') || '{}')
    const registrosPorSemana = { ...registrosSemanales }
    if (registroSemana) registrosPorSemana[claveSemana] = registroSemana

    const semanasValidas = (semanasSeleccionadas || []).filter((semana) => registrosPorSemana[semana])
    if (semanasValidas.length === 0) {
      window.alert('No hay datos disponibles para las semanas seleccionadas.')
      return
    }

    descargarSemanalPDFPorSemanas({
      registrosPorSemana,
      semanasSeleccionadas: semanasValidas
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

        <h2 className="text-3xl font-bold text-gray-800">Semanal</h2>
        <p className="text-gray-600 mt-2">Selecciona un apartado · Semana actual: {rangoSemanaTexto}</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {completadaSemana && (
          <button
            onClick={() => setShowRegistroModal(true)}
            className="bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar Tarea
          </button>
        )}

        <button
          onClick={() => setShowReiniciarModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reiniciar Tarea
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

      <div className="grid grid-cols-1 gap-6">
        <button
          type="button"
          onClick={() => setShowRegistroModal(true)}
          className="group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
          title="Abrir registro semanal"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 opacity-10 rounded-bl-full"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                completadaSemana ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${completadaSemana ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {completadaSemana ? '1/1 semana' : '0/1 semana'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">ACS + AFS (Semanal)</h3>
            <p className="text-gray-600 text-sm mb-4">Apertura de puntos terminales de red con poco uso o no utilizados</p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Tarea de la semana</span>
                <span>{completadaSemana ? '100%' : '0%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${completadaSemana ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${completadaSemana ? 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completadaSemana ? 'Tarea semanal completada' : 'Debes hacer 1 tarea esta semana'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="rounded-lg bg-gray-50 px-3 py-2">Fecha: <span className="font-medium text-gray-800">{registroSemana?.fecha || '-'}</span></div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">Firmado: <span className="font-medium text-gray-800">{registroSemana?.firmado || '-'}</span></div>
            </div>
          </div>
        </button>
      </div>

      {showRegistroModal && (
        <RegistroSemanalModal
          registro={registroSemana}
          onClose={() => setShowRegistroModal(false)}
          onSave={guardarRegistroSemanal}
        />
      )}

      {showReiniciarModal && (
        <ReiniciarSemanaModal
          onClose={() => setShowReiniciarModal(false)}
          onConfirm={reiniciarSemanaActual}
          hayRegistro={Boolean(registroSemana)}
        />
      )}

      {showPdfModal && (
        <PDFPeriodosModal
          title="Descargar PDF Semanal"
          subtitle="Elige semanas a incluir"
          periodosDisponibles={semanasDisponibles}
          periodoInicial={claveSemana}
          formatearPeriodo={formatearSemana}
          onClose={() => setShowPdfModal(false)}
          onDescargar={(periodos) => {
            descargarPdfSemanal(periodos)
            setShowPdfModal(false)
          }}
        />
      )}
    </div>
  )
}

function RegistroSemanalModal({ registro, onClose, onSave }) {
  const [datos, setDatos] = useState({
    fecha: registro?.fecha || new Date().toISOString().split('T')[0],
    puntosControlModo: registro?.puntosControlModo || 'todo_edificio',
    puntosControlDetalle: registro?.puntosControlDetalle || '',
    observaciones: registro?.observaciones || '',
    incidencias: registro?.incidencias || '',
    firmado: registro?.firmado || ''
  })

  const handleGuardar = (e) => {
    e.preventDefault()

    const requiereDetalle = datos.puntosControlModo === 'especificar'
    if (requiereDetalle && !datos.puntosControlDetalle.trim()) {
      window.alert('Debes especificar los puntos de control.')
      return
    }

    if (!datos.fecha || !datos.firmado.trim()) {
      window.alert('Fecha y firmado son obligatorios.')
      return
    }

    onSave({
      ...datos,
      puntosControlDetalle: requiereDetalle ? datos.puntosControlDetalle.trim() : 'TODO EL EDIFICIO'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleGuardar} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Registro Semanal (ACS + AFS)</h3>
              <p className="text-sm text-gray-600">Completa la única tarea semanal del edificio</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos de control</label>
                <select
                  value={datos.puntosControlModo}
                  onChange={(e) => setDatos(prev => ({ ...prev, puntosControlModo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                >
                  <option value="todo_edificio">TODO EL EDIFICIO</option>
                  <option value="especificar">Especificar puntos</option>
                </select>
              </div>
            </div>

            {datos.puntosControlModo === 'especificar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos específicos</label>
                <input
                  type="text"
                  value={datos.puntosControlDetalle}
                  onChange={(e) => setDatos(prev => ({ ...prev, puntosControlDetalle: e.target.value }))}
                  placeholder="Ej: Sótano, planta baja y terraza"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incidencias</label>
              <textarea
                value={datos.incidencias}
                onChange={(e) => setDatos(prev => ({ ...prev, incidencias: e.target.value }))}
                rows={3}
                placeholder="Si no hay incidencias, dejar vacío"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none"
              />
            </div>

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
              Guardar registro semanal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReiniciarSemanaModal({ onClose, onConfirm, hayRegistro }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">Reiniciar Tarea Semanal</h3>
          <p className="text-white/80 mt-1">Esto borrará el registro de la semana actual</p>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {hayRegistro
              ? '¿Seguro que quieres reiniciar la tarea semanal? Esta acción eliminará los datos cargados esta semana.'
              : 'No hay un registro semanal cargado para esta semana.'}
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

export default RegistrosSemanal

import { useMemo, useState, useEffect } from 'react'
import PDFPeriodosModal from './PDFPeriodosModal'
import { obtenerClaveTrimestreActual } from '../utils/tareas'
import { descargarTrimestralPDFPorTrimestres } from '../utils/pdfExport'

const registroInstalacionVacio = () => ({
  fecha: '',
  funcionamientoEstado: '',
  funcionamientoAccion: '',
  funcionamientoAccionDetalle: '',
  incrustacionesEstado: '',
  incrustacionesAccion: '',
  incrustacionesAccionDetalle: '',
  corrosionEstado: '',
  corrosionAccion: '',
  corrosionAccionDetalle: '',
  suciedadEstado: '',
  suciedadAccion: '',
  suciedadAccionDetalle: '',
  limpiezaDesinfeccionEstado: '',
  limpiezaDesinfeccionAccion: '',
  limpiezaDesinfeccionAccionDetalle: '',
  observaciones: '',
  firmado: '',
  firmaResponsable: ''
})

const registroTrimestralVacio = () => ({
  acumulador1: registroInstalacionVacio(),
  acumulador2: registroInstalacionVacio(),
  depositoAfs: registroInstalacionVacio(),
  observacionesGenerales: '',
  fechaGeneral: '',
  firmaResponsableGeneral: ''
})

const normalizarRegistroTrimestral = (registro) => {
  const base = registroTrimestralVacio()
  if (!registro) return base

  return {
    ...base,
    ...registro,
    acumulador1: { ...base.acumulador1, ...(registro.acumulador1 || {}) },
    acumulador2: { ...base.acumulador2, ...(registro.acumulador2 || {}) },
    depositoAfs: { ...base.depositoAfs, ...(registro.depositoAfs || {}) }
  }
}

const revisionCompleta = (registro, prefijo) => {
  const estado = registro[`${prefijo}Estado`]
  const accion = registro[`${prefijo}Accion`]
  const detalle = registro[`${prefijo}AccionDetalle`]

  if (!estado || !accion) return false
  if (accion === 'accion_realizada') return Boolean(detalle && detalle.trim())
  return true
}

const instalacionCompleta = (registro) => Boolean(
  registro.fecha &&
  registro.firmado &&
  revisionCompleta(registro, 'funcionamiento') &&
  revisionCompleta(registro, 'incrustaciones') &&
  revisionCompleta(registro, 'corrosion') &&
  revisionCompleta(registro, 'suciedad') &&
  revisionCompleta(registro, 'limpiezaDesinfeccion')
)

function RegistrosTrimestral({ onBack, userName }) {
  const [showAcumulador1Modal, setShowAcumulador1Modal] = useState(false)
  const [showAcumulador2Modal, setShowAcumulador2Modal] = useState(false)
  const [showDepositoModal, setShowDepositoModal] = useState(false)
  const [showReiniciarModal, setShowReiniciarModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [claveTrimestreActual, setClaveTrimestreActual] = useState(obtenerClaveTrimestreActual())
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState(obtenerClaveTrimestreActual())
  const [registroTrimestral, setRegistroTrimestral] = useState(registroTrimestralVacio())
  const [trimestresDisponibles, setTrimestresDisponibles] = useState([])

  const acumulador1Ok = instalacionCompleta(registroTrimestral.acumulador1)
  const acumulador2Ok = instalacionCompleta(registroTrimestral.acumulador2)
  const depositoOk = instalacionCompleta(registroTrimestral.depositoAfs)
  const trimestralCompleto = acumulador1Ok && acumulador2Ok && depositoOk

  const formatearTrimestre = (clave) => {
    const [year, quarterRaw] = clave.split('-T')
    const quarter = Number(quarterRaw)
    const labels = {
      1: 'T1 (ene-mar)',
      2: 'T2 (abr-jun)',
      3: 'T3 (jul-sep)',
      4: 'T4 (oct-dic)'
    }
    return `${labels[quarter] || `T${quarter}`} ${year}`
  }

  const trimestreTexto = useMemo(() => formatearTrimestre(trimestreSeleccionado), [trimestreSeleccionado])

  useEffect(() => {
    const revisarCambioTrimestre = () => {
      const nuevaClave = obtenerClaveTrimestreActual()
      setClaveTrimestreActual((anterior) => {
        if (anterior !== nuevaClave) {
          setTrimestreSeleccionado(nuevaClave)
        }
        return nuevaClave
      })
    }

    const intervalo = setInterval(revisarCambioTrimestre, 60 * 1000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const registrosTrimestrales = JSON.parse(localStorage.getItem('vitalia.trimestral.registros') || '{}')
    setRegistroTrimestral(normalizarRegistroTrimestral(registrosTrimestrales[trimestreSeleccionado]))
    const trimestres = [claveTrimestreActual, ...Object.keys(registrosTrimestrales)].sort((a, b) => b.localeCompare(a))
    setTrimestresDisponibles([...new Set(trimestres)])
  }, [trimestreSeleccionado, claveTrimestreActual])

  const guardarInstalacion = (claveInstalacion, datos) => {
    const registrosTrimestrales = JSON.parse(localStorage.getItem('vitalia.trimestral.registros') || '{}')
    const actual = normalizarRegistroTrimestral(registrosTrimestrales[trimestreSeleccionado])

    const actualizado = {
      ...actual,
      [claveInstalacion]: {
        ...datos,
        actualizadoPor: userName,
        fechaActualizacion: new Date().toISOString()
      }
    }

    registrosTrimestrales[trimestreSeleccionado] = actualizado
    localStorage.setItem('vitalia.trimestral.registros', JSON.stringify(registrosTrimestrales))

    setRegistroTrimestral(actualizado)
    if (claveInstalacion === 'acumulador1') setShowAcumulador1Modal(false)
    if (claveInstalacion === 'acumulador2') setShowAcumulador2Modal(false)
    if (claveInstalacion === 'depositoAfs') setShowDepositoModal(false)
  }

  const reiniciarTrimestreSeleccionado = () => {
    const registrosTrimestrales = JSON.parse(localStorage.getItem('vitalia.trimestral.registros') || '{}')
    delete registrosTrimestrales[trimestreSeleccionado]
    localStorage.setItem('vitalia.trimestral.registros', JSON.stringify(registrosTrimestrales))

    setRegistroTrimestral(registroTrimestralVacio())
    const trimestres = [claveTrimestreActual, ...Object.keys(registrosTrimestrales)].sort((a, b) => b.localeCompare(a))
    setTrimestresDisponibles([...new Set(trimestres)])
    setShowReiniciarModal(false)
  }

  const descargarPdfTrimestral = (trimestresSeleccionados) => {
    const registrosTrimestrales = JSON.parse(localStorage.getItem('vitalia.trimestral.registros') || '{}')
    const registrosPorTrimestre = { ...registrosTrimestrales, [trimestreSeleccionado]: registroTrimestral }

    const trimestresValidos = (trimestresSeleccionados || []).filter((t) => registrosPorTrimestre[t])
    if (trimestresValidos.length === 0) {
      window.alert('No hay datos disponibles para los trimestres seleccionados.')
      return
    }

    descargarTrimestralPDFPorTrimestres({
      registrosPorTrimestre,
      trimestresSeleccionados: trimestresValidos
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

        <h2 className="text-3xl font-bold text-gray-800">Trimestral</h2>
        <p className="text-gray-600 mt-2">Trimestre seleccionado: {trimestreTexto}</p>

        <div className="mt-3 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar trimestre</label>
          <select
            value={trimestreSeleccionado}
            onChange={(e) => setTrimestreSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
          >
            {trimestresDisponibles.map((trimestre) => (
              <option key={trimestre} value={trimestre}>{formatearTrimestre(trimestre)}</option>
            ))}
          </select>
          {trimestreSeleccionado === claveTrimestreActual ? (
            <p className="text-xs text-green-700 mt-1 font-medium">Trimestre actual</p>
          ) : (
            <p className="text-xs text-amber-700 mt-1 font-medium">Trimestre histórico</p>
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
          Reiniciar Trimestre
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InstalacionCard title="ACUMULADOR 1" done={acumulador1Ok} onClick={() => setShowAcumulador1Modal(true)} color="from-purple-500 to-purple-600" />
        <InstalacionCard title="ACUMULADOR 2" done={acumulador2Ok} onClick={() => setShowAcumulador2Modal(true)} color="from-indigo-500 to-indigo-600" />
        <InstalacionCard title="DEPÓSITO AFS" done={depositoOk} onClick={() => setShowDepositoModal(true)} color="from-sky-500 to-sky-600" />
      </div>

      <div className="mt-4 text-sm font-medium text-gray-700">
        Estado trimestral general: {trimestralCompleto ? '3/3 instalaciones completadas ✅' : 'Faltan instalaciones por completar ⚠️'}
      </div>

      {showAcumulador1Modal && (
        <RegistroInstalacionTrimestralModal
          title="ACUMULADOR 1"
          registro={registroTrimestral.acumulador1}
          onClose={() => setShowAcumulador1Modal(false)}
          onSave={(datos) => guardarInstalacion('acumulador1', datos)}
        />
      )}

      {showAcumulador2Modal && (
        <RegistroInstalacionTrimestralModal
          title="ACUMULADOR 2"
          registro={registroTrimestral.acumulador2}
          onClose={() => setShowAcumulador2Modal(false)}
          onSave={(datos) => guardarInstalacion('acumulador2', datos)}
        />
      )}

      {showDepositoModal && (
        <RegistroInstalacionTrimestralModal
          title="DEPÓSITO AFS"
          registro={registroTrimestral.depositoAfs}
          onClose={() => setShowDepositoModal(false)}
          onSave={(datos) => guardarInstalacion('depositoAfs', datos)}
        />
      )}

      {showReiniciarModal && (
        <ReiniciarTrimestralModal
          onClose={() => setShowReiniciarModal(false)}
          onConfirm={reiniciarTrimestreSeleccionado}
          hayRegistro={Boolean(
            registroTrimestral.acumulador1.fecha ||
            registroTrimestral.acumulador2.fecha ||
            registroTrimestral.depositoAfs.fecha
          )}
        />
      )}

      {showPdfModal && (
        <PDFPeriodosModal
          title="Descargar PDF Trimestral"
          subtitle="Elige trimestres a incluir"
          periodosDisponibles={trimestresDisponibles}
          periodoInicial={trimestreSeleccionado}
          formatearPeriodo={formatearTrimestre}
          onClose={() => setShowPdfModal(false)}
          onDescargar={(periodos) => {
            descargarPdfTrimestral(periodos)
            setShowPdfModal(false)
          }}
        />
      )}
    </div>
  )
}

function InstalacionCard({ title, done, onClick, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            </svg>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${done ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className={`w-2 h-2 rounded-full ${done ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {done ? '1/1' : '0/1'}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">Revisión trimestral completa por checklist</p>
      </div>
    </button>
  )
}

function RevisionRow({
  label,
  estadoValue,
  accionValue,
  accionDetalleValue,
  onEstado,
  onAccion,
  onAccionDetalle,
  idPrefix,
  estadoOkLabel,
  estadoKoLabel,
  accionOkLabel = 'No se precisa',
  accionKoLabel = 'Acción realizada'
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
      <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Estado</p>
          <div className="space-y-2">
            <label className={`flex items-start gap-3 text-sm p-3 rounded-lg border cursor-pointer transition-colors ${estadoValue === 'ok' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <input className="mt-0.5" type="radio" name={`${idPrefix}-estado`} checked={estadoValue === 'ok'} onChange={() => onEstado('ok')} />
              {estadoOkLabel}
            </label>
            <label className={`flex items-start gap-3 text-sm p-3 rounded-lg border cursor-pointer transition-colors ${estadoValue === 'ko' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <input className="mt-0.5" type="radio" name={`${idPrefix}-estado`} checked={estadoValue === 'ko'} onChange={() => onEstado('ko')} />
              {estadoKoLabel}
            </label>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Acción realizada</p>
          <div className="space-y-2">
            <label className={`flex items-start gap-3 text-sm p-3 rounded-lg border cursor-pointer transition-colors ${accionValue === 'no_precisa' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <input className="mt-0.5" type="radio" name={`${idPrefix}-accion`} checked={accionValue === 'no_precisa'} onChange={() => onAccion('no_precisa')} />
              {accionOkLabel}
            </label>
            <label className={`flex items-start gap-3 text-sm p-3 rounded-lg border cursor-pointer transition-colors ${accionValue === 'accion_realizada' ? 'border-vitalia-purple bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <input className="mt-0.5" type="radio" name={`${idPrefix}-accion`} checked={accionValue === 'accion_realizada'} onChange={() => onAccion('accion_realizada')} />
              {accionKoLabel}
            </label>
          </div>
        </div>
      </div>

      {accionValue === 'accion_realizada' && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Describe la acción realizada</label>
          <textarea
            value={accionDetalleValue}
            onChange={(e) => onAccionDetalle(e.target.value)}
            rows={2}
            placeholder="Escribe qué acción se ha realizado..."
            className="w-full px-3 py-2 border border-vitalia-purple/40 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none bg-white"
          />
        </div>
      )}
    </div>
  )
}

function RegistroInstalacionTrimestralModal({ title, registro, onClose, onSave }) {
  const [datos, setDatos] = useState({
    fecha: registro?.fecha || '',
    funcionamientoEstado: registro?.funcionamientoEstado || '',
    funcionamientoAccion: registro?.funcionamientoAccion || '',
    funcionamientoAccionDetalle: registro?.funcionamientoAccionDetalle || '',
    incrustacionesEstado: registro?.incrustacionesEstado || '',
    incrustacionesAccion: registro?.incrustacionesAccion || '',
    incrustacionesAccionDetalle: registro?.incrustacionesAccionDetalle || '',
    corrosionEstado: registro?.corrosionEstado || '',
    corrosionAccion: registro?.corrosionAccion || '',
    corrosionAccionDetalle: registro?.corrosionAccionDetalle || '',
    suciedadEstado: registro?.suciedadEstado || '',
    suciedadAccion: registro?.suciedadAccion || '',
    suciedadAccionDetalle: registro?.suciedadAccionDetalle || '',
    limpiezaDesinfeccionEstado: registro?.limpiezaDesinfeccionEstado || '',
    limpiezaDesinfeccionAccion: registro?.limpiezaDesinfeccionAccion || '',
    limpiezaDesinfeccionAccionDetalle: registro?.limpiezaDesinfeccionAccionDetalle || '',
    observaciones: registro?.observaciones || '',
    firmado: registro?.firmado || '',
    firmaResponsable: registro?.firmaResponsable || ''
  })

  const handleGuardar = (e) => {
    e.preventDefault()

    const revisionesCompletas = [
      ['funcionamientoEstado', 'funcionamientoAccion', 'funcionamientoAccionDetalle'],
      ['incrustacionesEstado', 'incrustacionesAccion', 'incrustacionesAccionDetalle'],
      ['corrosionEstado', 'corrosionAccion', 'corrosionAccionDetalle'],
      ['suciedadEstado', 'suciedadAccion', 'suciedadAccionDetalle'],
      ['limpiezaDesinfeccionEstado', 'limpiezaDesinfeccionAccion', 'limpiezaDesinfeccionAccionDetalle']
    ].every(([estadoKey, accionKey, detalleKey]) => {
      if (!datos[estadoKey] || !datos[accionKey]) return false
      if (datos[accionKey] === 'accion_realizada') return Boolean(datos[detalleKey]?.trim())
      return true
    })

    if (!datos.fecha || !datos.firmado.trim() || !revisionesCompletas) {
      window.alert('Debes completar fecha, firma y todas las marcas de revisión (estado y acción).')
      return
    }

    onSave({
      ...datos,
      firmado: datos.firmado.trim(),
      firmaResponsable: datos.firmaResponsable.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleGuardar} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Registro Trimestral</h3>
              <p className="text-sm text-gray-600">Instalación: {title}</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={datos.fecha}
                onChange={(e) => setDatos(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
            </div>

            <RevisionRow
              idPrefix={`${title}-func`}
              label="Funcionamiento"
              estadoOkLabel="No se observan anomalías"
              estadoKoLabel="Se observan elementos defectuosos"
              estadoValue={datos.funcionamientoEstado}
              accionValue={datos.funcionamientoAccion}
              accionDetalleValue={datos.funcionamientoAccionDetalle}
              onEstado={(value) => setDatos(prev => ({ ...prev, funcionamientoEstado: value }))}
              onAccion={(value) => setDatos(prev => ({ ...prev, funcionamientoAccion: value, funcionamientoAccionDetalle: value === 'accion_realizada' ? prev.funcionamientoAccionDetalle : '' }))}
              onAccionDetalle={(value) => setDatos(prev => ({ ...prev, funcionamientoAccionDetalle: value }))}
            />

            <RevisionRow
              idPrefix={`${title}-incr`}
              label="Incrustaciones"
              estadoOkLabel="Ausencia de incrustaciones"
              estadoKoLabel="Presencia de incrustaciones"
              estadoValue={datos.incrustacionesEstado}
              accionValue={datos.incrustacionesAccion}
              accionDetalleValue={datos.incrustacionesAccionDetalle}
              onEstado={(value) => setDatos(prev => ({ ...prev, incrustacionesEstado: value }))}
              onAccion={(value) => setDatos(prev => ({ ...prev, incrustacionesAccion: value, incrustacionesAccionDetalle: value === 'accion_realizada' ? prev.incrustacionesAccionDetalle : '' }))}
              onAccionDetalle={(value) => setDatos(prev => ({ ...prev, incrustacionesAccionDetalle: value }))}
            />

            <RevisionRow
              idPrefix={`${title}-corr`}
              label="Corrosión"
              estadoOkLabel="Ausencia de procesos de corrosión"
              estadoKoLabel="Presencia de elementos de corrosión"
              estadoValue={datos.corrosionEstado}
              accionValue={datos.corrosionAccion}
              accionDetalleValue={datos.corrosionAccionDetalle}
              onEstado={(value) => setDatos(prev => ({ ...prev, corrosionEstado: value }))}
              onAccion={(value) => setDatos(prev => ({ ...prev, corrosionAccion: value, corrosionAccionDetalle: value === 'accion_realizada' ? prev.corrosionAccionDetalle : '' }))}
              onAccionDetalle={(value) => setDatos(prev => ({ ...prev, corrosionAccionDetalle: value }))}
            />

            <RevisionRow
              idPrefix={`${title}-suc`}
              label="Suciedad"
              estadoOkLabel="Ausencia"
              estadoKoLabel="Presencia de sedimentos"
              estadoValue={datos.suciedadEstado}
              accionValue={datos.suciedadAccion}
              accionDetalleValue={datos.suciedadAccionDetalle}
              onEstado={(value) => setDatos(prev => ({ ...prev, suciedadEstado: value }))}
              onAccion={(value) => setDatos(prev => ({ ...prev, suciedadAccion: value, suciedadAccionDetalle: value === 'accion_realizada' ? prev.suciedadAccionDetalle : '' }))}
              onAccionDetalle={(value) => setDatos(prev => ({ ...prev, suciedadAccionDetalle: value }))}
            />

            <RevisionRow
              idPrefix={`${title}-limp`}
              label="Limpieza y Desinfección"
              estadoOkLabel="Se realiza la limpieza y desinfección"
              estadoKoLabel="No se realiza la limpieza y desinfección"
              accionOkLabel="No se precisa"
              accionKoLabel="Acción realizada"
              estadoValue={datos.limpiezaDesinfeccionEstado}
              accionValue={datos.limpiezaDesinfeccionAccion}
              accionDetalleValue={datos.limpiezaDesinfeccionAccionDetalle}
              onEstado={(value) => setDatos(prev => ({ ...prev, limpiezaDesinfeccionEstado: value }))}
              onAccion={(value) => setDatos(prev => ({ ...prev, limpiezaDesinfeccionAccion: value, limpiezaDesinfeccionAccionDetalle: value === 'accion_realizada' ? prev.limpiezaDesinfeccionAccionDetalle : '' }))}
              onAccionDetalle={(value) => setDatos(prev => ({ ...prev, limpiezaDesinfeccionAccionDetalle: value }))}
            />

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma J. Torres e Hijos</label>
                <input
                  type="text"
                  value={datos.firmado}
                  onChange={(e) => setDatos(prev => ({ ...prev, firmado: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma responsable</label>
                <input
                  type="text"
                  value={datos.firmaResponsable}
                  onChange={(e) => setDatos(prev => ({ ...prev, firmaResponsable: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300">
              Guardar revisión trimestral
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReiniciarTrimestralModal({ onClose, onConfirm, hayRegistro }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">Reiniciar Trimestre</h3>
          <p className="text-white/80 mt-1">Esto borrará los 3 registros del trimestre seleccionado</p>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {hayRegistro
              ? '¿Seguro que quieres reiniciar este trimestre? Se eliminarán acumulador 1, acumulador 2 y depósito AFS.'
              : 'No hay registros trimestrales cargados para este trimestre.'}
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

export default RegistrosTrimestral

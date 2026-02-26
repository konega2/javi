import { useMemo, useState, useEffect } from 'react'
import PDFPeriodosModal from './PDFPeriodosModal'
import { obtenerClaveAnioActual } from '../utils/tareas'
import { descargarAnualPDFPorAnios } from '../utils/pdfExport'

const revisionesConfig = [
  {
    key: 'funcionamiento',
    concepto: 'Revisión general del funcionamiento',
    opciones: [
      { value: 'anomalias', label: 'Se observan anomalías' },
      { value: 'sin_anomalias', label: 'No se observan anomalías' }
    ],
    triggerDetalle: 'anomalias'
  },
  {
    key: 'mecanicoGeneral',
    concepto: 'Estado mecánico general',
    opciones: [
      { value: 'satisfactorio', label: 'Satisfactorio' },
      { value: 'insatisfactorio', label: 'Insatisfactorio' }
    ],
    triggerDetalle: 'insatisfactorio'
  },
  {
    key: 'higienicoGeneral',
    concepto: 'Estado higiénico general',
    opciones: [
      { value: 'satisfactorio', label: 'Satisfactorio' },
      { value: 'insatisfactorio', label: 'Insatisfactorio' }
    ],
    triggerDetalle: 'insatisfactorio'
  },
  {
    key: 'acumuladoresTemperatura',
    concepto: 'Acumuladores · Temperatura',
    opciones: [
      { value: 'consiguen_temperatura', label: 'Consiguen temperatura' },
      { value: 'no_consigue_temperatura', label: 'No consigue temperatura' }
    ],
    triggerDetalle: 'no_consigue_temperatura'
  },
  {
    key: 'acumuladoresDepositosLimpieza',
    concepto: 'Acumuladores y depósitos · Limpieza general',
    opciones: [
      { value: 'satisfactorio', label: 'Satisfactorio' },
      { value: 'insatisfactorio', label: 'Insatisfactorio' }
    ],
    triggerDetalle: 'insatisfactorio'
  },
  {
    key: 'terminalesCorrosionIncrustacion',
    concepto: 'Terminales · Corrosión-incrustación',
    opciones: [
      { value: 'satisfactorio', label: 'Satisfactorio' },
      { value: 'insatisfactorio', label: 'Insatisfactorio' }
    ],
    triggerDetalle: 'insatisfactorio'
  },
  {
    key: 'terminalesAnulados',
    concepto: 'Terminales · Anulados',
    opciones: [
      { value: 'presencia', label: 'Presencia' },
      { value: 'ausencia', label: 'Ausencia' }
    ],
    triggerDetalle: 'ausencia'
  }
]

const buildEmptyRevisiones = () => Object.fromEntries(
  revisionesConfig.map((item) => [item.key, { estado: '', descripcionLocalizacion: '', accionCorrectora: '' }])
)

const registroAnualVacio = () => ({
  fecha: '',
  observaciones: '',
  firmaResponsable: '',
  revisiones: buildEmptyRevisiones()
})

const normalizarRegistroAnual = (registro) => {
  const base = registroAnualVacio()
  if (!registro) return base

  const revisiones = {
    ...base.revisiones,
    ...Object.fromEntries(
      Object.entries(registro.revisiones || {}).map(([key, value]) => [
        key,
        {
          estado: value?.estado || '',
          descripcionLocalizacion: value?.descripcionLocalizacion || '',
          accionCorrectora: value?.accionCorrectora || ''
        }
      ])
    )
  }

  return {
    ...base,
    ...registro,
    revisiones
  }
}

const anualCompleto = (registro) => {
  if (!registro?.fecha || !registro?.firmaResponsable) return false

  return revisionesConfig.every((item) => {
    const revision = registro.revisiones[item.key]
    if (!revision?.estado) return false

    if (revision.estado === item.triggerDetalle) {
      return Boolean(revision.descripcionLocalizacion?.trim() && revision.accionCorrectora?.trim())
    }

    return true
  })
}

function RegistrosAnual({ onBack, userName }) {
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const [showReiniciarModal, setShowReiniciarModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [claveAnioActual, setClaveAnioActual] = useState(obtenerClaveAnioActual())
  const [anioSeleccionado, setAnioSeleccionado] = useState(obtenerClaveAnioActual())
  const [registroAnual, setRegistroAnual] = useState(registroAnualVacio())
  const [aniosDisponibles, setAniosDisponibles] = useState([])

  const completo = anualCompleto(registroAnual)

  const anioTexto = useMemo(() => anioSeleccionado, [anioSeleccionado])

  useEffect(() => {
    const revisarCambioAnio = () => {
      const nuevaClave = obtenerClaveAnioActual()
      setClaveAnioActual((anterior) => {
        if (anterior !== nuevaClave) {
          setAnioSeleccionado(nuevaClave)
        }
        return nuevaClave
      })
    }

    const intervalo = setInterval(revisarCambioAnio, 60 * 1000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const registrosAnuales = JSON.parse(localStorage.getItem('vitalia.anual.registros') || '{}')
    setRegistroAnual(normalizarRegistroAnual(registrosAnuales[anioSeleccionado]))
    const anios = [claveAnioActual, ...Object.keys(registrosAnuales)].sort((a, b) => b.localeCompare(a))
    setAniosDisponibles([...new Set(anios)])
  }, [anioSeleccionado, claveAnioActual])

  const guardarRegistroAnual = (datos) => {
    const registrosAnuales = JSON.parse(localStorage.getItem('vitalia.anual.registros') || '{}')

    const actualizado = {
      ...datos,
      actualizadoPor: userName,
      fechaActualizacion: new Date().toISOString()
    }

    registrosAnuales[anioSeleccionado] = actualizado
    localStorage.setItem('vitalia.anual.registros', JSON.stringify(registrosAnuales))

    setRegistroAnual(actualizado)
    setShowRegistroModal(false)
  }

  const reiniciarAnio = () => {
    const registrosAnuales = JSON.parse(localStorage.getItem('vitalia.anual.registros') || '{}')
    delete registrosAnuales[anioSeleccionado]
    localStorage.setItem('vitalia.anual.registros', JSON.stringify(registrosAnuales))

    setRegistroAnual(registroAnualVacio())
    const anios = [claveAnioActual, ...Object.keys(registrosAnuales)].sort((a, b) => b.localeCompare(a))
    setAniosDisponibles([...new Set(anios)])
    setShowReiniciarModal(false)
  }

  const descargarPdfAnual = (aniosSeleccionados) => {
    const registrosAnuales = JSON.parse(localStorage.getItem('vitalia.anual.registros') || '{}')
    const registrosPorAnio = { ...registrosAnuales, [anioSeleccionado]: registroAnual }

    const aniosValidos = (aniosSeleccionados || []).filter((anio) => registrosPorAnio[anio])
    if (aniosValidos.length === 0) {
      window.alert('No hay datos disponibles para los años seleccionados.')
      return
    }

    descargarAnualPDFPorAnios({
      registrosPorAnio,
      aniosSeleccionados: aniosValidos
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

        <h2 className="text-3xl font-bold text-gray-800">Control Anual</h2>
        <p className="text-gray-600 mt-2">Año seleccionado: {anioTexto}</p>

        <div className="mt-3 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar año</label>
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
          >
            {aniosDisponibles.map((anio) => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
          {anioSeleccionado === claveAnioActual ? (
            <p className="text-xs text-green-700 mt-1 font-medium">Año actual</p>
          ) : (
            <p className="text-xs text-amber-700 mt-1 font-medium">Año histórico</p>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {completo && (
          <button
            onClick={() => setShowRegistroModal(true)}
            className="bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            Editar Registro
          </button>
        )}

        <button
          onClick={() => setShowReiniciarModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          Reiniciar Año
        </button>

        <button
          onClick={() => setShowPdfModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          Descargar PDF
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowRegistroModal(true)}
        className="w-full group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 opacity-10 rounded-bl-full"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Revisión general de los sistemas de AFS - ACS</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${completo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className={`w-2 h-2 rounded-full ${completo ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {completo ? '1/1 año' : '0/1 año'}
            </div>
          </div>

          <p className="text-sm text-gray-600">Completar checklist anual. Las columnas de la derecha solo se rellenan en casos críticos.</p>
        </div>
      </button>

      {showRegistroModal && (
        <RegistroAnualModal
          registro={registroAnual}
          onClose={() => setShowRegistroModal(false)}
          onSave={guardarRegistroAnual}
        />
      )}

      {showReiniciarModal && (
        <ReiniciarAnualModal
          onClose={() => setShowReiniciarModal(false)}
          onConfirm={reiniciarAnio}
          hayRegistro={Boolean(registroAnual.fecha || registroAnual.firmaResponsable)}
        />
      )}

      {showPdfModal && (
        <PDFPeriodosModal
          title="Descargar PDF Anual"
          subtitle="Elige años a incluir"
          periodosDisponibles={aniosDisponibles}
          periodoInicial={anioSeleccionado}
          formatearPeriodo={(anio) => anio}
          onClose={() => setShowPdfModal(false)}
          onDescargar={(periodos) => {
            descargarPdfAnual(periodos)
            setShowPdfModal(false)
          }}
        />
      )}
    </div>
  )
}

function RegistroAnualModal({ registro, onClose, onSave }) {
  const [datos, setDatos] = useState(normalizarRegistroAnual(registro))

  const handleEstadoChange = (key, value) => {
    const cfg = revisionesConfig.find((item) => item.key === key)

    setDatos((prev) => {
      const revisionActual = prev.revisiones[key]
      const resetDetalle = value !== cfg.triggerDetalle

      return {
        ...prev,
        revisiones: {
          ...prev.revisiones,
          [key]: {
            ...revisionActual,
            estado: value,
            descripcionLocalizacion: resetDetalle ? '' : revisionActual.descripcionLocalizacion,
            accionCorrectora: resetDetalle ? '' : revisionActual.accionCorrectora
          }
        }
      }
    })
  }

  const handleTextoRevision = (key, field, value) => {
    setDatos((prev) => ({
      ...prev,
      revisiones: {
        ...prev.revisiones,
        [key]: {
          ...prev.revisiones[key],
          [field]: value
        }
      }
    }))
  }

  const handleGuardar = (e) => {
    e.preventDefault()

    if (!datos.fecha || !datos.firmaResponsable.trim()) {
      window.alert('Fecha y firma responsable son obligatorios.')
      return
    }

    const revisionesOk = revisionesConfig.every((cfg) => {
      const revision = datos.revisiones[cfg.key]
      if (!revision.estado) return false

      if (revision.estado === cfg.triggerDetalle) {
        return Boolean(revision.descripcionLocalizacion.trim() && revision.accionCorrectora.trim())
      }

      return true
    })

    if (!revisionesOk) {
      window.alert('Completa todos los estados. En casos críticos, también descripción-localización y acción correctora.')
      return
    }

    onSave({
      ...datos,
      firmaResponsable: datos.firmaResponsable.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleGuardar} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Revisión General de los Sistemas de AFS - ACS</h3>
              <p className="text-sm text-gray-600">Periodicidad: continuidad · Realización: T. A. J. TORRES E HIJOS, S.L.</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={datos.fecha}
              onChange={(e) => setDatos((prev) => ({ ...prev, fecha: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            {revisionesConfig.map((cfg) => {
              const revision = datos.revisiones[cfg.key]
              const mostrarDerecha = revision.estado === cfg.triggerDetalle

              return (
                <div key={cfg.key} className="grid grid-cols-1 lg:grid-cols-[2fr_2.5fr_2fr_2fr] gap-3 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <div>
                    <p className="font-semibold text-gray-800">{cfg.concepto}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Estado</p>
                    <div className="space-y-2">
                      {cfg.opciones.map((op) => (
                        <label key={op.value} className={`flex items-start gap-3 text-sm p-2.5 rounded-lg border cursor-pointer ${revision.estado === op.value ? 'border-vitalia-purple bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                          <input
                            className="mt-0.5"
                            type="radio"
                            name={`estado-${cfg.key}`}
                            checked={revision.estado === op.value}
                            onChange={() => handleEstadoChange(cfg.key, op.value)}
                          />
                          {op.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Descripción-Localización</p>
                    {mostrarDerecha ? (
                      <textarea
                        value={revision.descripcionLocalizacion}
                        onChange={(e) => handleTextoRevision(cfg.key, 'descripcionLocalizacion', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-vitalia-purple/40 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none bg-white"
                        placeholder="Describe la localización"
                      />
                    ) : (
                      <div className="h-full min-h-20 rounded-lg border border-dashed border-gray-300 bg-gray-100"></div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Acción correctora</p>
                    {mostrarDerecha ? (
                      <textarea
                        value={revision.accionCorrectora}
                        onChange={(e) => handleTextoRevision(cfg.key, 'accionCorrectora', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-vitalia-purple/40 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none bg-white"
                        placeholder="Indica la acción correctora"
                      />
                    ) : (
                      <div className="h-full min-h-20 rounded-lg border border-dashed border-gray-300 bg-gray-100"></div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={datos.observaciones}
              onChange={(e) => setDatos((prev) => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none"
            />
          </div>

          <div className="mt-4 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma responsable</label>
            <input
              type="text"
              value={datos.firmaResponsable}
              onChange={(e) => setDatos((prev) => ({ ...prev, firmaResponsable: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300">
              Guardar registro anual
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReiniciarAnualModal({ onClose, onConfirm, hayRegistro }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">Reiniciar Registro Anual</h3>
          <p className="text-white/80 mt-1">Esto borrará el registro del año seleccionado</p>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {hayRegistro
              ? '¿Seguro que quieres reiniciar este año?'
              : 'No hay un registro anual cargado para este año.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            {hayRegistro && (
              <button onClick={onConfirm} className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300">
                Confirmar Reinicio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrosAnual

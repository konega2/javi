import { useMemo, useState, useEffect } from 'react'
import PDFPeriodosModal from './PDFPeriodosModal'
import { obtenerClaveAnioActual } from '../utils/tareas'
import { descargarMuestrasAnualPDFPorAnios } from '../utils/pdfExport'

const filaVacia = () => ({
  fecha: '',
  puntoMuestreo: '',
  analitica: '',
  temperaturaAfch: '',
  temperaturaAcs: '',
  cloro: '',
  fechaResultado: '',
  resultadoAnalitica: '',
  empresaRecoge: '',
  personaRecoge: ''
})

const registroVacio = () => ({
  observaciones: '',
  fecha: '',
  firmaResponsable: '',
  filas: [filaVacia()]
})

const normalizarRegistro = (registro) => {
  const base = registroVacio()
  if (!registro) return base

  const filas = Array.isArray(registro.filas) && registro.filas.length > 0
    ? registro.filas.map((fila) => ({ ...filaVacia(), ...fila }))
    : [filaVacia()]

  return {
    ...base,
    ...registro,
    filas
  }
}

function RegistrosMuestrasAnual({ onBack, userName }) {
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const [showReiniciarModal, setShowReiniciarModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [claveAnioActual, setClaveAnioActual] = useState(obtenerClaveAnioActual())
  const [anioSeleccionado, setAnioSeleccionado] = useState(obtenerClaveAnioActual())
  const [registro, setRegistro] = useState(registroVacio())
  const [aniosDisponibles, setAniosDisponibles] = useState([])

  const totalFilasConDatos = useMemo(
    () => registro.filas.filter((fila) => Object.values(fila).some((valor) => String(valor || '').trim() !== '')).length,
    [registro]
  )

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
    const registros = JSON.parse(localStorage.getItem('vitalia.muestrasanual.registros') || '{}')
    setRegistro(normalizarRegistro(registros[anioSeleccionado]))
    const anios = [claveAnioActual, ...Object.keys(registros)].sort((a, b) => b.localeCompare(a))
    setAniosDisponibles([...new Set(anios)])
  }, [anioSeleccionado, claveAnioActual])

  const guardarRegistro = (datos) => {
    const registros = JSON.parse(localStorage.getItem('vitalia.muestrasanual.registros') || '{}')

    const actualizado = {
      ...datos,
      actualizadoPor: userName,
      fechaActualizacion: new Date().toISOString()
    }

    registros[anioSeleccionado] = actualizado
    localStorage.setItem('vitalia.muestrasanual.registros', JSON.stringify(registros))
    setRegistro(actualizado)
    setShowRegistroModal(false)
  }

  const reiniciarAnio = () => {
    const registros = JSON.parse(localStorage.getItem('vitalia.muestrasanual.registros') || '{}')
    delete registros[anioSeleccionado]
    localStorage.setItem('vitalia.muestrasanual.registros', JSON.stringify(registros))

    setRegistro(registroVacio())
    const anios = [claveAnioActual, ...Object.keys(registros)].sort((a, b) => b.localeCompare(a))
    setAniosDisponibles([...new Set(anios)])
    setShowReiniciarModal(false)
  }

  const descargarPdf = (aniosSeleccionados) => {
    const registros = JSON.parse(localStorage.getItem('vitalia.muestrasanual.registros') || '{}')
    const registrosPorAnio = { ...registros, [anioSeleccionado]: registro }

    const aniosValidos = (aniosSeleccionados || []).filter((anio) => registrosPorAnio[anio])
    if (aniosValidos.length === 0) {
      window.alert('No hay datos disponibles para los años seleccionados.')
      return
    }

    descargarMuestrasAnualPDFPorAnios({ registrosPorAnio, aniosSeleccionados: aniosValidos })
  }

  return (
    <div>
      <div className="mb-8">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md">
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="font-medium">Volver a Registros</span>
        </button>

        <h2 className="text-3xl font-bold text-gray-800">Recogido Muestras Anual</h2>
        <p className="text-gray-600 mt-2">Registro anual opcional (no obligatorio)</p>

        <div className="mt-3 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar año</label>
          <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent">
            {aniosDisponibles.map((anio) => <option key={anio} value={anio}>{anio}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <button onClick={() => setShowRegistroModal(true)} className="bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300">
          Editar Registro
        </button>
        <button onClick={() => setShowReiniciarModal(true)} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300">
          Reiniciar Año
        </button>
        <button onClick={() => setShowPdfModal(true)} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300">
          Descargar PDF
        </button>
      </div>

      <button type="button" onClick={() => setShowRegistroModal(true)} className="w-full group relative bg-white rounded-2xl shadow-md p-8 text-left overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500 to-teal-600 opacity-10 rounded-bl-full"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Registro de recogida de muestras</h3>
          <p className="text-sm text-gray-600">Filas con datos en este año: <span className="font-semibold">{totalFilasConDatos}</span></p>
        </div>
      </button>

      {showRegistroModal && (
        <RegistroMuestrasModal
          registro={registro}
          onClose={() => setShowRegistroModal(false)}
          onSave={guardarRegistro}
        />
      )}

      {showReiniciarModal && (
        <ReiniciarMuestrasModal
          onClose={() => setShowReiniciarModal(false)}
          onConfirm={reiniciarAnio}
          hayRegistro={Boolean(totalFilasConDatos || registro.observaciones || registro.firmaResponsable || registro.fecha)}
        />
      )}

      {showPdfModal && (
        <PDFPeriodosModal
          title="Descargar PDF Muestras Anual"
          subtitle="Elige años a incluir"
          periodosDisponibles={aniosDisponibles}
          periodoInicial={anioSeleccionado}
          formatearPeriodo={(anio) => anio}
          onClose={() => setShowPdfModal(false)}
          onDescargar={(periodos) => {
            descargarPdf(periodos)
            setShowPdfModal(false)
          }}
        />
      )}
    </div>
  )
}

function RegistroMuestrasModal({ registro, onClose, onSave }) {
  const [datos, setDatos] = useState(normalizarRegistro(registro))

  const actualizarFila = (index, field, value) => {
    setDatos((prev) => ({
      ...prev,
      filas: prev.filas.map((fila, i) => i === index ? { ...fila, [field]: value } : fila)
    }))
  }

  const agregarFila = () => {
    setDatos((prev) => ({ ...prev, filas: [...prev.filas, filaVacia()] }))
  }

  const eliminarFila = (index) => {
    setDatos((prev) => {
      if (prev.filas.length === 1) return prev
      return { ...prev, filas: prev.filas.filter((_, i) => i !== index) }
    })
  }

  const handleGuardar = (e) => {
    e.preventDefault()
    onSave(datos)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleGuardar} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Recogida de Muestras (Anual)</h3>
              <p className="text-sm text-gray-600">Registro opcional anual</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            {datos.filas.map((fila, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Muestra {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => eliminarFila(index)}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                    disabled={datos.filas.length === 1}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input type="date" value={fila.fecha} onChange={(e) => actualizarFila(index, 'fecha', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Punto muestreo</label>
                    <input value={fila.puntoMuestreo} onChange={(e) => actualizarFila(index, 'puntoMuestreo', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Analítica</label>
                    <input value={fila.analitica} onChange={(e) => actualizarFila(index, 'analitica', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Temperatura AFCH</label>
                    <input value={fila.temperaturaAfch} onChange={(e) => actualizarFila(index, 'temperaturaAfch', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Temperatura ACS</label>
                    <input value={fila.temperaturaAcs} onChange={(e) => actualizarFila(index, 'temperaturaAcs', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cloro</label>
                    <input value={fila.cloro} onChange={(e) => actualizarFila(index, 'cloro', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha resultado</label>
                    <input type="date" value={fila.fechaResultado} onChange={(e) => actualizarFila(index, 'fechaResultado', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Resultado analítica</label>
                    <input value={fila.resultadoAnalitica} onChange={(e) => actualizarFila(index, 'resultadoAnalitica', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Empresa recoge</label>
                    <input value={fila.empresaRecoge} onChange={(e) => actualizarFila(index, 'empresaRecoge', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Persona recoge</label>
                    <input value={fila.personaRecoge} onChange={(e) => actualizarFila(index, 'personaRecoge', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button type="button" onClick={agregarFila} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">+ Añadir muestra</button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea value={datos.observaciones} onChange={(e) => setDatos((prev) => ({ ...prev, observaciones: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" value={datos.fecha} onChange={(e) => setDatos((prev) => ({ ...prev, fecha: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma responsable</label>
                <input value={datos.firmaResponsable} onChange={(e) => setDatos((prev) => ({ ...prev, firmaResponsable: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" className="w-full sm:flex-1 bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300">Guardar registro</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReiniciarMuestrasModal({ onClose, onConfirm, hayRegistro }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">Reiniciar Registro Muestras</h3>
          <p className="text-white/80 mt-1">Esto borrará el registro del año seleccionado</p>
        </div>

        <div className="p-6">
          <p className="text-gray-700">{hayRegistro ? '¿Seguro que quieres reiniciar este año?' : 'No hay datos cargados para este año.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            {hayRegistro && <button onClick={onConfirm} className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300">Confirmar Reinicio</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrosMuestrasAnual

import { useMemo, useState } from 'react'

function PDFPeriodosModal({
  title = 'Descargar PDF',
  subtitle = 'Elige los periodos a incluir',
  periodosDisponibles = [],
  periodoInicial,
  formatearPeriodo = (periodo) => periodo,
  onClose,
  onDescargar
}) {
  const [tipo, setTipo] = useState('periodo-seleccionado')
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(periodoInicial || periodosDisponibles[0] || '')
  const [periodosElegidos, setPeriodosElegidos] = useState(periodoInicial ? [periodoInicial] : [])

  const periodos = useMemo(
    () => [...new Set(periodosDisponibles)].sort((a, b) => b.localeCompare(a)),
    [periodosDisponibles]
  )

  const togglePeriodo = (periodo) => {
    setPeriodosElegidos((prev) =>
      prev.includes(periodo)
        ? prev.filter((item) => item !== periodo)
        : [...prev, periodo]
    )
  }

  const handleDescargar = () => {
    let seleccion = []

    if (tipo === 'periodo-seleccionado') {
      seleccion = periodoSeleccionado ? [periodoSeleccionado] : []
    } else if (tipo === 'periodos') {
      seleccion = periodosElegidos
    } else {
      seleccion = periodos
    }

    if (seleccion.length === 0) {
      window.alert('Selecciona al menos un periodo.')
      return
    }

    onDescargar(seleccion)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-white/80 mt-1">{subtitle}</p>
        </div>

        <div className="p-6 space-y-4">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="tipoPdf"
              checked={tipo === 'periodo-seleccionado'}
              onChange={() => setTipo('periodo-seleccionado')}
              className="mt-1"
            />
            <div className="w-full">
              <p className="font-medium text-gray-800">Solo periodo seleccionado</p>
              {tipo === 'periodo-seleccionado' && (
                <select
                  value={periodoSeleccionado}
                  onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
                >
                  {periodos.map((periodo) => (
                    <option key={periodo} value={periodo}>{formatearPeriodo(periodo)}</option>
                  ))}
                </select>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="tipoPdf"
              checked={tipo === 'periodos'}
              onChange={() => setTipo('periodos')}
              className="mt-1"
            />
            <div className="w-full">
              <p className="font-medium text-gray-800">Elegir periodos específicos</p>
              {tipo === 'periodos' && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {periodos.map((periodo) => (
                    <label key={periodo} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={periodosElegidos.includes(periodo)}
                        onChange={() => togglePeriodo(periodo)}
                      />
                      {formatearPeriodo(periodo)}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="tipoPdf"
              checked={tipo === 'todo'}
              onChange={() => setTipo('todo')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-800">Todo</p>
              <p className="text-sm text-gray-600">Incluye todos los periodos disponibles</p>
            </div>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDescargar}
              className="w-full sm:flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFPeriodosModal

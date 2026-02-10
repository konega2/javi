import { useState } from 'react'

function IncidenciasModal({ onClose, onSubmit, punto }) {
  const [datos, setDatos] = useState({
    titulo: '',
    descripcion: '',
    riesgo: 'Bajo',
    foto: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!datos.titulo.trim() || !datos.descripcion.trim()) {
      alert('Por favor, completa el título y la descripción de la incidencia')
      return
    }

    onSubmit(datos)
    onClose()
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

  const nivelesRiesgo = [
    { value: 'Bajo', color: 'text-green-600 bg-green-100', label: 'Bajo' },
    { value: 'Medio', color: 'text-yellow-600 bg-yellow-100', label: 'Medio' },
    { value: 'Alto', color: 'text-red-600 bg-red-100', label: 'Alto' },
    { value: 'Crítico', color: 'text-red-800 bg-red-200', label: 'Crítico' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Reportar Incidencia</h3>
              {punto && (
                <p className="text-gray-600 mt-1">
                  Zona: <span className="font-medium">{punto.zona}</span> - {punto.tipoTerminal}
                </p>
              )}
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

          {/* Formulario */}
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Incidencia *
              </label>
              <input
                type="text"
                required
                value={datos.titulo}
                onChange={(e) => setDatos(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Fuga de agua en grifo principal"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
            </div>

            {/* Nivel de riesgo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Riesgo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {nivelesRiesgo.map((nivel) => (
                  <button
                    key={nivel.value}
                    type="button"
                    onClick={() => setDatos(prev => ({ ...prev, riesgo: nivel.value }))}
                    className={`p-3 rounded-lg text-center font-medium transition-all duration-200 ${
                      datos.riesgo === nivel.value
                        ? `${nivel.color} ring-2 ring-offset-2 ring-vitalia-purple`
                        : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {nivel.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de lo ocurrido *
              </label>
              <textarea
                required
                value={datos.descripcion}
                onChange={(e) => setDatos(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe detalladamente qué ha ocurrido, cuándo lo has detectado y cualquier información relevante..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent resize-none"
              />
            </div>

            {/* Foto opcional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de la incidencia (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vitalia-purple focus:border-transparent"
              />
              {datos.foto && (
                <div className="mt-3">
                  <img 
                    src={datos.foto} 
                    alt="Previsualización" 
                    className="w-full max-w-xs h-40 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Reportar Incidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IncidenciasModal
import { useState, useMemo } from 'react'
import Header from './Header'
import ResidenceCard from './ResidenceCard'

// Datos de ejemplo de residencias
const residencesData = [
  {
    id: 1,
    name: 'Vitalia Favara',
    city: 'Favara',
    province: 'Valencia',
    comunidadAutonoma: 'Comunidad Valenciana',
    address: 'Av. Joan Fuster, 3, 46614 Favara, Valencia',
    phone: '961 234 567',
    capacity: 80,
    image: '/vitalia_favara.png',
    services: ['Enfermería 24h', 'Fisioterapia', 'Comedor', 'Jardín'],
    visits: 1250
  },
  {
    id: 2,
    name: 'Vitalia Gandía',
    city: 'Gandía',
    province: 'Valencia',
    comunidadAutonoma: 'Comunidad Valenciana',
    address: 'Pg. de les Germanies, 99, 46702 Gandia, Valencia',
    phone: '962 345 678',
    capacity: 120,
    image: '/vitalia_gandia.png',
    services: ['Enfermería 24h', 'Terapia ocupacional', 'Actividades', 'Transporte'],
    visits: 980
  }
]

// Opciones de ordenación
const sortOptions = [
  { value: 'nombre-asc', label: 'Nombre (A-Z)' },
  { value: 'nombre-desc', label: 'Nombre (Z-A)' },
  { value: 'visitas', label: 'Más visitadas' },
  { value: 'capacidad-desc', label: 'Mayor capacidad' },
  { value: 'capacidad-asc', label: 'Menor capacidad' }
]

// Lista de comunidades autónomas
const comunidadesAutonomas = [
  'Todas',
  ...Array.from(new Set(residencesData.map(r => r.comunidadAutonoma))).sort()
]

function Dashboard({ userName, onLogout, onSelectResidence }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedComunidad, setSelectedComunidad] = useState('Todas')
  const [sortBy, setSortBy] = useState('nombre-asc')

  // Filtrar y ordenar residencias
  const filteredResidences = useMemo(() => {
    // PASO 1: Filtrar
    let filtered = residencesData

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(residence =>
        residence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residence.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residence.province.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por comunidad autónoma (prevalece sobre todo)
    if (selectedComunidad !== 'Todas') {
      filtered = filtered.filter(residence => residence.comunidadAutonoma === selectedComunidad)
    }

    // PASO 2: Ordenar (solo después de filtrar)
    filtered = [...filtered]

    // Aplicar ordenación
    switch (sortBy) {
      case 'nombre-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'nombre-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'visitas':
        filtered.sort((a, b) => b.visits - a.visits)
        break
      case 'capacidad-desc':
        filtered.sort((a, b) => b.capacity - a.capacity)
        break
      case 'capacidad-asc':
        filtered.sort((a, b) => a.capacity - b.capacity)
        break
      default:
        break
    }

    return filtered
  }, [searchTerm, selectedComunidad, sortBy])

  const handleEnterResidence = (residence) => {
    console.log('Entrando a:', residence.name)
    onSelectResidence(residence)
  }

  const handleSettings = () => {
    console.log('Configurar datos')
    alert('Función de configuración próximamente')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        userName={userName} 
        onLogout={onLogout}
        onSettings={handleSettings}
      />

      {/* Contenido principal */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Título y descripción */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light bg-clip-text text-transparent mb-2">
              Nuestras Residencias
            </h2>
            <p className="text-gray-600">
              Selecciona una residencia para acceder a su información y gestión
            </p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar residencia
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, ciudad o provincia..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-vitalia-purple/50 focus:border-vitalia-purple transition-all outline-none bg-gray-50 hover:bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Comunidad Autónoma */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comunidad Autónoma
                </label>
                <select
                  value={selectedComunidad}
                  onChange={(e) => setSelectedComunidad(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-vitalia-purple/50 focus:border-vitalia-purple transition-all outline-none bg-gray-50 hover:bg-white cursor-pointer"
                >
                  {comunidadesAutonomas.map(comunidad => (
                    <option key={comunidad} value={comunidad}>
                      {comunidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-vitalia-purple/50 focus:border-vitalia-purple transition-all outline-none bg-gray-50 hover:bg-white cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 flex items-center justify-between">
                <span>
                  Mostrando <span className="font-bold text-vitalia-purple">{filteredResidences.length}</span> residencia{filteredResidences.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-500">
                  {sortBy === 'visitas' ? '👁️ Ordenadas por visitas' :
                   sortBy === 'capacidad-desc' ? '📊 Mayor capacidad primero' :
                   sortBy === 'capacidad-asc' ? '📊 Menor capacidad primero' :
                   sortBy === 'nombre-desc' ? '🔤 Z → A' : '🔤 A → Z'}
                </span>
              </p>
            </div>
          </div>

          {/* Grid de residencias */}
          {filteredResidences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResidences.map(residence => (
                <ResidenceCard
                  key={residence.id}
                  residence={residence}
                  onEnter={handleEnterResidence}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron residencias
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
